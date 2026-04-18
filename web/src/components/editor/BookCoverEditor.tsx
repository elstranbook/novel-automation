'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  Download,
  RotateCcw,
  BookOpen,
  Palette,
  Layers,
  Settings2,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CanvasEngine } from './CanvasEngine';
import { useMockupState } from '@/hooks/useMockupState';
import type { Template } from '@/types';

interface BookCoverEditorProps {
  onBack: () => void;
}

// Book finish options
const BOOK_FINISHES = [
  { value: 'matte', label: 'Matte', description: 'Non-reflective, soft feel' },
  { value: 'glossy', label: 'Glossy', description: 'Shiny, vibrant colors' },
  { value: 'soft_touch', label: 'Soft Touch', description: 'Velvet-like texture' },
];

// Page color options
const PAGE_COLORS = [
  { value: '#FFFAF0', label: 'Cream', hex: '#FFFAF0' },
  { value: '#FFFFFF', label: 'White', hex: '#FFFFFF' },
  { value: '#F5F5DC', label: 'Off-White', hex: '#F5F5DC' },
  { value: '#FFF8DC', label: 'Corn Silk', hex: '#FFF8DC' },
];

export function BookCoverEditor({ onBack }: BookCoverEditorProps) {
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webglRef = useRef<any>(null);
  const [isRendering, setIsRendering] = useState(false);
  
  // Book-specific state
  const [spineWidth, setSpineWidth] = useState(selectedTemplate?.spineWidth || 0.375);
  const [bookFinish, setBookFinish] = useState<'matte' | 'glossy' | 'soft_touch'>('matte');
  const [pageColor, setPageColor] = useState('#FFFAF0');
  const [showPages, setShowPages] = useState(true);
  const [showShadow, setShowShadow] = useState(true);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUserImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDownload = async () => {
    if (!webglRef.current || !selectedTemplate) return;
    
    setIsRendering(true);
    setIsLoading(true);
    
    try {
      // 1. Capture 4K image from WebGL (3840px)
      const dataUrl = await webglRef.current.capture(3840, 3840);
      
      if (!dataUrl) throw new Error('Capture failed');

      // 2. Download
      const link = document.createElement('a');
      const coverSize = selectedTemplate.coverWidth && selectedTemplate.coverHeight
        ? `${selectedTemplate.coverWidth}x${selectedTemplate.coverHeight}`
        : '4k';
      link.download = `${selectedTemplate.slug}-${coverSize}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      console.log('4K Download completed successfully');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download high-res image. Please try again.');
    } finally {
      setIsRendering(false);
      setIsLoading(false);
    }
  };
  
  const handleRemoveDesign = () => {
    setUserImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  if (!selectedTemplate) return null;
  
  const isBookTemplate = selectedTemplate.category === 'novel' || selectedTemplate.coverWidth;
  
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
              Back
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedTemplate.name}
              </h2>
              {isBookTemplate && selectedTemplate.coverWidth && selectedTemplate.coverHeight && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {selectedTemplate.coverWidth}&quot; × {selectedTemplate.coverHeight}&quot; 
                  {selectedTemplate.spineWidth && ` • Spine: ${selectedTemplate.spineWidth}&quot;`}
                </p>
              )}
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
            
            <Button
              onClick={handleDownload}
              disabled={isRendering}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
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
            finish={bookFinish}
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
              className="mt-4 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl p-8 text-center bg-amber-50/50 dark:bg-amber-950/20"
            >
              <BookOpen className="w-12 h-12 mx-auto text-amber-500 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Upload your book cover design
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                {isBookTemplate 
                  ? `Optimal size: ${Math.round((selectedTemplate.coverWidth || 5.5) * 300)} × ${Math.round((selectedTemplate.coverHeight || 8.5) * 300)}px (300 DPI)`
                  : 'Supports PNG, JPG, GIF, WebP'
                }
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/30"
              >
                <Upload className="w-4 h-4" />
                Browse Files
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Side Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4 lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-4 lg:overflow-y-auto lg:max-h-full">
        {/* Book-Specific Controls */}
        {isBookTemplate && (
          <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Book Settings</h3>
            </div>
            
            {/* Spine Width */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">Spine Width</Label>
                <span className="text-sm text-amber-600 dark:text-amber-400">{spineWidth.toFixed(3)}&quot;</span>
              </div>
              <Slider
                value={[spineWidth]}
                onValueChange={([value]) => setSpineWidth(value)}
                min={0.1}
                max={1.5}
                step={0.025}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                ~{Math.round(spineWidth * 100 * 2.5)} pages
              </p>
            </div>
            
            {/* Book Finish */}
            <div className="space-y-2 mb-4">
              <Label className="text-sm text-gray-700 dark:text-gray-300">Cover Finish</Label>
              <Select value={bookFinish} onValueChange={(v) => setBookFinish(v as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_FINISHES.map((finish) => (
                    <SelectItem key={finish.value} value={finish.value}>
                      <div>
                        <span className="font-medium">{finish.label}</span>
                        <span className="text-xs text-gray-500 ml-2">{finish.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Page Color */}
            <div className="space-y-2 mb-4">
              <Label className="text-sm text-gray-700 dark:text-gray-300">Page Color</Label>
              <div className="flex gap-2">
                {PAGE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPageColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      pageColor === color.value
                        ? 'border-amber-500 ring-2 ring-amber-200'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            
            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">Show Page Edges</Label>
                <Switch checked={showPages} onCheckedChange={setShowPages} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">Show Shadow</Label>
                <Switch checked={showShadow} onCheckedChange={setShowShadow} />
              </div>
            </div>
          </div>
        )}
        
        {/* Design Controls */}
        {userImage && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Design Controls</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetDesign}
                className="text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
            
            {/* Position X */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">Position X</Label>
                <span className="text-sm text-gray-500">{Math.round(design.x * 100)}%</span>
              </div>
              <Slider
                value={[design.x * 100]}
                onValueChange={([value]) => updateDesign({ x: value / 100 })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Position Y */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">Position Y</Label>
                <span className="text-sm text-gray-500">{Math.round(design.y * 100)}%</span>
              </div>
              <Slider
                value={[design.y * 100]}
                onValueChange={([value]) => updateDesign({ y: value / 100 })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Scale */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">Scale</Label>
                <span className="text-sm text-gray-500">{Math.round(design.scale * 100)}%</span>
              </div>
              <Slider
                value={[design.scale * 100]}
                onValueChange={([value]) => updateDesign({ scale: value / 100 })}
                min={10}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Rotation */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">Rotation</Label>
                <span className="text-sm text-gray-500">{Math.round(design.rotation)}°</span>
              </div>
              <Slider
                value={[design.rotation + 180]}
                onValueChange={([value]) => updateDesign({ rotation: value - 180 })}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
            </div>
            
            <Separator className="my-4" />
            
            <Button
              variant="outline"
              onClick={handleRemoveDesign}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Remove Design
            </Button>
          </div>
        )}
        
        {/* Cover Color */}
        {selectedTemplate.colorOptions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Cover Color</h3>
            </div>
            
            {selectedTemplate.colorOptions.map((option) => {
              const colors = option.colors as { name: string; hex: string }[];
              return (
                <div key={option.id} className="space-y-2">
                  <Label className="text-sm text-gray-700 dark:text-gray-300">{option.name}</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setColorSelection(option.layerName, color.hex)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          colorSelections[option.layerName] === color.hex
                            ? 'border-amber-500 ring-2 ring-amber-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Template Info */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Template Info</h3>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Category: <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedTemplate.category}</span></p>
            {selectedTemplate.coverWidth && selectedTemplate.coverHeight && (
              <p>Size: <span className="font-medium text-gray-900 dark:text-white">{selectedTemplate.coverWidth}&quot; × {selectedTemplate.coverHeight}&quot;</span></p>
            )}
            {selectedTemplate.warpPreset && (
              <p>View: <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedTemplate.warpPreset.replace(/([A-Z])/g, ' $1')}</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
