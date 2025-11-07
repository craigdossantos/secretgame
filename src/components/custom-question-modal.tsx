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
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus } from 'lucide-react';
import {
  QuestionPrompt,
  QuestionCategory,
  QuestionType,
  QUESTION_CATEGORIES,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_DESCRIPTIONS,
  createNewQuestion,
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
  // 1. Question Text (first field)
  const [questionText, setQuestionText] = useState('');

  // 2. Question Answer Type (second field)
  const [questionType, setQuestionType] = useState<QuestionType>('text');

  // 3. Type-specific configuration
  // Slider configuration
  const [sliderMin, setSliderMin] = useState(1);
  const [sliderMax, setSliderMax] = useState(10);
  const [sliderMinLabel, setSliderMinLabel] = useState('Not at all');
  const [sliderMaxLabel, setSliderMaxLabel] = useState('Extremely');
  const [sliderPreviewValue, setSliderPreviewValue] = useState(5);

  // Multiple choice configuration
  const [mcOptions, setMcOptions] = useState<string[]>(['Option 1', 'Option 2', 'Option 3']);
  const [mcAllowMultiple, setMcAllowMultiple] = useState(false);
  const [mcUseRoomMembers, setMcUseRoomMembers] = useState(false);

  // 4. Type-specific checkboxes
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [allowImageUpload, setAllowImageUpload] = useState(false);

  // 5. Category and Spiciness (last fields)
  const [category, setCategory] = useState<QuestionCategory>('Personal');
  const [spiciness, setSpiciness] = useState(3);

  // Other state
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const wordCount = questionText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isValidLength = questionText.trim().length >= 10 && questionText.trim().length <= 200;
  const isValidWordCount = wordCount <= 50; // NO minimum, only maximum
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

      // Use custom config based on question type
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
            options: mcUseRoomMembers ? [] : mcOptions.filter(opt => opt.trim().length > 0),
            allowMultiple: mcAllowMultiple,
            useRoomMembers: mcUseRoomMembers,
            showDistribution: true
          }
        };
      } else {
        newQuestion.answerConfig = getDefaultAnswerConfig(questionType);
      }

      // Set anonymous answer permission
      newQuestion.allowAnonymous = allowAnonymous;

      // Set image upload permission (for text answers)
      if (questionType === 'text') {
        newQuestion.allowImageUpload = allowImageUpload;
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
      setMcOptions(['Option 1', 'Option 2', 'Option 3']);
      setMcAllowMultiple(false);
      setMcUseRoomMembers(false);
      setAllowAnonymous(false);
      setAllowImageUpload(false);
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
    setMcOptions(['Option 1', 'Option 2', 'Option 3']);
    setMcAllowMultiple(false);
    setMcUseRoomMembers(false);
    setAllowAnonymous(false);
    setAllowImageUpload(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto art-deco-dialog-border bg-card/95 backdrop-blur-sm !top-[5vh] !translate-y-0">
        <DialogHeader>
          <DialogTitle className="text-foreground art-deco-text text-xl">Create Custom Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Question Text - FIRST FIELD */}
          <div className="space-y-2">
            <Label htmlFor="question-text" className="text-foreground art-deco-text text-sm">Question *</Label>
            <Textarea
              id="question-text"
              placeholder="What would you like to ask? Keep it engaging and thoughtful..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="min-h-[100px] resize-none bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground"
              maxLength={200}
            />
            <div className="flex justify-between text-xs">
              <span className={wordCount > 50 ? 'text-destructive' : 'text-muted-foreground'}>
                {wordCount}/50 words {wordCount > 50 && '(max exceeded)'}
              </span>
              <span className={questionText.length > 200 ? 'text-destructive' : 'text-muted-foreground'}>
                {questionText.length}/200 characters
              </span>
            </div>
          </div>

          {/* 2. Question Answer Type - SECOND FIELD */}
          <div className="space-y-2">
            <Label className="text-foreground art-deco-text text-sm">Question Answer Type *</Label>
            <Select value={questionType} onValueChange={(value: QuestionType) => setQuestionType(value)}>
              <SelectTrigger className="bg-secondary/30 border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                  <SelectItem key={type} value={type} className="text-foreground">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{QUESTION_TYPE_LABELS[type]}</span>
                      <span className="text-xs text-muted-foreground">{QUESTION_TYPE_DESCRIPTIONS[type]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. TYPE-SPECIFIC CONFIGURATION */}

          {/* Slider Configuration */}
          {questionType === 'slider' && (
            <div className="space-y-4 p-4 art-deco-border bg-card/30 backdrop-blur-sm">
              <h4 className="text-sm font-semibold text-foreground art-deco-text">Slider Configuration</h4>

              {/* Min/Max Values */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="slider-min" className="text-xs text-foreground">Min Value</Label>
                  <Input
                    id="slider-min"
                    type="number"
                    value={sliderMin}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setSliderMin(val);
                      if (sliderPreviewValue < val) setSliderPreviewValue(val);
                    }}
                    className="h-9 bg-secondary/30 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slider-max" className="text-xs text-foreground">Max Value</Label>
                  <Input
                    id="slider-max"
                    type="number"
                    value={sliderMax}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setSliderMax(val);
                      if (sliderPreviewValue > val) setSliderPreviewValue(val);
                    }}
                    className="h-9 bg-secondary/30 border-border text-foreground"
                  />
                </div>
              </div>

              {/* Labels */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="slider-min-label" className="text-xs text-foreground">Min Label</Label>
                  <Input
                    id="slider-min-label"
                    placeholder="e.g., Cold"
                    value={sliderMinLabel}
                    onChange={(e) => setSliderMinLabel(e.target.value)}
                    maxLength={30}
                    className="h-9 bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slider-max-label" className="text-xs text-foreground">Max Label</Label>
                  <Input
                    id="slider-max-label"
                    placeholder="e.g., Hot"
                    value={sliderMaxLabel}
                    onChange={(e) => setSliderMaxLabel(e.target.value)}
                    maxLength={30}
                    className="h-9 bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Slider Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-foreground">Preview</Label>
                  <span className="text-sm font-bold text-primary">{sliderPreviewValue}</span>
                </div>
                <Slider
                  value={[sliderPreviewValue]}
                  onValueChange={(val) => setSliderPreviewValue(val[0])}
                  min={sliderMin}
                  max={sliderMax}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{sliderMin}</span>
                    <span>{sliderMinLabel}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-foreground">{sliderMax}</span>
                    <span>{sliderMaxLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Multiple Choice Configuration */}
          {questionType === 'multipleChoice' && (
            <div className="space-y-4 p-4 art-deco-border bg-card/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground art-deco-text">Multiple Choice Configuration</h4>
              </div>

              {/* Use Room Members Checkbox */}
              <div className="flex items-center space-x-3 p-3 art-deco-border bg-card/20">
                <Checkbox
                  id="use-room-members"
                  checked={mcUseRoomMembers}
                  onCheckedChange={(checked) => setMcUseRoomMembers(checked as boolean)}
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  <label
                    htmlFor="use-room-members"
                    className="text-sm font-medium text-foreground cursor-pointer block"
                  >
                    Use room members as options
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Auto-populate with member names (you can still edit them)
                  </p>
                </div>
              </div>

              {/* Options List - Only show if not using room members */}
              {!mcUseRoomMembers && (
                <div className="space-y-2">
                  <Label className="text-xs text-foreground">Options (minimum 2):</Label>
                  {mcOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...mcOptions];
                          newOptions[index] = e.target.value;
                          setMcOptions(newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                        maxLength={100}
                        className="h-9 flex-1 bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground"
                      />
                      {mcOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setMcOptions(mcOptions.filter((_, i) => i !== index))}
                          className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Add Option Button */}
                  {mcOptions.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMcOptions([...mcOptions, `Option ${mcOptions.length + 1}`])}
                      className="w-full h-9 text-xs border-border text-foreground hover:bg-primary/10"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Option
                    </Button>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {mcUseRoomMembers
                  ? 'Options will be populated from room members'
                  : `${mcOptions.length} option${mcOptions.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          )}

          {/* 4. TYPE-SPECIFIC CHECKBOXES */}
          <div className="space-y-3">
            {/* Allow Multiple Selections - For Multiple Choice only */}
            {questionType === 'multipleChoice' && (
              <div className="flex items-center space-x-3 p-3 art-deco-border bg-card/20">
                <Checkbox
                  id="allow-multiple"
                  checked={mcAllowMultiple}
                  onCheckedChange={(checked) => setMcAllowMultiple(checked as boolean)}
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  <label
                    htmlFor="allow-multiple"
                    className="text-sm font-medium text-foreground cursor-pointer block"
                  >
                    Allow multiple selections
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Users can select more than one option
                  </p>
                </div>
              </div>
            )}

            {/* Allow Anonymous Answers - For all types */}
            <div className="flex items-center space-x-3 p-3 art-deco-border bg-card/20">
              <Checkbox
                id="allow-anonymous"
                checked={allowAnonymous}
                onCheckedChange={(checked) => setAllowAnonymous(checked as boolean)}
                className="h-5 w-5"
              />
              <div className="flex-1">
                <label
                  htmlFor="allow-anonymous"
                  className="text-sm font-medium text-foreground cursor-pointer block"
                >
                  Allow anonymous answers
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Users can choose to answer without revealing their identity
                </p>
              </div>
            </div>

            {/* Allow Image Upload - For Text answers only */}
            {questionType === 'text' && (
              <div className="flex items-center space-x-3 p-3 art-deco-border bg-card/20">
                <Checkbox
                  id="allow-image-upload"
                  checked={allowImageUpload}
                  onCheckedChange={(checked) => setAllowImageUpload(checked as boolean)}
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  <label
                    htmlFor="allow-image-upload"
                    className="text-sm font-medium text-foreground cursor-pointer block"
                  >
                    Allow image upload
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Users can optionally upload an image with their text answer
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 5. CATEGORY - Fifth field */}
          <div className="space-y-2">
            <Label className="text-foreground art-deco-text text-sm">Category *</Label>
            <Select value={category} onValueChange={(value: QuestionCategory) => setCategory(value)}>
              <SelectTrigger className="bg-secondary/30 border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {QUESTION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-foreground">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="artdeco"
                        className="text-xs"
                      >
                        {cat}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 6. SPICINESS LEVEL - Sixth field (last) */}
          <div className="space-y-2">
            <Label className="text-foreground art-deco-text text-sm">Spiciness Level: {spiciness}/5</Label>
            <div className="flex items-center gap-4">
              <ChiliRating
                rating={spiciness}
                onRatingChange={setSpiciness}
                size="md"
              />
              <div className="text-sm text-muted-foreground">
                {spiciness === 1 && 'Mild - Safe topics'}
                {spiciness === 2 && 'Medium - Slightly personal'}
                {spiciness === 3 && 'Hot - Personal but comfortable'}
                {spiciness === 4 && 'Very Hot - Quite personal'}
                {spiciness === 5 && 'Extreme - Very private/sensitive'}
              </div>
            </div>
          </div>

          {/* Preview */}
          {questionText.trim() && (
            <div className="art-deco-border bg-card/30 backdrop-blur-sm p-4">
              <h4 className="text-sm font-medium text-foreground mb-2 art-deco-text">Preview:</h4>
              <div className="art-deco-border bg-card/50 p-4">
                <p className="text-foreground text-sm font-medium mb-3">
                  {questionText.trim()}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="artdeco"
                      className="text-xs"
                    >
                      {category}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-secondary/30 text-foreground border-border">
                      Custom
                    </Badge>
                  </div>
                  <ChiliRating rating={spiciness} readonly size="sm" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="border-border text-foreground hover:bg-primary/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isCreating}
              className="min-w-[100px] art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 art-deco-text"
            >
              {isCreating ? 'Creating...' : 'Create Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
