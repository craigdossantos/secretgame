"use client";

import {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CallbackState = "checking" | "processing" | "success" | "error";

const STORAGE_KEY = "secretgame_pending_answer";
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

interface PendingAnswer {
  questionId: string;
  questionText: string;
  answer: string;
  isAnonymous: boolean;
  slug?: string;
  createdAt: number;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { status } = useSession();
  const isProcessingRef = useRef(false);

  const [state, setState] = useState<CallbackState>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check localStorage synchronously on mount (before paint)
  // Using useLayoutEffect ensures this runs before the browser paints
  useLayoutEffect(() => {
    // If not in browser, skip
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // No pending answer - redirect to homepage
        router.replace("/");
        return;
      }

      const pending = JSON.parse(stored) as PendingAnswer;

      // Check if expired (>30 min)
      if (Date.now() - pending.createdAt >= EXPIRY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        toast.error("Your answer expired. Please try again.");
        router.replace("/");
        return;
      }

      // We have a valid pending answer - wait for auth
      setState("checking");
    } catch {
      // Invalid data in localStorage
      localStorage.removeItem(STORAGE_KEY);
      router.replace("/");
    }
  }, [router]);

  // Create room from pending answer
  const processCreateRoom = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        router.replace("/");
        return;
      }

      const pending = JSON.parse(stored) as PendingAnswer;

      // Double-check expiry
      if (Date.now() - pending.createdAt >= EXPIRY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        toast.error("Your answer expired. Please try again.");
        router.replace("/");
        return;
      }

      setState("processing");

      // Create the room
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: pending.questionId,
          questionText: pending.questionText,
          answer: pending.answer,
          isAnonymous: pending.isAnonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      // Clear pending answer
      localStorage.removeItem(STORAGE_KEY);

      setState("success");

      // Redirect to the room with welcome flag
      const roomPath = data.slug ? `/${data.slug}` : `/rooms/${data.roomId}`;
      router.replace(`${roomPath}?welcome=true`);
    } catch (error) {
      console.error("Failed to create room:", error);
      setState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create room",
      );
      isProcessingRef.current = false;
    }
  }, [router]);

  // Process pending answer once authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      // Auth was cancelled or failed
      toast.error("Sign in was cancelled");
      router.replace("/");
      return;
    }

    if (status === "authenticated" && !isProcessingRef.current) {
      processCreateRoom();
    }
  }, [status, router, processCreateRoom]);

  const handleRetry = () => {
    setState("processing");
    setErrorMessage(null);
    processCreateRoom();
  };

  const handleGoHome = () => {
    localStorage.removeItem(STORAGE_KEY);
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-background art-deco-pattern flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Art Deco Header */}
        <h1 className="text-3xl font-serif mb-4 text-foreground art-deco-text art-deco-shadow">
          The Secret Game
        </h1>
        <div className="art-deco-divider my-6">
          <span>◆ ◆ ◆</span>
        </div>

        {/* State-dependent content */}
        {(state === "checking" || state === "processing") && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-lg text-muted-foreground">
                {state === "checking"
                  ? "Preparing your room..."
                  : "Creating your room..."}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              This will only take a moment
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-lg text-muted-foreground">
                Room created! Redirecting...
              </span>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-6">
            <div className="art-deco-border bg-card/50 backdrop-blur-sm p-6">
              <p className="text-lg text-foreground mb-2">
                Something went wrong
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {errorMessage || "Failed to create your room"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleRetry}
                  className="art-deco-border bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleGoHome}>
                  Go to Homepage
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
