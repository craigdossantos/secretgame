"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Lock, Users, Loader2 } from "lucide-react";
import { SecretAnswerDisplay } from "@/components/secret-answer-display";
import { MCCollaborativeDisplay } from "@/components/mc-collaborative-display";
import { toast } from "sonner";
import { QuestionPrompt } from "@/lib/questions";

interface CollaborativeAnswer {
  id: string;
  body: string | null;
  selfRating: number;
  importance: number;
  avgRating: number | null;
  buyersCount: number;
  authorName: string;
  authorAvatar?: string;
  authorId: string;
  isAnonymous: boolean;
  createdAt: string;
  isUnlocked: boolean;
  isOwnSecret: boolean;
  answerType?: string;
  answerData?: unknown;
}

interface CollaborativeAnswersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  questionText: string;
  question?: QuestionPrompt; // Optional full question object with config
  roomId: string;
  onUnlock?: (secretId: string) => void;
}

export function CollaborativeAnswersModal({
  open,
  onOpenChange,
  questionId,
  questionText,
  question,
  roomId,
  onUnlock,
}: CollaborativeAnswersModalProps) {
  const [answers, setAnswers] = useState<CollaborativeAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadAnswers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user ID from cookies
      const userId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userId="))
        ?.split("=")[1];
      setCurrentUserId(userId || null);

      const response = await fetch(
        `/api/questions/${questionId}/answers?roomId=${roomId}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load answers");
      }

      setAnswers(data.answers || []);
    } catch (err) {
      console.error("Failed to load collaborative answers:", err);
      setError(err instanceof Error ? err.message : "Failed to load answers");
      toast.error("Failed to load answers");
    } finally {
      setLoading(false);
    }
  }, [questionId, roomId]);

  useEffect(() => {
    if (open && questionId && roomId) {
      loadAnswers();
    }
  }, [roomId, questionId, open, loadAnswers]);

  const handleUnlock = (secretId: string) => {
    onUnlock?.(secretId);
    // Reload answers after unlocking to show updated content
    setTimeout(() => loadAnswers(), 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl pr-8">All Answers</DialogTitle>
          <DialogDescription className="text-base">
            {questionText}
          </DialogDescription>
        </DialogHeader>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={loadAnswers} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {/* Answers list */}
        {!loading && !error && (
          <div className="space-y-4">
            {/* Header with count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {answers.length} {answers.length === 1 ? "person" : "people"}{" "}
                answered
              </span>
            </div>

            {/* Empty state */}
            {answers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No answers yet</p>
              </div>
            )}

            {/* Multiple Choice Collaborative Display */}
            {question?.questionType === "multipleChoice" &&
              question?.answerConfig &&
              question.answerConfig.type === "multipleChoice" &&
              currentUserId &&
              answers.every((a) => a.isUnlocked) && (
                <div className="border rounded-lg p-4 bg-card/50">
                  <MCCollaborativeDisplay
                    options={question.answerConfig.config.options}
                    answers={answers
                      .filter((a) => a.answerData && a.isUnlocked)
                      .map((a) => ({
                        userId: a.authorId,
                        userName: a.authorName,
                        userAvatar: a.authorAvatar,
                        isAnonymous: a.isAnonymous,
                        selected:
                          (a.answerData as { selected?: string[] })?.selected ||
                          [],
                      }))}
                    currentUserId={currentUserId}
                  />
                </div>
              )}

            {/* Answer cards */}
            {answers.map((answer) => (
              <div
                key={answer.id}
                className="border rounded-lg p-4 space-y-3 bg-card/50 hover:bg-card transition-colors"
              >
                {/* Author header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {answer.isAnonymous ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            ?
                          </span>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Anonymous
                        </span>
                      </>
                    ) : (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={answer.authorAvatar} />
                          <AvatarFallback>
                            {answer.authorName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {answer.authorName}
                        </span>
                      </>
                    )}
                    {answer.isOwnSecret && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        You
                      </Badge>
                    )}
                  </div>

                  {/* Spiciness rating */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: answer.selfRating }).map((_, i) => (
                      <span key={i} className="text-sm">
                        🌶️
                      </span>
                    ))}
                  </div>
                </div>

                {/* Answer content */}
                {answer.isUnlocked ? (
                  <div className="space-y-2">
                    {answer.answerType && answer.answerType !== "text" ? (
                      <SecretAnswerDisplay
                        answerType={answer.answerType}
                        answerData={answer.answerData}
                        body={answer.body || ""}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {answer.body}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-4 px-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Locked - Share your own secret to unlock</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnlock(answer.id)}
                    >
                      Unlock
                    </Button>
                  </div>
                )}

                {/* Metadata */}
                {answer.isUnlocked && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      {answer.buyersCount}{" "}
                      {answer.buyersCount === 1 ? "unlock" : "unlocks"}
                    </span>
                    {answer.avgRating && (
                      <span>★ {answer.avgRating.toFixed(1)} avg rating</span>
                    )}
                    <span>
                      {new Date(answer.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
