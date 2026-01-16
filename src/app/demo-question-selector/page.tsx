"use client";

import { useState } from "react";
import { QuestionSelector } from "@/components/question-selector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  mockQuestions,
  QuestionPrompt,
  getCuratedQuestions,
} from "@/lib/questions";

export default function QuestionSelectorDemoPage() {
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<QuestionPrompt[]>([]);

  // Get a curated set of questions for demonstration
  const availableQuestions = getCuratedQuestions(mockQuestions);

  const handleSelectionChange = (
    selectedIds: string[],
    newCustomQuestions: QuestionPrompt[],
  ) => {
    setSelectedQuestionIds(selectedIds);
    setCustomQuestions(newCustomQuestions);
  };

  const handleCreateRoom = () => {
    // In a real implementation, this would call the API to create a room
    alert(
      `Room would be created with ${selectedQuestionIds.length} selected questions!`,
    );
  };

  const allQuestions = [...availableQuestions, ...customQuestions];
  const selectedQuestions = allQuestions.filter((q) =>
    selectedQuestionIds.includes(q.id),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Question Selector Demo
          </h1>
          <p className="text-gray-600">
            This demonstrates the QuestionSelector component for The Secret
            Game. Select exactly 3 questions to create a room with custom
            question curation.
          </p>
        </Card>

        {/* Question Selector Component */}
        <QuestionSelector
          questions={availableQuestions}
          selectedQuestionIds={selectedQuestionIds}
          onSelectionChange={handleSelectionChange}
          maxSelections={3}
        />

        {/* Action Section */}
        {selectedQuestionIds.length === 3 && (
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Ready to Create Room!
                </h3>
                <p className="text-green-700 text-sm">
                  You&apos;ve selected {selectedQuestionIds.length} questions
                  for your room.
                </p>
              </div>
              <Button
                onClick={handleCreateRoom}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Room
              </Button>
            </div>
          </Card>
        )}

        {/* Debug Information */}
        <Card className="p-6 bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Debug Information
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Available Questions:</strong> {availableQuestions.length}
            </div>
            <div>
              <strong>Custom Questions:</strong> {customQuestions.length}
            </div>
            <div>
              <strong>Selected Question IDs:</strong> [
              {selectedQuestionIds.join(", ")}]
            </div>
            {selectedQuestions.length > 0 && (
              <div>
                <strong>Selected Questions:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {selectedQuestions.map((q) => (
                    <li key={q.id} className="text-gray-700">
                      <span className="font-medium">{q.id}:</span> {q.question}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
