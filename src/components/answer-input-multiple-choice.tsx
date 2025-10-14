'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MultipleChoiceConfig } from '@/lib/questions';

interface AnswerInputMultipleChoiceProps {
  config: MultipleChoiceConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

export function AnswerInputMultipleChoice({
  config,
  value,
  onChange
}: AnswerInputMultipleChoiceProps) {
  const { options, allowMultiple } = config;

  const handleSingleSelect = (selectedValue: string) => {
    onChange([selectedValue]);
  };

  const handleMultipleSelect = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...value, option]);
    } else {
      onChange(value.filter(v => v !== option));
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
                onCheckedChange={(checked) => handleMultipleSelect(option, checked as boolean)}
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
        </div>
        {value.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {value.length} option{value.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    );
  }

  // Single-select with radio buttons
  return (
    <div className="space-y-3">
      <Label className="text-sm text-gray-700">Select one option:</Label>
      <RadioGroup value={value[0] || ''} onValueChange={handleSingleSelect}>
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
        </div>
      </RadioGroup>
    </div>
  );
}
