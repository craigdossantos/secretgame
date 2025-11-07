'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock, Heart } from 'lucide-react';

interface WelcomeModalProps {
  roomName?: string;
}

export function WelcomeModal({ roomName }: WelcomeModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome modal before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

    if (!hasSeenWelcome) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Mark as seen
    localStorage.setItem('hasSeenWelcome', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Welcome to The Secret Game
            {roomName && (
              <span className="block text-base font-normal text-muted-foreground mt-2">
                {roomName}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            A game of vulnerability, honesty, and connection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1 */}
          <div className="flex gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold mb-1">Answer Questions Honestly</h4>
              <p className="text-sm text-muted-foreground">
                Share your thoughts, experiences, and secrets with the group
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                Rate Your Spiciness
                <span className="text-base">🌶️</span>
              </h4>
              <p className="text-sm text-muted-foreground">
                How vulnerable is your answer? Rate it from 1-5 chilis
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600 font-semibold text-sm shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                Unlock Secrets
                <Lock className="h-4 w-4" />
              </h4>
              <p className="text-sm text-muted-foreground">
                To see others&apos; secrets, share your own secret of equal or higher spiciness
              </p>
            </div>
          </div>

          {/* Key principle */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-start gap-2">
              <Heart className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-foreground">
                The more vulnerable you are, the more you learn about others
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full" size="lg">
            Let&apos;s Go!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
