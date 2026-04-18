'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ColorOption, ColorSwatch } from '@/types';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  colorOptions: ColorOption[];
  selections: Record<string, string>;
  onChange: (layerName: string, color: string) => void;
}

export function ColorPicker({ colorOptions, selections, onChange }: ColorPickerProps) {
  if (colorOptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
        Colors
      </h3>
      
      {colorOptions.map((option) => {
        const colors = option.colors as ColorSwatch[];
        const selectedColor = selections[option.layerName] || colors[0]?.hex;
        
        return (
          <div key={option.id} className="space-y-3">
            <Label className="text-sm text-gray-600 dark:text-gray-400">
              {option.name}
            </Label>
            
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => onChange(option.layerName, color.hex)}
                  className={cn(
                    'relative w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110',
                    selectedColor === color.hex
                      ? 'border-gray-900 dark:border-white ring-2 ring-gray-900/20 dark:ring-white/20'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {selectedColor === color.hex && (
                    <Check
                      className={cn(
                        'absolute inset-0 m-auto w-4 h-4',
                        isLightColor(color.hex) ? 'text-gray-900' : 'text-white'
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper to determine if a color is light
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
