"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { MultipleChoiceConfig } from "@/lib/questions";
import { toBoolean } from "@/lib/utils";

interface AnswerInputMultipleChoiceProps {
  config: MultipleChoiceConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

export function AnswerInputMultipleChoice({
  config,
  value,
  onChange,
}: AnswerInputMultipleChoiceProps) {
  const { options, allowMultiple, allowCustomOptions } = config;
  const [customOptionText, setCustomOptionText] = useState("");
  const [isCustomSelected, setIsCustomSelected] = useState(false);

  // Check if current value contains a custom option (not in predefined options)
  const customValue = value.find((v) => !options.includes(v)) || "";
  if (customValue && customValue !== customOptionText) {
    setCustomOptionText(customValue);
    setIsCustomSelected(true);
  }

  const handleSingleSelect = (selectedValue: string) => {
    if (selectedValue === "__custom__") {
      setIsCustomSelected(true);
      // Don't update value yet - wait for text input
      onChange([]);
    } else {
      setIsCustomSelected(false);
      onChange([selectedValue]);
    }
  };

  const handleMultipleSelect = (option: string, checked: boolean) => {
    if (option === "__custom__") {
      setIsCustomSelected(checked);
      if (!checked) {
        // Remove custom option if unchecked
        setCustomOptionText("");
        onChange(value.filter((v) => options.includes(v)));
      }
    } else {
      if (checked) {
        // Remove any existing custom value and add selected option
        const newValue = [...value.filter((v) => options.includes(v)), option];
        onChange(newValue);
      } else {
        onChange(value.filter((v) => v !== option));
      }
    }
  };

  const handleCustomTextChange = (text: string) => {
    setCustomOptionText(text);
    if (text.trim()) {
      if (allowMultiple) {
        // Keep predefined selections and add/update custom text
        const baseSelections = value.filter((v) => options.includes(v));
        onChange([...baseSelections, text.trim()]);
      } else {
        // Replace entire value with custom text
        onChange([text.trim()]);
      }
    } else if (allowMultiple) {
      // Clear custom text but keep predefined selections
      onChange(value.filter((v) => options.includes(v)));
    } else {
      // Clear value entirely
      onChange([]);
    }
  };

  if (allowMultiple) {
    // Multi-select with checkboxes
    return (
      <div className="space-y-3">
        <Label className="text-sm text-gray-700">Select all that apply:</Label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Checkbox
                id={`option-${index}`}
                checked={value.includes(option)}
                onCheckedChange={(checked) =>
                  handleMultipleSelect(option, toBoolean(checked))
                }
                className="h-5 w-5 rounded border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label
                htmlFor={`option-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}

          {/* Custom option for multi-select */}
          {allowCustomOptions && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="option-custom"
                  checked={isCustomSelected}
                  onCheckedChange={(checked) =>
                    handleMultipleSelect("__custom__", toBoolean(checked))
                  }
                  className="h-5 w-5 rounded border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor="option-custom"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Other (specify)
                </label>
              </div>
              {isCustomSelected && (
                <Input
                  type="text"
                  placeholder="Enter your custom option..."
                  value={customOptionText}
                  onChange={(e) => handleCustomTextChange(e.target.value)}
                  className="ml-8 h-9"
                  maxLength={100}
                />
              )}
            </div>
          )}
        </div>
        {value.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {value.length} option{value.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    );
  }

  // Single-select with radio buttons
  return (
    <div className="space-y-3">
      <Label className="text-sm text-gray-700">Select one option:</Label>
      <RadioGroup
        value={isCustomSelected ? "__custom__" : value[0] || ""}
        onValueChange={handleSingleSelect}
      >
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <RadioGroupItem
                value={option}
                id={`radio-option-${index}`}
                className="h-5 w-5 border-2 border-gray-300 text-blue-600"
              />
              <label
                htmlFor={`radio-option-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}

          {/* Custom option for single-select */}
          {allowCustomOptions && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="__custom__"
                  id="radio-option-custom"
                  className="h-5 w-5 border-2 border-gray-300 text-blue-600"
                />
                <label
                  htmlFor="radio-option-custom"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Other (specify)
                </label>
              </div>
              {isCustomSelected && (
                <Input
                  type="text"
                  placeholder="Enter your custom option..."
                  value={customOptionText}
                  onChange={(e) => handleCustomTextChange(e.target.value)}
                  className="ml-8 h-9"
                  maxLength={100}
                />
              )}
            </div>
          )}
        </div>
      </RadioGroup>
    </div>
  );
}
