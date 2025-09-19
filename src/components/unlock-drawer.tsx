'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface UnlockDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requiredRating: number;
  onSubmit: (secret: { body: string; selfRating: number; importance: number }) => void;
}

export function UnlockDrawer({ isOpen, onOpenChange, requiredRating, onSubmit }: UnlockDrawerProps) {
  const [body, setBody] = useState('');
  const [selfRating, setSelfRating] = useState(requiredRating);
  const [importance, setImportance] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wordCount = body.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isValidWordCount = wordCount <= 100 && wordCount > 0;
  const isValidRating = selfRating >= requiredRating;

  const handleSubmit = async () => {
    if (!isValidWordCount || !isValidRating) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        body: body.trim(),
        selfRating,
        importance,
      });

      // Reset form
      setBody('');
      setSelfRating(requiredRating);
      setImportance(3);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit secret:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-2xl h-[90vh] mt-24 fixed bottom-0 left-0 right-0">
          <div className="p-4 bg-white rounded-t-2xl flex-1">
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Drawer.Title className="text-xl font-semibold">
                  Submit a Level {requiredRating}+ Secret
                </Drawer.Title>
                <p className="text-gray-600 text-sm mt-1">
                  Share a secret to unlock this one
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Secret Body */}
              <div className="space-y-2">
                <Label htmlFor="secret-body">Your Secret</Label>
                <Textarea
                  id="secret-body"
                  placeholder="Share something personal, embarrassing, or surprising..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-32 resize-none"
                />
                <div className="flex justify-between text-sm">
                  <span className={wordCount > 100 ? 'text-red-500' : 'text-gray-500'}>
                    {wordCount}/100 words
                  </span>
                  {!isValidWordCount && wordCount > 0 && (
                    <span className="text-red-500">Too many words</span>
                  )}
                </div>
              </div>

              {/* Rating Slider */}
              <div className="space-y-3">
                <Label>Secrecy Level: {selfRating}/5</Label>
                <Slider
                  value={[selfRating]}
                  onValueChange={(value) => setSelfRating(value[0])}
                  max={5}
                  min={1}
                  step={1}
                  className="w-1/4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Not secret</span>
                  <span>Very secret</span>
                </div>
                {!isValidRating && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      Must be level {requiredRating} or higher
                    </Badge>
                  </div>
                )}
              </div>

              {/* Importance Slider */}
              <div className="space-y-3">
                <Label>Keep-it-private: {importance}/5</Label>
                <Slider
                  value={[importance]}
                  onValueChange={(value) => setImportance(value[0])}
                  max={5}
                  min={1}
                  step={1}
                  className="w-1/4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Shareable</span>
                  <span>Very private</span>
                </div>
              </div>

              {/* Warning */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>No edits in V0—post carefully.</strong> Your secret will be visible to others who unlock it.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!isValidWordCount || !isValidRating || isSubmitting}
                className="w-full rounded-xl h-12 text-base font-medium"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit & Unlock
                  </>
                )}
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}