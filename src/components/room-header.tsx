"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserIdentityHeader } from "@/components/user-identity-header";
import { ArrowLeft, Users, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { RoomWithDetails } from "@/types/models";

interface RoomHeaderProps {
  room: RoomWithDetails | null;
}

export function RoomHeader({ room }: RoomHeaderProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  const copyInviteLink = async () => {
    if (room) {
      const inviteUrl = `${window.location.origin}/invite/${room.inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Top row: Title and back button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="rounded-full hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-serif text-foreground art-deco-text art-deco-shadow">
                {room?.name || "Secret Room"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className="text-xs flex items-center gap-1 bg-secondary/50 border border-border"
                >
                  <Users className="w-3 h-3" />
                  {room?.memberCount || 1} member
                  {room?.memberCount !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <UserIdentityHeader />
          </div>
        </div>

        {/* Art Deco Divider */}
        <div className="art-deco-divider my-4">
          <span>&#9670;</span>
        </div>

        {/* Invite link card */}
        {room && (
          <div className="art-deco-border bg-card/50 backdrop-blur-sm p-4 art-deco-glow">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary font-medium mb-2 art-deco-text">
                  Invite Link
                </p>
                <p className="text-sm font-mono text-foreground break-all">
                  {`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${room.inviteCode}`}
                </p>
              </div>
              <Button
                onClick={copyInviteLink}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 shrink-0 bg-secondary border-border hover:bg-primary hover:text-primary-foreground transition-all"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
