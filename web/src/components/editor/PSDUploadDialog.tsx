'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Template } from '@/types';
import {
  Upload,
  FileImage,
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Info,
  Box,
  Palette,
} from 'lucide-react';

interface ParsedLayer {
  name: string;
  type: string;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blendMode?: string;
  opacity?: number;
  isSmartObject?: boolean;
  isColorLayer?: boolean;
}

interface PSDParseResult {
  success: boolean;
  width: number;
  height: number;
  layers: ParsedLayer[];
  smartObjects: number;
  colorLayers: number;
  templateId?: string;
  error?: string;
}

interface PSDUploadDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTemplateCreated?: (template: Template) => void;
}

export function PSDUploadDialog({ open, onOpenChange, onTemplateCreated }: PSDUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);

  // Sync controlled open state
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Handle open change
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseResult, setParseResult] = useState<PSDParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.psd')) {
      // Check signature as fallback
      try {
        const arrayBuffer = await file.slice(0, 4).arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const signature = String.fromCharCode(...bytes);
        if (signature !== '8BPS') {
          setError('Please upload a valid PSD file. The file must be an Adobe Photoshop document (.psd)');
          return;
        }
      } catch (e) {
        setError('Please upload a valid PSD file');
        return;
      }
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setError('File size must be less than 500MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setParseResult(null);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned URL for direct upload to R2
      setUploadProgress(5);
      
      const presignRes = await fetch(`/api/psd/presign?filename=${encodeURIComponent(file.name)}`, {
        method: 'GET',
      });
      
      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get upload URL');
      }
      
      const { uploadUrl, key, psdId } = await presignRes.json();
      setUploadProgress(15);

      // Step 2: Upload directly to R2 (bypasses serverless limit)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15 * 60 * 1000);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/x-photoshop' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      
      setUploadProgress(30);
      console.log('PSD uploaded to R2, now processing...');

      // Step 3: Process the PSD on the server
      setUploadProgress(40);
      
      const processRes = await fetch('/api/psd/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psdKey: key,
          name: file.name.replace(/\.psd$/i, ''),
          category: 'novel',
        }),
      });
      
      setUploadProgress(80);
      
      if (!processRes.ok) {
        const err = await processRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to process PSD');
      }
      
      const result = await processRes.json();
      setUploadProgress(100);

      if (result.success) {
        setParseResult({
          success: true,
          width: result.template?.width || result.width,
          height: result.template?.height || result.height,
          layers: result.template?.layers || [],
          smartObjects: result.layers || 0,
          colorLayers: result.colorLayers || 0,
          templateId: result.templateId,
        });

        // Notify parent if template was created
        if (result.templateId && onTemplateCreated) {
          // Fetch the full template to pass back
          try {
            const res = await fetch(`/api/templates?id=${result.templateId}`);
            const data = await res.json();
            if (data.templates?.[0]) {
              onTemplateCreated(data.templates[0]);
            } else {
              // Fallback: construct minimal template object
              onTemplateCreated({
                id: result.templateId,
                name: file.name.replace(/\.psd$/i, ''),
                slug: result.templateId,
                description: null,
                category: 'custom',
                thumbnail: '',
                baseImage: '',
                width: result.width || 0,
                height: result.height || 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                layers: result.layers || [],
                colorOptions: [],
              });
            }
          } catch {
            // Fallback with minimal data
            onTemplateCreated({
                id: result.templateId,
                name: file.name.replace(/\.psd$/i, ''),
                slug: result.templateId,
                description: null,
                category: 'custom',
                thumbnail: '',
                baseImage: '',
                width: result.width || 0,
                height: result.height || 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                layers: result.layers || [],
                colorOptions: [],
              });
          }
          // Close the dialog
          handleOpenChange(false);
        }
      } else {
        setError(result.error || 'Failed to parse PSD file');
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Upload timed out. This PSD is very large and taking too long to process. Try a smaller file.');
        } else if (err.message === 'Failed to fetch') {
          setError('Network error: Could not reach the server. This can happen if the file is too large for the network or the server connection was lost.');
        } else {
          setError(err.message || 'Failed to upload file. Please try again.');
        }
      } else {
        setError('Failed to upload file. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setParseResult(null);
    setError(null);
    setUploadProgress(0);
  };

  const getLayerTypeIcon = (type: string, isSmartObject?: boolean, isColorLayer?: boolean) => {
    if (isSmartObject) return <Box className="w-4 h-4 text-blue-500" />;
    if (isColorLayer) return <Palette className="w-4 h-4 text-purple-500" />;
    return <Layers className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload PSD</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5 text-amber-500" />
            Upload PSD Template
          </DialogTitle>
          <DialogDescription>
            Upload a Photoshop PSD file with Smart Objects to create a new template.
            The system will automatically detect layers, warp data, and color options.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!isUploading && !parseResult && !error && (
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                ${isDragging
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                  : 'border-gray-300 dark:border-gray-700 hover:border-amber-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".psd,image/vnd.adobe.photoshop,application/octet-stream"
                onChange={handleFileSelect}
                className="hidden"
              />
              <motion.div
                initial={false}
                animate={{ scale: isDragging ? 1.05 : 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {isDragging ? 'Drop your PSD file here' : 'Drag & drop your PSD file'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    or click to browse (files up to 500MB)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">.PSD</Badge>
                  <Badge variant="secondary">Max 500MB</Badge>
                  <Badge variant="secondary">Smart Objects</Badge>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Note: Large files (40MB+) may take 1-2 minutes to process
                </p>
              </motion.div>
            </div>
          )}

          {/* Upload Progress */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Processing PSD file...
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Parsing layers, extracting warp data, and analyzing structure...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-300">
                      Upload Failed
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setError(null);
                    setUploadProgress(0);
                  }}
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success State */}
          <AnimatePresence>
            {parseResult && parseResult.success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Success Header */}
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">
                        PSD Parsed Successfully!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Template created and ready to use
                      </p>
                    </div>
                  </div>
                </div>

                {/* PSD Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {parseResult.width}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Width (px)</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {parseResult.height}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Height (px)</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {parseResult.smartObjects}
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-400">Smart Objects</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {parseResult.colorLayers}
                    </p>
                    <p className="text-xs text-purple-500 dark:text-purple-400">Color Layers</p>
                  </div>
                </div>

                {/* Layers List */}
                {parseResult.layers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Detected Layers ({parseResult.layers.length})
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
                      {parseResult.layers.slice(0, 20).map((layer, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-2 py-1.5 rounded bg-white dark:bg-gray-800 text-sm"
                        >
                          {getLayerTypeIcon(layer.type, layer.isSmartObject, layer.isColorLayer)}
                          <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                            {layer.name}
                          </span>
                          {layer.blendMode && layer.blendMode !== 'normal' && (
                            <Badge variant="outline" className="text-xs">
                              {layer.blendMode}
                            </Badge>
                          )}
                          {layer.isSmartObject && (
                            <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Smart Object
                            </Badge>
                          )}
                          {layer.isColorLayer && (
                            <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              Color
                            </Badge>
                          )}
                        </div>
                      ))}
                      {parseResult.layers.length > 20 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                          +{parseResult.layers.length - 20} more layers...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Your template is now available in the gallery. Smart Objects can be replaced with your designs,
                    and color layers can be customized.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
          {parseResult?.success ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  handleClose();
                  // Optionally navigate to the new template
                }}
              >
                Use Template
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
