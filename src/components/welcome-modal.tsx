"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface WelcomeModalProps {
  roomName?: string;
  memberCount?: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WelcomeModal({
  roomName = "The Midnight Lounge",
  memberCount = 1,
  isOpen,
  onOpenChange,
}: WelcomeModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Handle both controlled and uncontrolled state
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    // Only auto-open if not controlled externally
    if (isOpen === undefined) {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      if (!hasSeenWelcome) {
        const timer = setTimeout(() => setOpen(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, setOpen]);

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: window.location.href });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-md bg-card border-primary/20 p-0 overflow-hidden gap-0"
        showCloseButton={false}
      >
        <div className="relative p-8">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/20 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/20 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/20 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/20 rounded-br-xl" />

          <DialogHeader className="space-y-6 text-center relative z-10">
            <DialogTitle className="text-3xl font-serif text-primary drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
              You&apos;re Invited!
            </DialogTitle>

            <p className="text-muted-foreground">
              Join{" "}
              <span className="text-foreground font-semibold">{roomName}</span>{" "}
              to share secrets and discover truths.
            </p>

            <div className="bg-secondary/50 rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground mx-auto w-fit">
              <Users className="w-4 h-4" />
              <span>
                {memberCount} {memberCount === 1 ? "person" : "people"} already
                playing
              </span>
            </div>

            <div className="py-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Identify Yourself
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black hover:bg-gray-100 font-sans font-medium py-6 rounded-lg flex items-center justify-center gap-3 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path
                    fill="#4285F4"
                    d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                  />
                  <path
                    fill="#34A853"
                    d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.489 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.449 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                  />
                </g>
              </svg>
              Continue with Google
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              We use Google to verify you&apos;re a real person. We don&apos;t
              post anything to your account.
            </p>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  );
}
