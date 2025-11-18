'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TextIcon, SlidersHorizontal, CheckSquare, Lock, Unlock } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupMode: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to create room');
        return;
      }

      // Redirect to room in setup mode
      router.push(`/rooms/${data.roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background art-deco-pattern flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-serif mb-4 text-foreground art-deco-text art-deco-shadow">
            The Secret Game
          </h1>
          <div className="art-deco-divider my-6">
            <span>◆ ◆ ◆</span>
          </div>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Ask about friend&apos;s secrets. Answer anonymously. Unlock their secrets by sharing your answers.
          </p>
        </div>

        {/* How It Works - Visual Explanation */}
        <div className="space-y-8 mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-6 art-deco-text">How It Works</h2>
          </div>

          {/* Step 1: Choose Questions */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg art-deco-border">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Choose Your Questions</h3>
              <p className="text-muted-foreground mb-3">
                Pick from different question types or create your own
              </p>
              <div className="flex gap-3">
                <div className="flex-1 p-3 rounded-lg bg-card border border-border flex items-center gap-2">
                  <TextIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Text</span>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-card border border-border flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Slider</span>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-card border border-border flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Choice</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Answer Questions */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg art-deco-border">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Everyone Answers</h3>
              <p className="text-muted-foreground">
                Each person rates how vulnerable their answer is with 🌶️ chili peppers
              </p>
            </div>
          </div>

          {/* Step 3: Unlock with Matching Spiciness */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg art-deco-border">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Unlock Others&apos; Secrets</h3>
              <p className="text-muted-foreground mb-3">
                Share a secret with matching spiciness to see someone else&apos;s answer
              </p>
              <div className="flex gap-3">
                <div className="flex-1 p-4 rounded-lg bg-card border border-border text-center">
                  <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Locked</div>
                  <div className="text-xs mt-1">Need 🌶️🌶️🌶️</div>
                </div>
                <div className="flex items-center justify-center text-2xl">→</div>
                <div className="flex-1 p-4 rounded-lg bg-primary/10 border border-primary text-center">
                  <Unlock className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">Unlocked!</div>
                  <div className="text-xs mt-1 text-muted-foreground">You shared 🌶️🌶️🌶️</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Connect Deeper */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg art-deco-border">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Connect Deeper</h3>
              <p className="text-muted-foreground">
                The more vulnerable you are, the more you unlock. Build genuine connections.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-lg art-deco-text art-deco-glow h-auto"
            size="lg"
          >
            {isCreating ? 'Creating Room...' : 'Create Room'}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Free to use · No sign up required · Private by default
          </p>
        </div>
      </div>
    </div>
  );
}
