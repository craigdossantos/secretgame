'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { QuestionCard } from '@/components/question-card';
import { CategoryFilter } from '@/components/category-filter';
import { Card } from '@/components/ui/card';
import { CustomQuestionModal } from '@/components/custom-question-modal';
import {
  QuestionPrompt,
  QUESTION_CATEGORIES,
  filterQuestionsByCategory,
  getCategoryCounts
} from '@/lib/questions';

interface QuestionGridProps {
  questions: QuestionPrompt[];
  answeredQuestionIds?: string[];
  onSubmitAnswer?: (answer: {
    questionId: string;
    body: string;
    selfRating: number;
    importance: number;
  }) => void;
  onSkipQuestion?: (questionId: string) => void;
  showCustomQuestionPeek?: boolean;
  onCreateCustomQuestion?: (question: QuestionPrompt) => void;
  showCategoryFilter?: boolean;
}

export function QuestionGrid({
  questions,
  answeredQuestionIds = [],
  onSubmitAnswer,
  onSkipQuestion,
  showCustomQuestionPeek = false,
  onCreateCustomQuestion,
  showCategoryFilter = true
}: QuestionGridProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userSpicinessRatings, setUserSpicinessRatings] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use the passed questions directly (already curated/filtered by parent)
  const sortedQuestions = useMemo(() => {
    // If categories are selected, filter the questions
    if (selectedCategories.length > 0) {
      return filterQuestionsByCategory(questions, selectedCategories);
    }
    return questions;
  }, [questions, selectedCategories]);

  // Get category counts for the current questions
  const categoryCounts = useMemo(() => {
    return getCategoryCounts(questions);
  }, [questions]);

  const handleRateSpiciness = (questionId: string, spiciness: number) => {
    setUserSpicinessRatings(prev => ({
      ...prev,
      [questionId]: spiciness
    }));
  };

  const handleCustomQuestionCreate = (customQuestion: QuestionPrompt) => {
    if (onCreateCustomQuestion) {
      onCreateCustomQuestion(customQuestion);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {showCategoryFilter && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <CategoryFilter
            categories={QUESTION_CATEGORIES}
            categoryCounts={categoryCounts}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />
        </div>
      )}

      {/* Questions Grid - Responsive layout */}
      {sortedQuestions.length > 0 ? (
        <div className="relative">
          <div className={`grid gap-4 ${showCustomQuestionPeek
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(3,1fr)_0.4fr]'
            : sortedQuestions.length <= 3
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
            {sortedQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                isAnswered={answeredQuestionIds.includes(question.id)}
                onSubmit={onSubmitAnswer}
                onSkip={onSkipQuestion}
                onRateSpiciness={handleRateSpiciness}
                userSpicinessRating={userSpicinessRatings[question.id] || 0}
              />
            ))}

            {/* Custom Question Peek Card (4th position) */}
            {showCustomQuestionPeek && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: -4 }}
                className="h-[400px] hidden lg:block"
              >
                <Card
                  className="relative w-full h-full rounded-2xl p-5 border-2 border-dashed border-gray-300 bg-white hover:border-blue-400 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition-all duration-200 cursor-pointer"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                    <div className="rounded-full p-4 bg-blue-50">
                      <Plus className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">
                        Create Custom Question
                      </h3>
                      <p className="text-sm text-gray-500">
                        Add your own question to the room
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg font-medium">
            No questions found
          </div>
          <div className="text-gray-400 text-sm mt-1">
            {selectedCategories.length > 0
              ? 'Try selecting different categories or clear your filters'
              : 'No questions available'}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {sortedQuestions.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {sortedQuestions.length} question{sortedQuestions.length !== 1 ? 's' : ''}
          {selectedCategories.length > 0 && selectedCategories.length < QUESTION_CATEGORIES.length && (
            <> from {selectedCategories.join(', ')}</>
          )}
        </div>
      )}

      {/* Custom Question Modal */}
      {showCustomQuestionPeek && (
        <CustomQuestionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreateQuestion={handleCustomQuestionCreate}
        />
      )}
    </div>
  );
}