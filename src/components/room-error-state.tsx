"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RoomErrorStateProps {
  error: string;
}

export function RoomErrorState({ error }: RoomErrorStateProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background art-deco-pattern flex items-center justify-center">
      <div className="text-center art-deco-border p-8 bg-card/50 backdrop-blur-sm art-deco-glow max-w-md">
        <h1 className="text-2xl font-serif text-foreground mb-2 art-deco-text art-deco-shadow">
          Room Not Found
        </h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="bg-secondary border-border hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
