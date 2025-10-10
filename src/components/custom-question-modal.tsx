'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChiliRating } from '@/components/chili-rating';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  QuestionPrompt,
  QuestionCategory,
  QuestionType,
  QUESTION_CATEGORIES,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_DESCRIPTIONS,
  createNewQuestion,
  categoryToTag,
  getTagStyles,
  getDefaultAnswerConfig,
  Tag
} from '@/lib/questions';

interface CustomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateQuestion: (question: QuestionPrompt) => void;
}

export function CustomQuestionModal({
  isOpen,
  onClose,
  onCreateQuestion
}: CustomQuestionModalProps) {
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState<QuestionCategory>('Personal');
  const [questionType, setQuestionType] = useState<QuestionType>('text');
  const [spiciness, setSpiciness] = useState(3);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Slider configuration state
  const [sliderMin, setSliderMin] = useState(1);
  const [sliderMax, setSliderMax] = useState(10);
  const [sliderMinLabel, setSliderMinLabel] = useState('Not at all');
  const [sliderMaxLabel, setSliderMaxLabel] = useState('Extremely');
  const [sliderPreviewValue, setSliderPreviewValue] = useState(5);

  const wordCount = questionText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isValidLength = questionText.trim().length >= 10 && questionText.trim().length <= 200;
  const isValidWordCount = wordCount >= 5 && wordCount <= 50;
  const isFormValid = questionText.trim() && isValidLength && isValidWordCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    setIsCreating(true);

    try {
      // Add custom tag to indicate this is user-created
      const additionalTags: Tag[] = [
        { name: 'custom', type: 'format' }
      ];

      const newQuestion = createNewQuestion(
        questionText.trim(),
        category,
        spiciness,
        difficulty,
        additionalTags
      );

      // Add question type and answer config
      newQuestion.questionType = questionType;

      // Use custom slider config if slider type
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
      } else {
        newQuestion.answerConfig = getDefaultAnswerConfig(questionType);
      }

      onCreateQuestion(newQuestion);

      // Reset form
      setQuestionText('');
      setCategory('Personal');
      setQuestionType('text');
      setSpiciness(3);
      setDifficulty('medium');
      setSliderMin(1);
      setSliderMax(10);
      setSliderMinLabel('Not at all');
      setSliderMaxLabel('Extremely');
      setSliderPreviewValue(5);
    } catch {
      setError('Failed to create question. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return;

    setQuestionText('');
    setCategory('Personal');
    setQuestionType('text');
    setSpiciness(3);
    setDifficulty('medium');
    setSliderMin(1);
    setSliderMax(10);
    setSliderMinLabel('Not at all');
    setSliderMaxLabel('Extremely');
    setSliderPreviewValue(5);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Custom Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Type Selection */}
          <div className="space-y-2">
            <Label>Question Type *</Label>
            <Select value={questionType} onValueChange={(value: QuestionType) => setQuestionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{QUESTION_TYPE_LABELS[type]}</span>
                      <span className="text-xs text-gray-500">{QUESTION_TYPE_DESCRIPTIONS[type]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {QUESTION_TYPE_DESCRIPTIONS[questionType]}
            </p>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question-text">Question *</Label>
            <Textarea
              id="question-text"
              placeholder="What would you like to ask? Keep it engaging and thoughtful..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={200}
            />
            <div className="flex justify-between text-xs">
              <span className={wordCount < 5 || wordCount > 50 ? 'text-red-500' : 'text-gray-500'}>
                {wordCount}/50 words
              </span>
              <span className={questionText.length > 200 ? 'text-red-500' : 'text-gray-500'}>
                {questionText.length}/200 characters
              </span>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(value: QuestionCategory) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getTagStyles(categoryToTag(cat))}`}
                      >
                        {cat}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Spiciness Level */}
          <div className="space-y-2">
            <Label>Spiciness Level: {spiciness}/5</Label>
            <div className="flex items-center gap-4">
              <ChiliRating
                rating={spiciness}
                onRatingChange={setSpiciness}
                size="md"
              />
              <div className="text-sm text-gray-600">
                {spiciness === 1 && 'Mild - Safe topics'}
                {spiciness === 2 && 'Medium - Slightly personal'}
                {spiciness === 3 && 'Hot - Personal but comfortable'}
                {spiciness === 4 && 'Very Hot - Quite personal'}
                {spiciness === 5 && 'Extreme - Very private/sensitive'}
              </div>
            </div>
          </div>

          {/* Difficulty Level - Hidden for now */}
          {/* <div className="space-y-2">
            <Label>Response Difficulty</Label>
            <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy - Quick to answer</SelectItem>
                <SelectItem value="medium">Medium - Requires some thought</SelectItem>
                <SelectItem value="hard">Hard - Deep reflection needed</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Slider Configuration - Only show for slider type */}
          {questionType === 'slider' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-900">Slider Configuration</h4>

              {/* Min/Max Values */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="slider-min" className="text-xs">Min Value</Label>
                  <Input
                    id="slider-min"
                    type="number"
                    value={sliderMin}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setSliderMin(val);
                      if (sliderPreviewValue < val) setSliderPreviewValue(val);
                    }}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slider-max" className="text-xs">Max Value</Label>
                  <Input
                    id="slider-max"
                    type="number"
                    value={sliderMax}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setSliderMax(val);
                      if (sliderPreviewValue > val) setSliderPreviewValue(val);
                    }}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Labels */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="slider-min-label" className="text-xs">Min Label</Label>
                  <Input
                    id="slider-min-label"
                    placeholder="e.g., Cold"
                    value={sliderMinLabel}
                    onChange={(e) => setSliderMinLabel(e.target.value)}
                    maxLength={30}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slider-max-label" className="text-xs">Max Label</Label>
                  <Input
                    id="slider-max-label"
                    placeholder="e.g., Hot"
                    value={sliderMaxLabel}
                    onChange={(e) => setSliderMaxLabel(e.target.value)}
                    maxLength={30}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Slider Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Preview</Label>
                  <span className="text-sm font-bold text-blue-600">{sliderPreviewValue}</span>
                </div>
                <Slider
                  value={[sliderPreviewValue]}
                  onValueChange={(val) => setSliderPreviewValue(val[0])}
                  min={sliderMin}
                  max={sliderMax}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex flex-col">
                    <span className="font-medium">{sliderMin}</span>
                    <span>{sliderMinLabel}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">{sliderMax}</span>
                    <span>{sliderMaxLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {questionText.trim() && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Preview:</h4>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-900 text-sm font-medium mb-3">
                  {questionText.trim()}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getTagStyles(categoryToTag(category))}`}
                    >
                      {category}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 border-gray-200">
                      Custom
                    </Badge>
                  </div>
                  <ChiliRating rating={spiciness} readonly size="sm" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isCreating}
              className="min-w-[100px]"
            >
              {isCreating ? 'Creating...' : 'Create Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}