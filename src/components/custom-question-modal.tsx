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
import {
  QuestionPrompt,
  QuestionCategory,
  QUESTION_CATEGORIES,
  createNewQuestion,
  categoryToTag,
  getTagStyles,
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
  const [spiciness, setSpiciness] = useState(3);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

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

      onCreateQuestion(newQuestion);

      // Reset form
      setQuestionText('');
      setCategory('Personal');
      setSpiciness(3);
      setDifficulty('medium');
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
    setSpiciness(3);
    setDifficulty('medium');
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

          {/* Difficulty Level */}
          <div className="space-y-2">
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
          </div>

          {/* Preview */}
          {questionText.trim() && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Preview:</h4>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-900 text-sm font-medium mb-3">
                  {questionText.trim()}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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