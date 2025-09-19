'use client';

import { useState, useMemo } from 'react';
import { QuestionCard } from '@/components/question-card';
import { CategoryFilter } from '@/components/category-filter';
import {
  QuestionPrompt,
  QUESTION_CATEGORIES,
  filterQuestionsByCategory,
  getCategoryCounts,
  getCuratedQuestions
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
}

export function QuestionGrid({
  questions,
  answeredQuestionIds = [],
  onSubmitAnswer
}: QuestionGridProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userSpicinessRatings, setUserSpicinessRatings] = useState<Record<string, number>>({});

  // Get curated selection of 12 questions mixed from different categories
  const curatedQuestions = useMemo(() => {
    return getCuratedQuestions(questions);
  }, [questions]);

  // Filter questions based on selected categories from the curated set
  const filteredQuestions = useMemo(() => {
    return filterQuestionsByCategory(curatedQuestions, selectedCategories);
  }, [curatedQuestions, selectedCategories]);

  // Get category counts for all questions (for filter display)
  const categoryCounts = useMemo(() => {
    return getCategoryCounts(curatedQuestions);
  }, [curatedQuestions]);

  // Use filtered questions directly (already curated to 12)
  const sortedQuestions = useMemo(() => {
    return filteredQuestions;
  }, [filteredQuestions]);

  const handleRateSpiciness = (questionId: string, spiciness: number) => {
    setUserSpicinessRatings(prev => ({
      ...prev,
      [questionId]: spiciness
    }));
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <CategoryFilter
          categories={QUESTION_CATEGORIES}
          categoryCounts={categoryCounts}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
        />
      </div>

      {/* Questions Grid - 3 columns x 4 rows */}
      {sortedQuestions.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {sortedQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              isAnswered={answeredQuestionIds.includes(question.id)}
              onSubmit={onSubmitAnswer}
              onRateSpiciness={handleRateSpiciness}
              userSpicinessRating={userSpicinessRatings[question.id] || 0}
            />
          ))}
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
    </div>
  );
}