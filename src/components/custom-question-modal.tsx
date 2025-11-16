'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChiliRating } from '@/components/chili-rating';
import {
  QuestionPrompt,
  QuestionCategory,
  QuestionType,
  SliderConfig,
  MultipleChoiceConfig,
  QUESTION_CATEGORIES,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_DESCRIPTIONS,
  createNewQuestion,
  Tag
} from '@/lib/questions';
import { MessageSquare, SlidersHorizontal, CheckSquare, Plus, X } from 'lucide-react';

interface CustomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateQuestion: (question: QuestionPrompt) => void;
  initialQuestion?: QuestionPrompt;
}

export function CustomQuestionModal({
  isOpen,
  onClose,
  onCreateQuestion,
  initialQuestion
}: CustomQuestionModalProps) {
  // Basic question state
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('text');
  const [category, setCategory] = useState<QuestionCategory>('Personal');
  const [spiciness, setSpiciness] = useState(3);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Slider configuration state
  const [sliderMin, setSliderMin] = useState(1);
  const [sliderMax, setSliderMax] = useState(10);
  const [sliderMinLabel, setSliderMinLabel] = useState('Not at all');
  const [sliderMaxLabel, setSliderMaxLabel] = useState('Extremely');

  // Multiple choice configuration state
  const [mcOptions, setMcOptions] = useState<string[]>(['Option 1', 'Option 2', 'Option 3']);
  const [mcAllowMultiple, setMcAllowMultiple] = useState(false);

  // Simple validation - only require question text and max 200 chars
  const isFormValid = questionText.trim().length > 0 && questionText.trim().length <= 200;

  // Populate form when editing existing question
  useEffect(() => {
    if (initialQuestion) {
      setQuestionText(initialQuestion.question);
      setQuestionType(initialQuestion.questionType || 'text');
      setCategory(initialQuestion.category as QuestionCategory);
      setSpiciness(initialQuestion.suggestedLevel);

      // Populate slider config if present
      if (initialQuestion.answerConfig?.type === 'slider') {
        const config = initialQuestion.answerConfig.config;
        setSliderMin(config.min);
        setSliderMax(config.max);
        setSliderMinLabel(config.minLabel);
        setSliderMaxLabel(config.maxLabel);
      }

      // Populate multiple choice config if present
      if (initialQuestion.answerConfig?.type === 'multipleChoice') {
        const config = initialQuestion.answerConfig.config;
        setMcOptions(config.options);
        setMcAllowMultiple(config.allowMultiple);
      }
    }
  }, [initialQuestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    setIsCreating(true);

    try {
      // Add custom tag
      const additionalTags: Tag[] = [
        { name: 'custom', type: 'format' }
      ];

      const newQuestion = initialQuestion
        ? { ...initialQuestion } // Preserve existing question properties when editing
        : createNewQuestion(
            questionText.trim(),
            category,
            spiciness,
            'medium',
            additionalTags
          );

      // Update the question text, category, and spiciness
      newQuestion.question = questionText.trim();
      newQuestion.category = category;
      newQuestion.suggestedLevel = spiciness;

      // Set the selected question type
      newQuestion.questionType = questionType;

      // Add type-specific configuration
      if (questionType === 'slider') {
        newQuestion.answerConfig = {
          type: 'slider',
          config: {
            min: sliderMin,
            max: sliderMax,
            minLabel: sliderMinLabel,
            maxLabel: sliderMaxLabel,
            step: 1
          }
        };
      } else if (questionType === 'multipleChoice') {
        newQuestion.answerConfig = {
          type: 'multipleChoice',
          config: {
            options: mcOptions.filter(opt => opt.trim().length > 0),
            allowMultiple: mcAllowMultiple,
            showDistribution: true
          }
        };
      } else {
        newQuestion.answerConfig = { type: 'text' };
      }

      onCreateQuestion(newQuestion);

      // Reset form
      setQuestionText('');
      setQuestionType('text');
      setCategory('Personal');
      setSpiciness(3);
      setSliderMin(1);
      setSliderMax(10);
      setSliderMinLabel('Not at all');
      setSliderMaxLabel('Extremely');
      setMcOptions(['Option 1', 'Option 2', 'Option 3']);
      setMcAllowMultiple(false);
      onClose();
    } catch {
      setError('Failed to create question. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return;
    setQuestionText('');
    setQuestionType('text');
    setCategory('Personal');
    setSpiciness(3);
    setSliderMin(1);
    setSliderMax(10);
    setSliderMinLabel('Not at all');
    setSliderMaxLabel('Extremely');
    setMcOptions(['Option 1', 'Option 2', 'Option 3']);
    setMcAllowMultiple(false);
    setError('');
    onClose();
  };

  // Question type icon mapping
  const typeIcons = {
    text: MessageSquare,
    slider: SlidersHorizontal,
    multipleChoice: CheckSquare
  };

  // Multiple choice handlers
  const addMcOption = () => {
    setMcOptions([...mcOptions, `Option ${mcOptions.length + 1}`]);
  };

  const removeMcOption = (index: number) => {
    if (mcOptions.length <= 2) return; // Minimum 2 options
    setMcOptions(mcOptions.filter((_, i) => i !== index));
  };

  const updateMcOption = (index: number, value: string) => {
    const updated = [...mcOptions];
    updated[index] = value;
    setMcOptions(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-serif">
            {initialQuestion ? 'Edit Question' : 'Add a Question'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor="question-text">Question *</Label>
              <Textarea
                id="question-text"
                placeholder="What would you like to ask?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={200}
              />
              <div className="flex justify-end text-xs text-muted-foreground">
                <span className={questionText.length > 200 ? 'text-destructive' : ''}>
                  {questionText.length}/200
                </span>
              </div>
            </div>

            {/* Question Type Selector */}
            <div className="space-y-3">
              <Label>Answer Type *</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['text', 'slider', 'multipleChoice'] as QuestionType[]).map((type) => {
                  const Icon = typeIcons[type];
                  const isSelected = questionType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setQuestionType(type)}
                      className={`
                        relative p-4 rounded-lg border transition-all
                        flex flex-col items-center gap-2 text-center
                        ${isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/40 hover:bg-accent/30'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="space-y-0.5">
                        <div className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {QUESTION_TYPE_LABELS[type]}
                        </div>
                        <div className="text-[10px] text-muted-foreground/70 leading-tight">
                          {QUESTION_TYPE_DESCRIPTIONS[type]}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider Configuration (Progressive Disclosure) */}
            {questionType === 'slider' && (
              <div className="space-y-4 p-4 rounded-lg border border-border bg-accent/20">
                <div className="text-sm font-medium text-foreground">Slider Configuration</div>

                {/* Min/Max Values */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="slider-min" className="text-xs">Minimum Value</Label>
                    <Input
                      id="slider-min"
                      type="number"
                      value={sliderMin}
                      onChange={(e) => setSliderMin(Number(e.target.value))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slider-max" className="text-xs">Maximum Value</Label>
                    <Input
                      id="slider-max"
                      type="number"
                      value={sliderMax}
                      onChange={(e) => setSliderMax(Number(e.target.value))}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Min/Max Labels */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="slider-min-label" className="text-xs">Left Label</Label>
                    <Input
                      id="slider-min-label"
                      type="text"
                      value={sliderMinLabel}
                      onChange={(e) => setSliderMinLabel(e.target.value)}
                      placeholder="Not at all"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slider-max-label" className="text-xs">Right Label</Label>
                    <Input
                      id="slider-max-label"
                      type="text"
                      value={sliderMaxLabel}
                      onChange={(e) => setSliderMaxLabel(e.target.value)}
                      placeholder="Extremely"
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground mb-2">Preview:</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{sliderMin} {sliderMinLabel && `(${sliderMinLabel})`}</span>
                    <div className="flex-1 mx-3 h-1 bg-border rounded" />
                    <span className="text-muted-foreground">{sliderMax} {sliderMaxLabel && `(${sliderMaxLabel})`}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Multiple Choice Configuration (Progressive Disclosure) */}
            {questionType === 'multipleChoice' && (
              <div className="space-y-4 p-4 rounded-lg border border-border bg-accent/20">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">Multiple Choice Options</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addMcOption}
                    className="h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  {mcOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        type="text"
                        value={option}
                        onChange={(e) => updateMcOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="h-9 flex-1"
                      />
                      {mcOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMcOption(index)}
                          className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Allow Multiple Selection Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium">Allow Multiple Selections</div>
                    <div className="text-[10px] text-muted-foreground">Users can select more than one option</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMcAllowMultiple(!mcAllowMultiple)}
                    className={`
                      relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                      ${mcAllowMultiple ? 'bg-primary' : 'bg-border'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
                        ${mcAllowMultiple ? 'translate-x-5' : 'translate-x-0.5'}
                      `}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={(value: QuestionCategory) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Spiciness */}
            <div className="space-y-2">
              <Label>Spiciness Level: {spiciness}/5</Label>
              <div className="flex items-center gap-4">
                <ChiliRating
                  rating={spiciness}
                  onRatingChange={setSpiciness}
                  size="md"
                />
                <div className="text-xs text-muted-foreground">
                  {spiciness === 1 && 'Mild - Safe topics'}
                  {spiciness === 2 && 'Medium - Slightly personal'}
                  {spiciness === 3 && 'Hot - Personal but comfortable'}
                  {spiciness === 4 && 'Very Hot - Quite personal'}
                  {spiciness === 5 && 'Extreme - Very private/sensitive'}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isCreating}
                className="flex-1"
              >
                {isCreating ? (initialQuestion ? 'Saving...' : 'Adding...') : (initialQuestion ? 'Save Question' : 'Add Question')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
