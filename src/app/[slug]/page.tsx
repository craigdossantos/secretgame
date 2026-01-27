"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LoginButton } from "@/components/auth/login-button";
import { usePendingAnswer } from "@/hooks/use-pending-answer";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Users, Check, Share2 } from "lucide-react";

interface RoomData {
  id: string;
  name: string | null;
  slug: string | null;
  isAnonymous: boolean;
  question: {
    id: string;
    question: string;
    category: string | null;
    suggestedLevel: number | null;
  } | null;
  answerCount: number;
  participants: {
    id: string;
    name: string;
    avatarUrl: string | null;
  }[];
  userHasAnswered: boolean;
  answers: {
    id: string;
    body: string;
    authorId: string;
    authorName: string;
    authorAvatar: string | null;
    createdAt: string;
  }[];
}

type PageStep = "loading" | "answer" | "auth" | "reveal" | "error";

export default function SlugPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { data: session, status } = useSession();
  const { savePending, getPending, clearPending } = usePendingAnswer();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [step, setStep] = useState<PageStep>("loading");
  const [error, setError] = useState<string | null>(null);

  // Welcome state (shown after room creation)
  const [showWelcome, setShowWelcome] = useState(false);

  // Answer form state
  const [answer, setAnswer] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Share state
  const [isCopied, setIsCopied] = useState(false);

  // Ref to prevent race condition during post-auth submission
  const isSubmittingRef = useRef(false);

  // Check for welcome query param (room just created)
  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true);
      // Clean up URL without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  // Load room data
  const loadRoom = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/slug/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Room not found");
          setStep("error");
          return;
        }
        throw new Error("Failed to load room");
      }

      const data = await response.json();
      setRoom(data.room);

      // Determine initial step
      if (data.room.userHasAnswered) {
        setStep("reveal");
      } else {
        setStep("answer");
      }
    } catch (err) {
      console.error("Failed to load room:", err);
      setError("Failed to load room");
      setStep("error");
    }
  }, [slug]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  // Handle post-auth pending answer submission
  const processPostAuthPendingAnswer = useCallback(async () => {
    if (isSubmittingRef.current) return;

    const pending = getPending();
    if (pending && pending.slug === slug) {
      isSubmittingRef.current = true;
      await submitAnswer(pending.answer, pending.isAnonymous);
    }
  }, [getPending, slug]);

  useEffect(() => {
    if (status === "authenticated" && session?.user && room) {
      processPostAuthPendingAnswer();
    }
  }, [status, session, room, processPostAuthPendingAnswer]);

  const submitAnswer = async (answerText: string, anonymous: boolean) => {
    if (!room?.question) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/rooms/slug/${slug}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: answerText,
          isAnonymous: anonymous,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to submit answer");
        return;
      }

      // Clear pending answer
      clearPending();

      // Reload room data to get all answers
      await loadRoom();
      setStep("reveal");
      toast.success("Answer submitted! Now you can see everyone's answers.");
    } catch (err) {
      console.error("Failed to submit:", err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error("Please write your answer");
      return;
    }

    // If not authenticated, save pending and trigger auth
    if (status !== "authenticated") {
      savePending({
        questionId: room?.question?.id || "",
        questionText: room?.question?.question || "",
        answer,
        isAnonymous,
        slug,
      });

      await signIn("google", { callbackUrl: `/${slug}` });
      return;
    }

    // Submit directly if authenticated
    await submitAnswer(answer, isAnonymous);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${slug}`;

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: room?.question?.question || "The Secret Game",
          text: "Answer this question and see what others said!",
          url: shareUrl,
        });
        return;
      } catch {
        // Fall back to copy
      }
    }

    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Error state
  if (step === "error") {
    return (
      <div className="min-h-screen bg-background art-deco-pattern flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-serif mb-4 art-deco-text">
            {error || "Something went wrong"}
          </h1>
          <p className="text-muted-foreground mb-6">
            This room might not exist or has been deleted.
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (step === "loading" || !room) {
    return (
      <div className="min-h-screen bg-background art-deco-pattern flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background art-deco-pattern">
      {/* Header */}
      <header className="fixed top-0 right-0 p-4 z-50">
        <LoginButton redirectTo={`/${slug}`} variant="outline" />
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-12">
        {/* Welcome Banner (shown after room creation) */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="art-deco-border bg-primary/20 backdrop-blur-sm p-6 mb-8 text-center"
            >
              <h2 className="text-xl font-serif text-[#f4e5c2] mb-2 art-deco-text">
                Room Created!
              </h2>
              <p className="text-muted-foreground mb-4">
                Share this link with friends to see their answers
              </p>
              <Button
                onClick={handleShare}
                className="art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                size="lg"
              >
                {isCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    Share with Friends
                  </>
                )}
              </Button>
              <button
                onClick={() => setShowWelcome(false)}
                className="block mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <div className="art-deco-border bg-card/50 backdrop-blur-sm p-8 text-center mb-8">
          <p className="text-2xl sm:text-3xl font-serif text-[#f4e5c2] leading-relaxed">
            {room.question?.question || "No question set"}
          </p>
        </div>

        {/* Participants indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            {room.answerCount} {room.answerCount === 1 ? "person" : "people"}{" "}
            answered
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* Answer Form */}
          {step === "answer" && (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
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
                  Post anonymously (others won&apos;t see your name)
                </Label>
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
                      Submitting...
                    </>
                  ) : (
                    "See everyone's answers"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  {status === "authenticated"
                    ? "Your answer will be shared with others"
                    : "You'll need to sign in to see answers"}
                </p>
              </div>
            </motion.div>
          )}

          {/* Reveal Answers */}
          {step === "reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* All Answers */}
              <div className="space-y-4">
                <h2 className="text-xl font-serif art-deco-text text-center">
                  Everyone&apos;s Answers
                </h2>

                {room.answers.map((ans, index) => (
                  <motion.div
                    key={ans.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="art-deco-border bg-card/50 backdrop-blur-sm p-5"
                  >
                    <p className="text-foreground leading-relaxed mb-3">
                      {ans.body}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {ans.authorAvatar && !room.isAnonymous ? (
                        <Image
                          src={ans.authorAvatar}
                          alt={ans.authorName}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                          {room.isAnonymous ? "?" : ans.authorName.charAt(0)}
                        </div>
                      )}
                      <span>
                        {room.isAnonymous ? "Anonymous" : ans.authorName}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {room.answers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No answers yet. Be the first!</p>
                  </div>
                )}
              </div>

              {/* Share CTA */}
              <div className="art-deco-border bg-primary/10 p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Now it&apos;s your turn!
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ask your friends a question and see what they say
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="gap-2"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        Share this question
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/")}
                    className="gap-2 art-deco-border"
                  >
                    Ask your own question
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
