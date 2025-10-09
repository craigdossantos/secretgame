'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
    const newCustomQuestions = [...customQuestions, customQuestion];
    const newSelection = [...selectedQuestionIds, customQuestion.id];

    setCustomQuestions(newCustomQuestions);
    onSelectionChange(newSelection, newCustomQuestions);
    setIsModalOpen(false);
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
        <h2 className="text-xl font-semibold text-gray-900">
          Choose Your Questions
        </h2>
        <p className="text-gray-600 text-sm">
          {maxSelections !== null
            ? `Select exactly ${maxSelections} questions for your room (${selectedQuestionIds.length}/${maxSelections} selected)`
            : `Select questions for your room (${selectedQuestionIds.length} selected)`
          }
        </p>
      </div>

      {/* Question Selection Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Custom Questions */}
        {customQuestions.map((question) => (
          <QuestionSelectorCard
            key={question.id}
            question={question}
            isSelected={selectedQuestionIds.includes(question.id)}
            isSelectable={!isSelectionFull || selectedQuestionIds.includes(question.id)}
            isCustom={true}
            onSelect={() => handleQuestionSelect(question.id)}
            onRemove={() => handleRemoveCustomQuestion(question.id)}
          />
        ))}

        {/* Create Custom Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          className="h-[280px]"
        >
          <Card
            className={`relative w-full h-full rounded-2xl p-5 border-2 border-dashed transition-all duration-200 cursor-pointer ${
              isSelectionFull
                ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]'
            }`}
            onClick={() => !isSelectionFull && setIsModalOpen(true)}
          >
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <div className={`rounded-full p-4 ${
                isSelectionFull ? 'bg-gray-100' : 'bg-blue-50'
              }`}>
                <Plus className={`w-6 h-6 ${
                  isSelectionFull ? 'text-gray-400' : 'text-blue-600'
                }`} />
              </div>
              <div className="space-y-1">
                <h3 className={`font-medium ${
                  isSelectionFull ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  Create Custom Question
                </h3>
                <p className={`text-sm ${
                  isSelectionFull ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Add your own question prompt
                </p>
              </div>
              {isSelectionFull && (
                <p className="text-xs text-gray-400">
                  Remove a question first
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Selected Questions Preview */}
      {selectedQuestions.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
          <h3 className="font-medium text-gray-900 mb-3">Selected Questions:</h3>
          <div className="space-y-2">
            {selectedQuestions.map((question, index) => (
              <div key={question.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {index + 1}. {question.question}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <ChiliRating rating={question.suggestedLevel} readonly size="sm" />
                    {question.tags && question.tags.length > 0 && (
                      <Badge variant="outline" className={`text-xs ${getTagStyles(question.tags[0])}`}>
                        {question.tags[0].name}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuestionSelect(question.id)}
                  className="rounded-full w-8 h-8 p-0 hover:bg-red-50"
                >
                  <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
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
  onSelect: () => void;
  onRemove?: () => void;
}

function QuestionSelectorCard({
  question,
  isSelected,
  isSelectable,
  isCustom = false,
  onSelect,
  onRemove
}: QuestionSelectorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isSelectable ? { y: -4 } : {}}
      className="h-[280px]"
      data-testid="question-selector-card"
    >
      <Card
        className={`relative w-full h-full rounded-2xl p-5 transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'border-2 border-blue-500 shadow-[0_16px_40px_rgba(59,130,246,0.15)] bg-blue-50'
            : isSelectable
            ? 'border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:border-gray-300'
            : 'border border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
        }`}
        onClick={isSelectable ? onSelect : undefined}
      >
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Custom Question Remove Button */}
        {isCustom && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-3 left-3 w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
            title="Remove custom question"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        )}

        {/* Question Content */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <p className={`leading-relaxed text-center text-base font-medium ${
            isSelectable ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {question.question}
          </p>
        </div>

        {/* Footer */}
        <div className="space-y-3">
          {/* Custom indicator */}
          {isCustom && (
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                Custom Question
              </Badge>
            </div>
          )}

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
            <ChiliRating rating={question.suggestedLevel} readonly size="sm" />
            <span className="text-xs text-gray-400">
              Spiciness level
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}