"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionCard } from "@/components/question-card";
import { QuestionPrompt } from "@/lib/questions";

interface UnlockQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuestionPrompt;
  requiredSpiciness: number;
  targetSecretAuthor: string;
  onAnswerSubmit: (answer: {
    questionId: string;
    body: string;
    selfRating: number;
    importance: number;
    answerType?: string;
    answerData?: unknown;
    isAnonymous?: boolean;
  }) => void;
}

export function UnlockQuestionModal({
  isOpen,
  onClose,
  question,
  requiredSpiciness,
  targetSecretAuthor,
  onAnswerSubmit,
}: UnlockQuestionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-serif">
            Answer to Unlock {targetSecretAuthor}&apos;s Secret
          </DialogTitle>
          <DialogDescription className="text-sm">
            Share your own answer to this question (Level {requiredSpiciness}+)
            to see their secret
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4">
          <QuestionCard
            question={question}
            onSubmit={onAnswerSubmit}
            isAnswered={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
