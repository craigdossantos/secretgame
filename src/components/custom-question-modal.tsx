'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChiliRating } from '@/components/chili-rating';
import {
  QuestionPrompt,
  QuestionCategory,
  QuestionType,
  QUESTION_CATEGORIES,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_DESCRIPTIONS,
  createNewQuestion,
  Tag
} from '@/lib/questions';
import { MessageSquare, SlidersHorizontal, CheckSquare } from 'lucide-react';

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
  // MVP state - only essentials
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('text');
  const [category, setCategory] = useState<QuestionCategory>('Personal');
  const [spiciness, setSpiciness] = useState(3);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Simple validation
  const wordCount = questionText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isValidLength = questionText.trim().length >= 10 && questionText.trim().length <= 200;
  const isValidWordCount = wordCount <= 50;
  const isFormValid = questionText.trim() && isValidLength && isValidWordCount;

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

      const newQuestion = createNewQuestion(
        questionText.trim(),
        category,
        spiciness,
        'medium',
        additionalTags
      );

      // Set the selected question type
      newQuestion.questionType = questionType;

      onCreateQuestion(newQuestion);

      // Reset form
      setQuestionText('');
      setQuestionType('text');
      setCategory('Personal');
      setSpiciness(3);
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
    setError('');
    onClose();
  };

  // Question type icon mapping
  const typeIcons = {
    text: MessageSquare,
    slider: SlidersHorizontal,
    multipleChoice: CheckSquare
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-serif">
            Create Custom Question
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className={wordCount > 50 ? 'text-destructive' : ''}>
                  {wordCount}/50 words
                </span>
                <span className={questionText.length > 200 ? 'text-destructive' : ''}>
                  {questionText.length}/200 characters
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
                        relative p-4 rounded-lg border-2 transition-all
                        flex flex-col items-center gap-2 text-center
                        ${isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                        }
                      `}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="space-y-1">
                        <div className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {QUESTION_TYPE_LABELS[type]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {QUESTION_TYPE_DESCRIPTIONS[type]}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

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
                <div className="text-sm text-muted-foreground">
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
            <div className="flex gap-2 pt-4">
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
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
