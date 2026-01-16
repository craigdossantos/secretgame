"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { countWords, MAX_WORD_COUNT } from "@/lib/utils";

interface UnlockDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requiredRating: number;
  onSubmit: (secret: {
    body: string;
    selfRating: number;
    importance: number;
  }) => void;
}

export function UnlockDrawer({
  isOpen,
  onOpenChange,
  requiredRating,
  onSubmit,
}: UnlockDrawerProps) {
  const [body, setBody] = useState("");
  const [selfRating, setSelfRating] = useState(requiredRating);
  const [importance, setImportance] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wordCount = countWords(body);
  const isValidWordCount = wordCount <= MAX_WORD_COUNT && wordCount > 0;
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
      setBody("");
      setSelfRating(requiredRating);
      setImportance(3);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit secret:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="bg-card/95 backdrop-blur-sm flex flex-col art-deco-border border-t-2 h-[90vh] mt-24 fixed bottom-0 left-0 right-0">
          <div className="p-6 bg-card/95 backdrop-blur-sm flex-1 overflow-y-auto">
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-primary/40 mb-8" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Drawer.Title className="text-2xl font-serif text-foreground art-deco-text art-deco-shadow">
                  Submit a Level {requiredRating}+ Secret
                </Drawer.Title>
                <p className="text-muted-foreground text-sm mt-2">
                  Share a secret to unlock this one
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-full hover:bg-primary/10"
                aria-label="Close secret submission form"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>

            {/* Art Deco Divider */}
            <div className="art-deco-divider my-6">
              <span>◆</span>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Secret Body */}
              <div className="space-y-2">
                <Label
                  htmlFor="secret-body"
                  className="text-foreground art-deco-text text-sm"
                >
                  Your Secret
                </Label>
                <Textarea
                  id="secret-body"
                  placeholder="Share something personal, embarrassing, or surprising..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-32 resize-none bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex justify-between text-sm">
                  <span
                    className={
                      wordCount > 100 ? "text-red-500" : "text-muted-foreground"
                    }
                  >
                    {wordCount}/100 words
                  </span>
                  {!isValidWordCount && wordCount > 0 && (
                    <span className="text-red-500">Too many words</span>
                  )}
                </div>
              </div>

              {/* Rating Slider */}
              <div className="space-y-3">
                <Label className="text-foreground art-deco-text text-sm">
                  Spiciness Level: {selfRating}/5
                </Label>
                <Slider
                  value={[selfRating]}
                  onValueChange={(value) => setSelfRating(value[0])}
                  max={5}
                  min={1}
                  step={1}
                  className="w-1/4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not secret</span>
                  <span>Very secret</span>
                </div>
                {!isValidRating && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="destructive"
                      className="text-xs bg-red-600 text-white"
                    >
                      Must be level {requiredRating} or higher
                    </Badge>
                  </div>
                )}
              </div>

              {/* Importance Slider */}
              <div className="space-y-3">
                <Label className="text-foreground art-deco-text text-sm">
                  Keep-it-private: {importance}/5
                </Label>
                <Slider
                  value={[importance]}
                  onValueChange={(value) => setImportance(value[0])}
                  max={5}
                  min={1}
                  step={1}
                  className="w-1/4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shareable</span>
                  <span>Very private</span>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 art-deco-border bg-secondary/30 backdrop-blur-sm">
                <p className="text-sm text-foreground">
                  <span className="text-primary">⚠️</span>{" "}
                  <strong className="art-deco-text">
                    No edits in V0—post carefully.
                  </strong>{" "}
                  Your secret will be visible to others who unlock it.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!isValidWordCount || !isValidRating || isSubmitting}
                className="w-full art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium art-deco-text art-deco-glow"
              >
                {isSubmitting ? (
                  "Submitting..."
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
