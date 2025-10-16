'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomQuestionModal } from '@/components/custom-question-modal';
import { ChiliRating } from '@/components/chili-rating';
import { QuestionPrompt, getTagStyles } from '@/lib/questions';

interface QuestionSelectorProps {
  questions: QuestionPrompt[];
  selectedQuestionIds: string[];
  onSelectionChange: (selectedIds: string[], customQuestions: QuestionPrompt[]) => void;
  maxSelections?: number | null; // null means unlimited
}

export function QuestionSelector({
  questions,
  selectedQuestionIds,
  onSelectionChange,
  maxSelections = null // Default to unlimited
}: QuestionSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<QuestionPrompt[]>([]);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  const allQuestions = [...questions, ...customQuestions];
  const isSelectionFull = maxSelections !== null && selectedQuestionIds.length >= maxSelections;

  const handleQuestionSelect = (questionId: string) => {
    let newSelection: string[];

    if (selectedQuestionIds.includes(questionId)) {
      // Deselect question
      newSelection = selectedQuestionIds.filter(id => id !== questionId);
    } else if (!isSelectionFull) {
      // Select question if we haven't reached the limit
      newSelection = [...selectedQuestionIds, questionId];
    } else {
      // Already at max selection - do nothing
      return;
    }

    onSelectionChange(newSelection, customQuestions);
  };

  const handleCustomQuestionCreate = (customQuestion: QuestionPrompt) => {
    // PREPEND to array instead of append (new questions go to top)
    const newCustomQuestions = [customQuestion, ...customQuestions];
    const newSelection = [...selectedQuestionIds, customQuestion.id];

    setCustomQuestions(newCustomQuestions);
    onSelectionChange(newSelection, newCustomQuestions);
    setIsModalOpen(false);

    // Track newly created question for glow effect
    setNewlyCreatedId(customQuestion.id);

    // Remove glow after 3 seconds
    setTimeout(() => {
      setNewlyCreatedId(null);
    }, 3000);
  };

  const handleRemoveCustomQuestion = (questionId: string) => {
    const newCustomQuestions = customQuestions.filter(q => q.id !== questionId);
    const newSelection = selectedQuestionIds.filter(id => id !== questionId);

    setCustomQuestions(newCustomQuestions);
    onSelectionChange(newSelection, newCustomQuestions);
  };

  const selectedQuestions = allQuestions.filter(q => selectedQuestionIds.includes(q.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground art-deco-text">
          Choose Your Questions
        </h2>
        <p className="text-muted-foreground text-sm">
          {maxSelections !== null
            ? `Select exactly ${maxSelections} questions for your room (${selectedQuestionIds.length}/${maxSelections} selected)`
            : `Select questions for your room (${selectedQuestionIds.length} selected)`
          }
        </p>
      </div>

      {/* Question Selection Grid */}
      <motion.div
        layout
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {/* Create Custom Question Card - Always first */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          className="h-[280px]"
        >
          <Card
            className={`relative w-full h-full art-deco-border p-5 border-2 border-dashed transition-all duration-200 cursor-pointer ${
              isSelectionFull
                ? 'bg-card/20 opacity-50 cursor-not-allowed'
                : 'bg-card/30 backdrop-blur-sm hover:art-deco-glow hover:border-primary'
            }`}
            onClick={() => !isSelectionFull && setIsModalOpen(true)}
          >
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <div className={`rounded-full p-4 ${
                isSelectionFull ? 'bg-secondary/30' : 'bg-primary/10 border border-primary/30'
              }`}>
                <Plus className={`w-6 h-6 ${
                  isSelectionFull ? 'text-muted-foreground' : 'text-primary'
                }`} />
              </div>
              <div className="space-y-1">
                <h3 className={`font-medium art-deco-text ${
                  isSelectionFull ? 'text-muted-foreground' : 'text-foreground'
                }`}>
                  Create Custom Question
                </h3>
                <p className={`text-sm ${
                  isSelectionFull ? 'text-muted-foreground/50' : 'text-muted-foreground'
                }`}>
                  Add your own question prompt
                </p>
              </div>
              {isSelectionFull && (
                <p className="text-xs text-muted-foreground">
                  Remove a question first
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Custom Questions - Appear after create button, with animation */}
        <AnimatePresence mode="popLayout">
          {customQuestions.map((question) => (
            <QuestionSelectorCard
              key={question.id}
              question={question}
              isSelected={selectedQuestionIds.includes(question.id)}
              isSelectable={!isSelectionFull || selectedQuestionIds.includes(question.id)}
              isCustom={true}
              isNewlyCreated={question.id === newlyCreatedId}
              onSelect={() => handleQuestionSelect(question.id)}
              onRemove={() => handleRemoveCustomQuestion(question.id)}
            />
          ))}
        </AnimatePresence>

        {/* Regular Questions */}
        {questions.map((question) => (
          <QuestionSelectorCard
            key={question.id}
            question={question}
            isSelected={selectedQuestionIds.includes(question.id)}
            isSelectable={!isSelectionFull || selectedQuestionIds.includes(question.id)}
            onSelect={() => handleQuestionSelect(question.id)}
          />
        ))}
      </motion.div>

      {/* Selected Questions Preview */}
      {selectedQuestions.length > 0 && (
        <div className="art-deco-border bg-card/30 backdrop-blur-sm p-5">
          <h3 className="font-medium text-foreground mb-3 art-deco-text">Selected Questions:</h3>
          <div className="space-y-2">
            {selectedQuestions.map((question, index) => (
              <div key={question.id} className="flex items-center justify-between art-deco-border bg-card/50 p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {index + 1}. {question.question}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <ChiliRating rating={question.suggestedLevel} readonly size="sm" />
                    {question.tags && question.tags.length > 0 && (
                      <Badge variant="artdeco" className="text-xs">
                        {question.tags[0].name}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuestionSelect(question.id)}
                  className="rounded-full w-8 h-8 p-0 hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Question Modal */}
      <CustomQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateQuestion={handleCustomQuestionCreate}
      />
    </div>
  );
}

interface QuestionSelectorCardProps {
  question: QuestionPrompt;
  isSelected: boolean;
  isSelectable: boolean;
  isCustom?: boolean;
  isNewlyCreated?: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

function QuestionSelectorCard({
  question,
  isSelected,
  isSelectable,
  isCustom = false,
  isNewlyCreated = false,
  onSelect,
  onRemove
}: QuestionSelectorCardProps) {
  return (
    <motion.div
      layout
      layoutId={question.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        // Glow effect for newly created questions
        boxShadow: isNewlyCreated
          ? '0 0 30px rgba(197, 153, 95, 0.5), 0 0 60px rgba(197, 153, 95, 0.3)'
          : '0 0 0 rgba(0, 0, 0, 0)'
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={isSelectable ? { y: -4 } : {}}
      transition={{
        layout: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        boxShadow: { duration: 3, ease: "easeOut" }
      }}
      className="h-[280px]"
      data-testid="question-selector-card"
    >
      <Card
        className={`relative w-full h-full art-deco-border p-5 transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'border-2 border-primary shadow-[0_16px_40px_rgba(197,153,95,0.3)] bg-primary/5'
            : isSelectable
            ? 'bg-card/50 backdrop-blur-sm hover:art-deco-glow hover:border-primary'
            : 'bg-card/20 opacity-50 cursor-not-allowed'
        }`}
        onClick={isSelectable ? onSelect : undefined}
      >
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}

        {/* Custom Question Remove Button */}
        {isCustom && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-3 left-3 w-6 h-6 bg-destructive/20 hover:bg-destructive/30 rounded-full flex items-center justify-center transition-colors border border-destructive/40"
            title="Remove custom question"
          >
            <X className="w-4 h-4 text-destructive" />
          </button>
        )}

        {/* Question Content */}
        <div className="flex-1 flex items-center justify-center mb-4 min-h-[120px]">
          <p
            className={`leading-[1.8] text-center font-light ${
              isSelectable ? 'text-[#f4e5c2]' : 'text-muted-foreground'
            }`}
            style={{ fontSize: '1.3rem' }}
          >
            {question.question}
          </p>
        </div>

        {/* Footer */}
        <div className="space-y-3">
          {/* Custom indicator */}
          {isCustom && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs bg-secondary/30 text-foreground border-border">
                Custom Question
              </Badge>
            </div>
          )}

          {/* Tags - Using art-deco style */}
          <div className="flex flex-wrap gap-1 justify-center">
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

          {/* Spiciness Rating */}
          <div className="flex flex-col items-center gap-1">
            <ChiliRating rating={question.suggestedLevel} readonly size="sm" />
            <span className="text-xs text-muted-foreground">
              Spiciness level
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
