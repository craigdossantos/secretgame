'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ChiliRating } from '@/components/chili-rating';
import { AnswerInputSlider } from '@/components/answer-input-slider';
import { AnswerInputMultipleChoice } from '@/components/answer-input-multiple-choice';
import { QuestionPrompt, getTagStyles, SliderConfig, MultipleChoiceConfig } from '@/lib/questions';

interface QuestionCardProps {
  question: QuestionPrompt;
  onSubmit?: (answer: {
    questionId: string;
    body: string;
    selfRating: number;
    importance: number;
    answerType?: string;
    answerData?: unknown;
  }) => void;
  onSkip?: (questionId: string) => void;
  onRateSpiciness?: (questionId: string, spiciness: number) => void;
  userSpicinessRating?: number;
  isAnswered?: boolean;
}

export function QuestionCard({
  question,
  onSubmit,
  onSkip,
  onRateSpiciness,
  userSpicinessRating = 0,
  isAnswered = false
}: QuestionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [body, setBody] = useState('');
  const [selfRating, setSelfRating] = useState(question.suggestedLevel);
  const [importance, setImportance] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question type and configs
  const questionType = question.questionType || 'text';

  // Slider-specific state
  const sliderConfig = questionType === 'slider' && question.answerConfig?.type === 'slider'
    ? question.answerConfig.config
    : { min: 1, max: 10, minLabel: 'Low', maxLabel: 'High', step: 1 };
  const [sliderValue, setSliderValue] = useState(
    questionType === 'slider' ? Math.floor((sliderConfig.min + sliderConfig.max) / 2) : 1
  );

  // Multiple choice-specific state
  const mcConfig = questionType === 'multipleChoice' && question.answerConfig?.type === 'multipleChoice'
    ? question.answerConfig.config
    : { options: ['Option 1', 'Option 2'], allowMultiple: false, showDistribution: true };
  const [mcSelected, setMcSelected] = useState<string[]>([]);

  const wordCount = body.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isValidWordCount = wordCount <= 100 && wordCount > 0;

  // Validation based on question type
  const isValidAnswer =
    questionType === 'text' ? isValidWordCount :
    questionType === 'multipleChoice' ? mcSelected.length > 0 :
    true;

  const handleFlip = () => {
    // Don't flip for slider or MC questions - they answer inline
    if (questionType === 'slider' || questionType === 'multipleChoice') return;
    // Allow flipping even if answered (for editing)
    setIsFlipped(!isFlipped);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    onSkip?.(question.id);
  };

  const handleSubmit = async () => {
    if (!isValidAnswer) return;

    setIsSubmitting(true);
    try {
      // Build answer based on question type
      const answer: {
        questionId: string;
        body: string;
        selfRating: number;
        importance: number;
        answerType?: string;
        answerData?: unknown;
      } = {
        questionId: question.id,
        body:
          questionType === 'slider' ? `Slider answer: ${sliderValue}` :
          questionType === 'multipleChoice' ? `Selected: ${mcSelected.join(', ')}` :
          body.trim(),
        selfRating,
        importance,
      };

      // Add typed answer data
      if (questionType === 'slider') {
        answer.answerType = 'slider';
        answer.answerData = { value: sliderValue };
      } else if (questionType === 'multipleChoice') {
        answer.answerType = 'multipleChoice';
        answer.answerData = { selected: mcSelected };
      } else {
        answer.answerType = 'text';
      }

      await onSubmit?.(answer);

      // Don't reset - keep form filled for potential edits
      // Just flip back to front
      setIsFlipped(false);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };



  // Slider questions don't flip - render inline
  if (questionType === 'slider') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="h-[380px]"
        data-testid="question-card"
        data-category={question.category}
      >
        <Card className="w-full h-full rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white border-gray-200 transition-all duration-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
          {/* Skip Button */}
          {!isAnswered && onSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs"
            >
              Skip →
            </Button>
          )}

          <div className="h-full flex flex-col">
            {/* Question Text */}
            <div className="mb-4">
              <p className="text-gray-900 leading-relaxed text-center text-base font-medium">
                {question.question}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {question.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`text-xs ${getTagStyles(tag)}`}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* Slider Answer Input - Inline */}
            <div className="flex-1 mb-4" onClick={(e) => e.stopPropagation()}>
              <AnswerInputSlider
                config={sliderConfig as SliderConfig}
                value={sliderValue}
                onChange={setSliderValue}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-xl h-10 text-sm font-medium"
              size="sm"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : isAnswered ? (
                <>
                  <Send className="w-3 h-3 mr-2" />
                  Update Answer
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 mr-2" />
                  Submit Answer
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Multiple choice questions don't flip - render inline
  if (questionType === 'multipleChoice') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="h-[420px]"
        data-testid="question-card"
        data-category={question.category}
      >
        <Card className="w-full h-full rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white border-gray-200 transition-all duration-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
          {/* Skip Button */}
          {!isAnswered && onSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs"
            >
              Skip →
            </Button>
          )}

          <div className="h-full flex flex-col">
            {/* Question Text */}
            <div className="mb-4">
              <p className="text-gray-900 leading-relaxed text-center text-base font-medium">
                {question.question}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {question.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`text-xs ${getTagStyles(tag)}`}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* Multiple Choice Answer Input - Inline */}
            <div className="flex-1 mb-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <AnswerInputMultipleChoice
                config={mcConfig as MultipleChoiceConfig}
                value={mcSelected}
                onChange={setMcSelected}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isValidAnswer}
              className="w-full rounded-xl h-10 text-sm font-medium"
              size="sm"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : isAnswered ? (
                <>
                  <Send className="w-3 h-3 mr-2" />
                  Update Answer
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 mr-2" />
                  Submit Answer
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Text questions use flip card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -4,
        rotateY: isHovered ? 1 : 0,
        rotateX: isHovered ? -1 : 0,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="perspective-1000 h-[300px]"
      data-testid="question-card"
      data-category={question.category}
    >
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onClick={handleFlip}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card - Question Display */}
        <Card
          className="absolute inset-0 w-full h-full rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white border-gray-200 transition-all duration-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] backface-hidden"
          style={{ backfaceVisibility: 'hidden', minHeight: '280px' }}
        >
          {/* Skip Button */}
          {!isAnswered && onSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs"
            >
              Skip →
            </Button>
          )}

          {/* Question Text */}
          <div className="flex-1 flex items-center justify-center mb-4">
            <p className="text-gray-900 leading-relaxed text-center text-base font-medium">
              {question.question}
            </p>
          </div>

          {/* Footer */}
          <div className="space-y-3">
            {/* Action Text */}
            <div className="text-center">
              {isAnswered ? (
                <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                  ✓ Answered - Click to Edit
                </Badge>
              ) : (
                <p className="text-sm text-gray-500">
                  Click to answer this question
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 justify-center">
              {question.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`text-xs ${getTagStyles(tag)}`}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* Spiciness Rating */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <ChiliRating
                  rating={question.suggestedLevel}
                  userRating={userSpicinessRating}
                  onRatingChange={(rating) => onRateSpiciness?.(question.id, rating)}
                  size="sm"
                  showAverage={true}
                />
              </div>
              <span className="text-xs text-gray-400">
                {userSpicinessRating ? 'Your rating' : `Tap to rate spiciness`}
              </span>
            </div>
          </div>
        </Card>

        {/* Back of Card - Answer Form */}
        <Card
          className="absolute inset-0 w-full h-full rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white/95 border border-black/5 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {question.question}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="rounded-full flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Answer Form */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {/* Text Answer Textarea - Only text questions use flip cards */}
              <div className="space-y-2">
                <Label htmlFor="answer-body" className="text-xs">Your Answer</Label>
                <Textarea
                  id="answer-body"
                  placeholder="Share your honest answer..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[80px] resize-none text-sm"
                />
                <div className="text-xs text-right">
                  <span className={wordCount > 100 ? 'text-red-500' : 'text-gray-500'}>
                    {wordCount}/100 words
                  </span>
                </div>
              </div>

              {/* Rating Sliders */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Spiciness Level: {selfRating}/5</Label>
                  <Slider
                    value={[selfRating]}
                    onValueChange={(value) => setSelfRating(value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="w-1/4"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Keep-it-private: {importance}/5</Label>
                  <Slider
                    value={[importance]}
                    onValueChange={(value) => setImportance(value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="w-1/4"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isValidAnswer || isSubmitting}
              className="w-full rounded-xl h-10 text-sm font-medium mt-4"
              size="sm"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-3 h-3 mr-2" />
                  Submit as Secret
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}