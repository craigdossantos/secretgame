"use client";

import { useRouter } from "next/navigation";
import { SingleQuestionView } from "@/components/single-question-view";
import { EmptyState } from "@/components/empty-state";
import { AddQuestionBanner } from "@/components/add-question-banner";
import { AnsweredQuestionsSection } from "@/components/answered-questions-section";
import { SecretsFeed } from "@/components/secrets-feed";
import { QuestionPrompt } from "@/lib/questions";
import type { RoomWithDetails, SecretWithAuthor } from "@/types/models";

interface RoomContentProps {
  room: RoomWithDetails | null;
  roomId: string;
  roomQuestions: QuestionPrompt[];
  displayedQuestions: QuestionPrompt[];
  secrets: SecretWithAuthor[];
  answeredQuestionIds: string[];
  skippedQuestionIds: string[];
  currentUserId: string | null;
  onSkipQuestion: (questionId: string) => void;
  onUnlock: (secretId: string) => void;
  onRate: (secretId: string, rating: number) => void;
  onViewCollaborativeAnswers: (question: QuestionPrompt) => void;
  onOpenCustomQuestionModal: () => void;
}

export function RoomContent({
  room,
  roomId,
  roomQuestions,
  displayedQuestions,
  secrets,
  answeredQuestionIds,
  skippedQuestionIds,
  currentUserId,
  onSkipQuestion,
  onUnlock,
  onRate,
  onViewCollaborativeAnswers,
  onOpenCustomQuestionModal,
}: RoomContentProps) {
  const router = useRouter();

  // No Questions in Room State
  if (roomQuestions.length === 0) {
    return (
      <EmptyState
        icon="&#10067;"
        title="No Questions Yet"
        description={
          room?.ownerId === currentUserId
            ? "Get the conversation started by adding some spicy questions for your group!"
            : "Waiting for questions to be added to this room."
        }
        action={
          room?.ownerId === currentUserId
            ? {
                label: "Add Questions to Room",
                onClick: () => router.push(`/admin?room=${roomId}`),
              }
            : undefined
        }
      />
    );
  }

  const unansweredQuestions = roomQuestions.filter(
    (q) =>
      !answeredQuestionIds.includes(q.id) && !skippedQuestionIds.includes(q.id),
  );

  return (
    <div className="space-y-8">
      {/* Unanswered Questions (Single View) */}
      {displayedQuestions.length > 0 && (
        <div>
          <div className="art-deco-divider mb-6">
            <span>&#9670; &#9670; &#9670;</span>
          </div>

          <SingleQuestionView
            questions={unansweredQuestions}
            currentIndex={0}
            onNext={() => {}}
            onPrev={() => {}}
            onAnswer={() => {
              // Answer handling is done within SingleQuestionView
            }}
            onSkip={(q) => onSkipQuestion(q.id)}
          />
        </div>
      )}

      {/* All Questions Answered State */}
      {displayedQuestions.length === 0 && roomQuestions.length > 0 && (
        <EmptyState
          icon="&#127881;"
          title="All Questions Answered!"
          description="You've answered or skipped all available questions."
        />
      )}

      {/* Custom Question Banner - Always visible when there are questions in room */}
      {roomQuestions.length > 0 && (
        <AddQuestionBanner onClick={onOpenCustomQuestionModal} />
      )}

      {/* Answered Questions Section */}
      <AnsweredQuestionsSection
        roomQuestions={roomQuestions}
        answeredQuestionIds={answeredQuestionIds}
        secrets={secrets}
        onViewAnswers={onViewCollaborativeAnswers}
      />

      {/* Secrets Feed */}
      <SecretsFeed
        secrets={secrets}
        onUnlock={onUnlock}
        onRate={onRate}
        displayedQuestions={displayedQuestions}
        roomQuestionsCount={roomQuestions.length}
      />
    </div>
  );
}
