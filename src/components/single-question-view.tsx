"use client";

import { QuestionPrompt } from "@/lib/questions";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  SkipForward,
  MessageSquare,
} from "lucide-react";

interface SingleQuestionViewProps {
  questions: QuestionPrompt[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onAnswer: (question: QuestionPrompt) => void;
  onSkip: (question: QuestionPrompt) => void;
}

export function SingleQuestionView({
  questions,
  currentIndex,
  onNext,
  onPrev,
  onAnswer,
  onSkip,
}: SingleQuestionViewProps) {
  const currentQuestion = questions[currentIndex];
  const nextQuestion = questions[currentIndex + 1];

  if (!currentQuestion) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-[600px]">
      {/* Question Card Stack */}
      <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-[4/3]">
        {/* Background Cards (Stack Effect) */}
        {nextQuestion && (
          <>
            <div className="absolute inset-0 bg-card rounded-2xl border border-border transform scale-90 translate-y-5 opacity-30 z-0" />
            <div className="absolute inset-0 bg-card rounded-2xl border border-border transform scale-95 translate-y-2.5 opacity-50 z-10" />
          </>
        )}

        {/* Active Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20"
          >
            <div className="h-full w-full bg-gradient-to-br from-card to-secondary/20 border border-primary/30 rounded-2xl p-8 flex flex-col justify-between items-center text-center shadow-2xl shadow-black/50">
              {/* Card Header */}
              <div className="w-full flex justify-between items-start">
                <span className="bg-secondary px-3 py-1 rounded-full text-xs font-sans tracking-wider uppercase text-muted-foreground border border-border">
                  {currentQuestion.category}
                </span>
                <span
                  className="text-xl"
                  title={`Spiciness: ${currentQuestion.spiciness}/5`}
                  role="img"
                  aria-label={`Spiciness level: ${currentQuestion.spiciness || 1} out of 5`}
                >
                  {"🌶️".repeat(currentQuestion.spiciness || 1)}
                </span>
              </div>

              {/* Question Text */}
              <div className="flex-1 flex items-center justify-center py-8">
                <h2 className="text-2xl md:text-3xl font-medium leading-relaxed font-serif text-foreground">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Action Area */}
              <div className="w-full space-y-6">
                {/* Example/Hint Text (Mocked for now, could be real data later) */}
                <p className="text-sm text-muted-foreground italic">
                  &quot;Answer honestly to unlock others&apos; secrets...&quot;
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => onSkip(currentQuestion)}
                    className="h-14 rounded-xl border-border hover:bg-secondary/50 text-muted-foreground hover:text-foreground gap-2"
                  >
                    <SkipForward className="w-5 h-5" />
                    Skip
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => onAnswer(currentQuestion)}
                    className="h-14 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Answer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Hints */}
      <div className="mt-8 flex items-center gap-8 text-muted-foreground/50">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Prev</span>
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-2 hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <span>Next</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
