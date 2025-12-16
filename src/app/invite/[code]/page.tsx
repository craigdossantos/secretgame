"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";

interface RoomInfo {
  roomId: string;
  roomName: string;
  memberCount: number;
  maxMembers: number;
  isFull: boolean;
}

export default function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const router = useRouter();
  const [code, setCode] = useState<string>("");
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setCode(p.code));
  }, [params]);

  // Fetch room info
  useEffect(() => {
    if (!code) return;

    const fetchRoomInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/invite/${code}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Invalid invite link");
          return;
        }

        setRoomInfo(data);
      } catch (err) {
        console.error("Failed to fetch room info:", err);
        setError("Failed to load invite");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomInfo();
  }, [code]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (userName.trim().length > 50) {
      setError("Name must be 50 characters or less");
      return;
    }

    try {
      setJoining(true);
      setError(null);

      const response = await fetch(`/api/invite/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: userName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to join room");
        return;
      }

      // Successfully joined - redirect to room
      router.push(`/rooms/${data.roomId}`);
    } catch (err) {
      console.error("Failed to join room:", err);
      setError("Failed to join room");
    } finally {
      setJoining(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - invalid invite
  if (error && !roomInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Invite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Room is full
  if (roomInfo?.isFull) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-yellow-500">
          <CardHeader>
            <CardTitle>Room is Full</CardTitle>
            <CardDescription>
              {roomInfo.roomName} has reached its maximum capacity of{" "}
              {roomInfo.maxMembers} members.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Create Your Own Room
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Join form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
          <CardDescription className="text-base mt-2">
            Join{" "}
            <span className="font-semibold text-foreground">
              {roomInfo?.roomName}
            </span>{" "}
            to share secrets and discover truths
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Room info */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Users className="h-4 w-4" />
            <span>
              {roomInfo?.memberCount}{" "}
              {roomInfo?.memberCount === 1 ? "person" : "people"} already
              playing
            </span>
          </div>

          {/* Join form */}
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium">
                What&apos;s your name?
              </label>
              <Input
                id="userName"
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                maxLength={50}
                required
                autoFocus
                disabled={joining}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                This is how others will see you in the room
              </p>
            </div>

            {error && roomInfo && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={joining || !userName.trim()}
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Room"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-xs text-muted-foreground border-t pt-6">
          By joining, you agree to be honest and respectful with your answers
        </CardFooter>
      </Card>
    </div>
  );
}
