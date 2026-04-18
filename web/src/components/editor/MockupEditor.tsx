'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CanvasEngine } from './CanvasEngine';
import { DesignControls } from './DesignControls';
import { ColorPicker } from './ColorPicker';
import { BookCoverEditor } from './BookCoverEditor';
import { useMockupState } from '@/hooks/useMockupState';
import {
  Upload,
  Download,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MockupEditorProps {
  onBack: () => void;
}

export function MockupEditor({ onBack }: MockupEditorProps) {
  const {
    selectedTemplate,
    userImage,
    design,
    colorSelections,
    updateDesign,
    resetDesign,
    setColorSelection,
    setUserImage,
    setIsLoading,
  } = useMockupState();
  
  // Hooks must be called before any conditional returns
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webglRef = useRef<any>(null);
  const [isRendering, setIsRendering] = useState(false);
  
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUserImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [setUserImage]);
  
  const handleDownload = useCallback(async () => {
    if (!webglRef.current || !selectedTemplate) return;
    
    setIsRendering(true);
    setIsLoading(true);
    
    try {
      // 1. Capture 4K image from WebGL (3840px)
      const dataUrl = await webglRef.current.capture(3840, 3840);
      
      if (!dataUrl) throw new Error('Capture failed');
      
      // 2. Trigger Download
      const link = document.createElement('a');
      link.download = `${selectedTemplate.slug}-mockup-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setIsRendering(false);
      setIsLoading(false);
    }
  }, [selectedTemplate, setIsLoading]);
  
  const handleRemoveDesign = useCallback(() => {
    setUserImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setUserImage]);
  
  // Check if this is a book template
  const isBookTemplate = selectedTemplate?.category === 'novel' || selectedTemplate?.coverWidth;
  
  // Early returns after all hooks are called
  if (!selectedTemplate) return null;
  
  // Use BookCoverEditor for book templates
  if (isBookTemplate) {
    return <BookCoverEditor onBack={onBack} />;
  }
  
  // Standard editor for other templates
  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="lg:hidden"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedTemplate.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedTemplate.category}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Design</span>
            </Button>
            
            {userImage && (
              <Button
                variant="outline"
                onClick={handleRemoveDesign}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            )}
            
            <Button
              onClick={handleDownload}
              disabled={isRendering}
              className="gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              {isRendering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Rendering...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 min-h-0">
          <CanvasEngine
            template={selectedTemplate}
            userImage={userImage}
            design={design}
            colorSelections={colorSelections}
            onWebGLReady={(handle) => (webglRef.current = handle)}
            onDesignChange={updateDesign}
          />
        </div>
        
        {/* Upload prompt */}
        <AnimatePresence>
          {!userImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center"
            >
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your design here, or
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Browse Files
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Supports PNG, JPG, GIF, WebP (max 10MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Side Panel */}
      <div className="w-full lg:w-72 flex flex-col gap-6 lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-4 lg:overflow-y-auto lg:max-h-full">
        {/* Color Picker */}
        {selectedTemplate.colorOptions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <ColorPicker
              colorOptions={selectedTemplate.colorOptions as any}
              selections={colorSelections}
              onChange={setColorSelection}
            />
          </div>
        )}
        
        {/* Design Controls */}
        {userImage && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <DesignControls
              design={design}
              onChange={updateDesign}
              onReset={resetDesign}
            />
          </div>
        )}
      </div>
    </div>
  );
}
