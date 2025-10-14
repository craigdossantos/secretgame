'use client';

import { SliderConfig } from '@/lib/questions';

interface SecretAnswerDisplayProps {
  answerType: string;
  answerData?: unknown;
  body: string; // Fallback text representation
  config?: SliderConfig; // Question config for context
}

export function SecretAnswerDisplay({
  answerType,
  answerData,
  body,
  config
}: SecretAnswerDisplayProps) {
  // Handle slider answer display
  if (answerType === 'slider' && answerData && typeof answerData === 'object') {
    const sliderAnswer = answerData as { value: number };
    const sliderValue = sliderAnswer.value;

    // If we have config, use it for visual representation
    if (config) {
      const percentage = ((sliderValue - config.min) / (config.max - config.min)) * 100;

      return (
        <div className="space-y-3">
          {/* Large Value Display */}
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {sliderValue}
            </div>
            <div className="text-sm text-gray-600">
              out of {config.max}
            </div>
          </div>

          {/* Visual Bar */}
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Labels */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex flex-col">
              <span className="font-medium text-gray-700">{config.min}</span>
              <span>{config.minLabel}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-medium text-gray-700">{config.max}</span>
              <span>{config.maxLabel}</span>
            </div>
          </div>
        </div>
      );
    }

    // Fallback: just show the number if no config
    return (
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-1">
          {sliderValue}
        </div>
        <div className="text-sm text-gray-500">Slider answer</div>
      </div>
    );
  }

  // Default: show text body
  return (
    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
      {body}
    </p>
  );
}
