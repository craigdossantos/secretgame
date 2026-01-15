"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionPrompt } from "@/lib/questions";
import type { SecretWithAuthor } from "@/types/models";

interface AnsweredQuestionsSectionProps {
  roomQuestions: QuestionPrompt[];
  answeredQuestionIds: string[];
  secrets: SecretWithAuthor[];
  onViewAnswers: (question: QuestionPrompt) => void;
}

export function AnsweredQuestionsSection({
  roomQuestions,
  answeredQuestionIds,
  secrets,
  onViewAnswers,
}: AnsweredQuestionsSectionProps) {
  if (answeredQuestionIds.length === 0) {
    return null;
  }

  const answeredQuestions = roomQuestions.filter((q) =>
    answeredQuestionIds.includes(q.id),
  );

  return (
    <div>
      <div className="art-deco-divider my-8">
        <span>&#9670; &#9670; &#9670;</span>
      </div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-serif text-foreground art-deco-text art-deco-shadow">
          Your Answered Questions
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          View all answers from the group for questions you&apos;ve answered
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {answeredQuestions.map((question) => {
          const questionSecretCount = secrets.filter(
            (s) => s.questionId === question.id,
          ).length;
          return (
            <Card
              key={question.id}
              className="art-deco-border p-4 bg-card/50 backdrop-blur-sm hover:art-deco-glow transition-all duration-200"
            >
              <div className="space-y-3">
                <p className="text-sm font-medium leading-snug">
                  {question.question}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {questionSecretCount}{" "}
                    {questionSecretCount === 1 ? "answer" : "answers"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewAnswers(question)}
                    className="text-xs"
                  >
                    View All Answers
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
