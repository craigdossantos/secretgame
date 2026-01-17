"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, LogOut, Loader2 } from "lucide-react";

interface AuthButtonProps {
  onSignInClick?: () => void;
  variant?: "default" | "minimal" | "cta";
  ctaText?: string;
}

export function AuthButton({
  onSignInClick,
  variant = "default",
  ctaText = "Sign in with Google",
}: AuthButtonProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {variant !== "minimal" && (
          <Avatar className="w-8 h-8">
            {session.user.image && (
              <AvatarImage
                src={session.user.image}
                alt={session.user.name || ""}
              />
            )}
            <AvatarFallback>
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        )}
        {variant === "default" && (
          <span className="text-sm">{session.user.name}</span>
        )}
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  const handleClick = () => {
    if (onSignInClick) {
      onSignInClick();
    }
    signIn("google");
  };

  if (variant === "cta") {
    return (
      <Button onClick={handleClick} size="lg" className="gap-2">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {ctaText}
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleClick} className="gap-2">
      <LogIn className="w-4 h-4" />
      Sign in
    </Button>
  );
}
