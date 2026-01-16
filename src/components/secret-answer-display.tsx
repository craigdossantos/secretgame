"use client";

import { SliderConfig, MultipleChoiceConfig } from "@/lib/questions";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { ImageAnswerDisplay } from "@/components/image-answer-display";
import {
  AnswerType,
  isSliderAnswerData,
  isMultipleChoiceAnswerData,
  isImageUploadAnswerData,
} from "@/types/models";

interface SecretAnswerDisplayProps {
  answerType: AnswerType | string;
  answerData?: unknown;
  body: string; // Fallback text representation
  config?: SliderConfig | MultipleChoiceConfig; // Question config for context
}

export function SecretAnswerDisplay({
  answerType,
  answerData,
  body,
  config,
}: SecretAnswerDisplayProps) {
  // Handle slider answer display with type guard
  if (answerType === "slider" && isSliderAnswerData(answerData)) {
    const sliderValue = answerData.value;

    // If we have config, use it for visual representation
    if (config && "min" in config) {
      const percentage =
        ((sliderValue - config.min) / (config.max - config.min)) * 100;

      return (
        <div className="space-y-3">
          {/* Large Value Display */}
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {sliderValue}
            </div>
            <div className="text-sm text-gray-600">out of {config.max}</div>
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

  // Handle image upload answer display with type guard
  if (answerType === "imageUpload" && isImageUploadAnswerData(answerData)) {
    // Build ImageData object with required fields, using defaults for missing metadata
    const imageData = {
      imageBase64: answerData.imageBase64,
      caption: answerData.caption,
      mimeType: (answerData as { mimeType?: string }).mimeType || "image/jpeg",
      fileSize: (answerData as { fileSize?: number }).fileSize || 0,
      fileName: (answerData as { fileName?: string }).fileName || "image",
    };
    return <ImageAnswerDisplay imageData={imageData} />;
  }

  // Handle multiple choice answer display with type guard
  if (
    answerType === "multipleChoice" &&
    isMultipleChoiceAnswerData(answerData)
  ) {
    const selectedOptions = answerData.selected;

    // If we have config, show all options with visual indicators
    if (config && "options" in config) {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-3">
            {selectedOptions.length === 1
              ? "Selected option:"
              : `Selected ${selectedOptions.length} options:`}
          </div>
          <div className="space-y-2">
            {config.options.map((option, index) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-gray-50 opacity-50"
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm ${isSelected ? "font-medium text-gray-900" : "text-gray-500"}`}
                  >
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Fallback: just list selected options
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">Selected:</div>
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option, index) => (
            <Badge
              key={index}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              {option}
            </Badge>
          ))}
        </div>
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
