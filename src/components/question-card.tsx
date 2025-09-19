'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ChiliRating } from '@/components/chili-rating';
import { QuestionPrompt } from '@/lib/questions';

interface QuestionCardProps {
  question: QuestionPrompt;
  onSubmit?: (answer: {
    questionId: string;
    body: string;
    selfRating: number;
    importance: number
  }) => void;
  onRateSpiciness?: (questionId: string, spiciness: number) => void;
  userSpicinessRating?: number;
  isAnswered?: boolean;
}

export function QuestionCard({
  question,
  onSubmit,
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

  const wordCount = body.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isValidWordCount = wordCount <= 100 && wordCount > 0;

  const handleFlip = () => {
    if (!isAnswered) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleSubmit = async () => {
    if (!isValidWordCount) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.({
        questionId: question.id,
        body: body.trim(),
        selfRating,
        importance,
      });

      // Reset form and flip back
      setBody('');
      setSelfRating(question.suggestedLevel);
      setImportance(3);
      setIsFlipped(false);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'Personal':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
          border: 'border-blue-200',
          tag: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'Relationships':
        return {
          bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
          border: 'border-pink-200',
          tag: 'bg-pink-100 text-pink-800 border-pink-200'
        };
      case 'Embarrassing':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100',
          border: 'border-red-200',
          tag: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'Fears & Dreams':
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
          border: 'border-purple-200',
          tag: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'Opinions':
        return {
          bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
          border: 'border-orange-200',
          tag: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'Work/School':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          border: 'border-green-200',
          tag: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'Random':
        return {
          bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
          border: 'border-indigo-200',
          tag: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          border: 'border-gray-200',
          tag: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const categoryColors = getCategoryColors(question.category);

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
          className={`absolute inset-0 w-full h-full rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${categoryColors.bg} ${categoryColors.border} transition-all duration-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] backface-hidden ${
            isAnswered ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          style={{ backfaceVisibility: 'hidden', minHeight: '280px' }}
        >
          {/* Category Tag */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className={`text-xs flex items-center gap-1 ${categoryColors.tag}`}>
              <Tag className="w-3 h-3" />
              {question.category}
            </Badge>
          </div>

          {/* Question Text */}
          <div className="flex-1 flex items-center justify-center mb-4">
            <p className="text-gray-900 leading-relaxed text-center text-base font-medium">
              {question.question}
            </p>
          </div>

          {/* Footer */}
          <div className="space-y-2">
            <div className="text-center">
              {isAnswered ? (
                <Badge variant="secondary" className="text-xs">
                  Already Answered
                </Badge>
              ) : (
                <p className="text-sm text-gray-500">
                  Click to answer this question
                </p>
              )}
            </div>
            {/* Spiciness Rating */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <ChiliRating
                  rating={userSpicinessRating || question.suggestedLevel}
                  onRatingChange={(rating) => onRateSpiciness?.(question.id, rating)}
                  size="sm"
                />
              </div>
              <span className="text-xs text-gray-400">
                {userSpicinessRating ? 'Your rating' : `Avg: ${question.suggestedLevel}/5`}
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
              {/* Answer Textarea */}
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
              disabled={!isValidWordCount || isSubmitting}
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