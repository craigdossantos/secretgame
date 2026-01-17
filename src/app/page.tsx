"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { QuestionSelector } from "@/components/question-selector";
import { QuestionPrompt, parseQuestions, mockQuestions } from "@/lib/questions";
import { usePendingAnswer } from "@/hooks/use-pending-answer";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { savePending, getPending, clearPending } = usePendingAnswer();

  // Questions state
  const [questions, setQuestions] = useState<QuestionPrompt[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<QuestionPrompt[]>([]);

  // Answer form state
  const [answer, setAnswer] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref to prevent race condition during post-auth room creation
  const isCreatingRoomRef = useRef(false);

  // Get the selected question
  const allQuestions = [...questions, ...customQuestions];
  const selectedQuestion =
    selectedQuestionIds.length > 0
      ? allQuestions.find((q) => q.id === selectedQuestionIds[0])
      : null;

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/questions.yaml");
        if (response.ok) {
          const yamlContent = await response.text();
          const parsed = parseQuestions(yamlContent);
          setQuestions(parsed);
        } else {
          setQuestions(mockQuestions);
        }
      } catch (error) {
        console.warn("Error loading questions:", error);
        setQuestions(mockQuestions);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  // Handle pending answer after auth - wrapped in useCallback to avoid stale closures
  const processPostAuthPendingAnswer = useCallback(async () => {
    if (isCreatingRoomRef.current) return; // Guard against race conditions

    const pending = getPending();
    if (pending) {
      isCreatingRoomRef.current = true;
      // User just authenticated with a pending answer - create room
      await handleCreateRoomWithAnswer(pending);
    }
  }, [getPending]);

  // Trigger post-auth room creation when authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      processPostAuthPendingAnswer();
    }
  }, [status, session, processPostAuthPendingAnswer]);

  const handleSelectionChange = (
    newSelectedIds: string[],
    newCustomQuestions: QuestionPrompt[],
  ) => {
    setSelectedQuestionIds(newSelectedIds);
    setCustomQuestions(newCustomQuestions);
    // Clear answer when selection changes
    if (newSelectedIds[0] !== selectedQuestionIds[0]) {
      setAnswer("");
    }
  };

  const handleClearSelection = () => {
    setSelectedQuestionIds([]);
    setAnswer("");
    setIsAnonymous(false);
  };

  const handleCreateRoomWithAnswer = async (pendingAnswer?: {
    questionId: string;
    questionText: string;
    answer: string;
    isAnonymous: boolean;
  }) => {
    const answerData = pendingAnswer || {
      questionId: selectedQuestion?.id,
      questionText: selectedQuestion?.question,
      answer,
      isAnonymous,
    };

    if (!answerData.questionId || !answerData.answer.trim()) {
      toast.error("Please answer the question first");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: answerData.questionId,
          questionText: answerData.questionText,
          answer: answerData.answer,
          isAnonymous: answerData.isAnonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create room");
        return;
      }

      // Clear pending answer after successful creation
      clearPending();

      // Redirect to the new room (using slug if available, otherwise room ID)
      const roomPath = data.slug ? `/${data.slug}` : `/rooms/${data.roomId}`;
      router.push(roomPath);
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedQuestion || !answer.trim()) {
      toast.error("Please select a question and write your answer");
      return;
    }

    // If not authenticated, save pending answer and trigger auth
    if (status !== "authenticated") {
      savePending({
        questionId: selectedQuestion.id,
        questionText: selectedQuestion.question,
        answer,
        isAnonymous,
      });

      // Redirect to Google sign-in
      await signIn("google", { callbackUrl: "/" });
      return;
    }

    // If authenticated, create room directly
    await handleCreateRoomWithAnswer();
  };

  return (
    <div className="min-h-screen bg-background art-deco-pattern flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl font-serif mb-4 text-foreground art-deco-text art-deco-shadow">
            The Secret Game
          </h1>
          <div className="art-deco-divider my-6">
            <span>◆ ◆ ◆</span>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto">
            Pick a question. Answer it. Share with friends to see their answers.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Question Selector View */}
          {!selectedQuestion && (
            <motion.div
              key="question-selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLoadingQuestions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <QuestionSelector
                  questions={questions}
                  selectedQuestionIds={selectedQuestionIds}
                  onSelectionChange={handleSelectionChange}
                  maxSelections={1}
                />
              )}
            </motion.div>
          )}

          {/* Answer Form View */}
          {selectedQuestion && (
            <motion.div
              key="answer-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={handleClearSelection}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Choose different question
              </Button>

              {/* Selected Question Display */}
              <div className="art-deco-border bg-card/50 backdrop-blur-sm p-6 text-center">
                <p className="text-2xl sm:text-3xl font-serif text-[#f4e5c2] leading-relaxed">
                  {selectedQuestion.question}
                </p>
              </div>

              {/* Answer Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="answer" className="text-lg font-medium">
                    Your Answer
                  </Label>
                  <Textarea
                    id="answer"
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="mt-2 min-h-[120px] text-lg bg-card/50 border-border focus:border-primary"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {answer.length}/500 characters
                  </p>
                </div>

                {/* Anonymous Checkbox */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) =>
                      setIsAnonymous(checked === true)
                    }
                  />
                  <Label
                    htmlFor="anonymous"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Post anonymously (friends won&apos;t see your name)
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !answer.trim()}
                  className="art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-lg art-deco-text art-deco-glow h-auto"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Get your friends' answers"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  They only see yours once they answer
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
