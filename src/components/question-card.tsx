'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ChiliRating } from '@/components/chili-rating';
import { AnswerInputSlider } from '@/components/answer-input-slider';
import { AnswerInputMultipleChoice } from '@/components/answer-input-multiple-choice';
import { ImageUploadInput } from '@/components/image-upload-input';
import { QuestionPrompt, SliderConfig, MultipleChoiceConfig } from '@/lib/questions';
import { ImageData } from '@/lib/image-utils';

interface QuestionCardProps {
  question: QuestionPrompt;
  onSubmit?: (answer: {
    questionId: string;
    body: string;
    selfRating: number;
    importance: number;
    answerType?: string;
    answerData?: unknown;
    isAnonymous?: boolean;
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
  const [body, setBody] = useState('');
  const [selfRating, setSelfRating] = useState(question.suggestedLevel);
  const [importance, setImportance] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload state
  const [imageData, setImageData] = useState<ImageData | null>(null);

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

  // Anonymous answer state
  const questionAllowsAnonymous = question.allowAnonymous || false;
  const [isAnonymous, setIsAnonymous] = useState(false);

  const wordCount = body.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isValidWordCount = wordCount <= 100 && wordCount > 0;

  // Check if question allows image upload
  const allowsImageUpload = question.allowImageUpload || false;

  // AGGRESSIVE DEBUG LOGGING
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 QUESTION CARD DEBUG');
  console.log('Question:', question.question);
  console.log('question.allowImageUpload:', question.allowImageUpload);
  console.log('typeof:', typeof question.allowImageUpload);
  console.log('allowsImageUpload (computed):', allowsImageUpload);
  console.log('questionType:', questionType);
  console.log('WILL SHOW IMAGE UPLOAD?:', allowsImageUpload === true);
  console.log('IS TEXT QUESTION?:', questionType === 'text');
  console.log('SHOULD RENDER IMAGE UPLOAD?:', questionType === 'text' && allowsImageUpload === true);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Validation based on question type
  const isValidAnswer =
    questionType === 'text'
      ? (allowsImageUpload ? (imageData !== null) : isValidWordCount)
      : questionType === 'multipleChoice' ? mcSelected.length > 0 :
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
        isAnonymous?: boolean;
      } = {
        questionId: question.id,
        body:
          questionType === 'slider' ? `Slider answer: ${sliderValue}` :
          questionType === 'multipleChoice' ? `Selected: ${mcSelected.join(', ')}` :
          body.trim(),
        selfRating,
        importance,
        isAnonymous: questionAllowsAnonymous && isAnonymous,
      };

      // Add typed answer data
      if (questionType === 'slider') {
        answer.answerType = 'slider';
        answer.answerData = { value: sliderValue };
      } else if (questionType === 'multipleChoice') {
        answer.answerType = 'multipleChoice';
        answer.answerData = { selected: mcSelected };
      } else if (imageData) {
        // Image upload answer
        answer.answerType = 'imageUpload';
        answer.answerData = imageData;
        answer.body = imageData.caption || 'Image answer';
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
    console.log('🎚️ RENDERING SLIDER QUESTION');
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="h-[380px] relative z-20"
        data-testid="question-card"
        data-category={question.category}
      >
        <Card className="w-full h-full art-deco-border p-5 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:art-deco-glow">
          {/* Skip Button */}
          {!isAnswered && onSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xs"
            >
              Skip →
            </Button>
          )}

          <div className="h-full flex flex-col">
            {/* Question Text */}
            <div className="mb-4">
              <p className="text-[#f4e5c2] leading-[1.8] text-center font-light" style={{ fontSize: '1.3rem' }}>
                {question.question}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {question.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="artdeco"
                  className="text-xs"
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

            {/* Anonymous Answer Checkbox */}
            {questionAllowsAnonymous && (
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id="answer-anonymous-slider"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  className="h-4 w-4"
                />
                <label htmlFor="answer-anonymous-slider" className="text-xs text-muted-foreground cursor-pointer">
                  Answer anonymously
                </label>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-sm font-medium art-deco-text"
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
    console.log('🔘 RENDERING MULTIPLE CHOICE QUESTION');
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="h-[420px] relative z-20"
        data-testid="question-card"
        data-category={question.category}
      >
        <Card className="w-full h-full art-deco-border p-5 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:art-deco-glow">
          {/* Skip Button */}
          {!isAnswered && onSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xs"
            >
              Skip →
            </Button>
          )}

          <div className="h-full flex flex-col">
            {/* Question Text */}
            <div className="mb-4">
              <p className="text-[#f4e5c2] leading-[1.8] text-center font-light" style={{ fontSize: '1.3rem' }}>
                {question.question}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {question.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="artdeco"
                  className="text-xs"
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

            {/* Anonymous Answer Checkbox */}
            {questionAllowsAnonymous && (
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id="answer-anonymous-mc"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  className="h-4 w-4"
                />
                <label htmlFor="answer-anonymous-mc" className="text-xs text-muted-foreground cursor-pointer">
                  Answer anonymously
                </label>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isValidAnswer}
              className="w-full art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-sm font-medium art-deco-text"
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

  // Text questions use accordion-style expand/collapse
  console.log('📝 RENDERING TEXT QUESTION WITH ACCORDION');
  return (
    <div
      className="relative z-20"
      data-testid="question-card"
      data-category={question.category}
    >
      <Card className="art-deco-border bg-card/50 backdrop-blur-sm transition-all duration-200 hover:art-deco-glow">
        {/* Question Display - Always Visible */}
        <div
          className={`p-5 cursor-pointer transition-all duration-300 ${isFlipped ? 'pb-3' : ''}`}
          onClick={handleFlip}
        >
          {/* Skip Button */}
          {!isAnswered && onSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xs z-10"
            >
              Skip →
            </Button>
          )}

          {/* Question Text */}
          <div className="mb-4">
            <p className="text-[#f4e5c2] leading-[1.8] text-center font-light" style={{ fontSize: '1.3rem' }}>
              {question.question}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 justify-center mb-3">
            {question.tags?.map((tag, index) => (
              <Badge
                key={index}
                variant="artdeco"
                className="text-xs"
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Spiciness Rating & Action Text */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <ChiliRating
                rating={question.suggestedLevel}
                userRating={userSpicinessRating}
                onRatingChange={(rating) => onRateSpiciness?.(question.id, rating)}
                size="sm"
                showAverage={true}
              />
            </div>
            {!isFlipped && (
              <div className="text-center">
                {isAnswered ? (
                  <Badge variant="outline" className="text-xs bg-secondary/30 text-foreground border-border">
                    ✓ Answered - Click to Edit
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click to answer this question
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Answer Form - Expandable Section */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isFlipped ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-5 pb-5 pt-2 border-t border-border/30 max-h-[750px] overflow-y-auto">

            {/* Answer Form */}
            <div className="flex-1 space-y-4">
              {/* Image Upload or Text Answer based on question config */}
              {allowsImageUpload ? (
                (() => {
                  console.log('✅ RENDERING ImageUploadInput');
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="answer-image" className="text-xs text-foreground">
                        Upload Image
                      </Label>
                      <ImageUploadInput
                        value={imageData}
                        onChange={setImageData}
                        maxSizeMB={5}
                        showCaption={true}
                      />
                    </div>
                  );
                })()
              ) : (
                (() => {
                  console.log('❌ RENDERING Textarea instead');
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="answer-body" className="text-xs text-foreground">Your Answer</Label>
                      <Textarea
                        id="answer-body"
                        placeholder="Share your honest answer..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="min-h-[80px] resize-none text-sm bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground"
                      />
                      <div className="text-xs text-right">
                        <span className={wordCount > 100 ? 'text-red-500' : 'text-muted-foreground'}>
                          {wordCount}/100 words
                        </span>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Rating Sliders */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-foreground">Spiciness Level: {selfRating}/5</Label>
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
                  <Label className="text-xs text-foreground">Keep-it-private: {importance}/5</Label>
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

              {/* Anonymous Answer Checkbox */}
              {questionAllowsAnonymous && (
                <div className="flex items-center space-x-2 pt-3">
                  <Checkbox
                    id="answer-anonymous-text"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="answer-anonymous-text" className="text-xs text-muted-foreground cursor-pointer">
                    Answer anonymously
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isValidAnswer || isSubmitting}
              className="w-full art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-sm font-medium art-deco-text mt-4"
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
        </div>
      </Card>
    </div>
  );
}