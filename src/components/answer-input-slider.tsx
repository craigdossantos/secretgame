'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SliderConfig } from '@/lib/questions';

interface AnswerInputSliderProps {
  config: SliderConfig;
  value: number;
  onChange: (value: number) => void;
}

export function AnswerInputSlider({ config, value, onChange }: AnswerInputSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleValueChange = (newValue: number[]) => {
    const val = newValue[0];
    setLocalValue(val);
    onChange(val);
  };

  // Calculate percentage for visual feedback
  const percentage = ((localValue - config.min) / (config.max - config.min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Your Answer</Label>
        <span className="text-lg font-bold text-blue-600">{localValue}</span>
      </div>

      {/* Slider */}
      <div className="py-2">
        <Slider
          value={[localValue]}
          onValueChange={handleValueChange}
          min={config.min}
          max={config.max}
          step={config.step || 1}
          className="w-full"
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex flex-col items-start">
          <span className="font-medium">{config.min}</span>
          <span className="text-gray-500">{config.minLabel}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-medium">{config.max}</span>
          <span className="text-gray-500">{config.maxLabel}</span>
        </div>
      </div>

      {/* Visual indicator */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        Slide to select a value between {config.min} and {config.max}
      </p>
    </div>
  );
}
