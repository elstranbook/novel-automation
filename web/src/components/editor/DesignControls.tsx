'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Move, Maximize2, RotateCw } from 'lucide-react';
import type { DesignState } from '@/types';

interface DesignControlsProps {
  design: DesignState;
  onChange: (updates: Partial<DesignState>) => void;
  onReset: () => void;
}

export function DesignControls({ design, onChange, onReset }: DesignControlsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Design Controls
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Position X */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Move className="w-4 h-4" />
            Position X
          </Label>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {Math.round(design.x * 100)}%
          </span>
        </div>
        <Slider
          value={[design.x * 100]}
          onValueChange={([value]) => onChange({ x: value / 100 })}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Position Y */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Move className="w-4 h-4" />
            Position Y
          </Label>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {Math.round(design.y * 100)}%
          </span>
        </div>
        <Slider
          value={[design.y * 100]}
          onValueChange={([value]) => onChange({ y: value / 100 })}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Scale */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Maximize2 className="w-4 h-4" />
            Scale
          </Label>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {Math.round(design.scale * 100)}%
          </span>
        </div>
        <Slider
          value={[design.scale * 100]}
          onValueChange={([value]) => onChange({ scale: value / 100 })}
          min={5}
          max={80}
          step={1}
          className="w-full"
        />
      </div>

      {/* Rotation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <RotateCw className="w-4 h-4" />
            Rotation
          </Label>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {Math.round(design.rotation)}°
          </span>
        </div>
        <Slider
          value={[design.rotation + 180]}
          onValueChange={([value]) => onChange({ rotation: value - 180 })}
          min={0}
          max={360}
          step={1}
          className="w-full"
        />
      </div>

      {/* Quick actions */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange({ rotation: 0 })}
            className="text-xs"
          >
            0°
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange({ rotation: 90 })}
            className="text-xs"
          >
            90°
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange({ rotation: 180 })}
            className="text-xs"
          >
            180°
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange({ rotation: 270 })}
            className="text-xs"
          >
            270°
          </Button>
        </div>
      </div>
    </div>
  );
}
