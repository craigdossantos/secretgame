'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/rating-stars';
import { SecretAnswerDisplay } from '@/components/secret-answer-display';
import { UnlockHelpTooltip } from '@/components/unlock-help-tooltip';
import { SliderConfig } from '@/lib/questions';

interface Secret {
  id: string;
  body: string;
  selfRating: number;
  importance: number;
  avgRating: number | null;
  buyersCount: number;
  authorName: string;
  authorAvatar?: string;
  createdAt: string; // ISO string from API
  isUnlocked?: boolean;
  questionText?: string;
  // Typed answer support
  answerType?: string;
  answerData?: unknown;
  questionConfig?: unknown; // Store original question config for display context
  // Anonymous answer support
  isAnonymous?: boolean;
}

interface SecretCardProps {
  secret: Secret;
  onUnlock?: (secretId: string) => void;
  onRate?: (secretId: string, rating: number) => void;
}

export function SecretCard({ secret, onUnlock, onRate }: SecretCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false); // New state for click-to-reveal

  const handleUnlock = () => {
    onUnlock?.(secret.id);
  };

  const handleRate = (rating: number) => {
    setSelectedRating(rating);
    onRate?.(secret.id, rating);
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -4,
        rotateY: isHovered ? 1 : 0,
        rotateX: isHovered ? -1 : 0,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="perspective-1000"
    >
      <Card className="art-deco-border p-5 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:art-deco-glow">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {secret.isAnonymous ? (
              <>
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">?</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground art-deco-text">Anonymous</span>
                  <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                    Hidden
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <Avatar className="w-8 h-8 border-2 border-border">
                  <AvatarImage src={secret.authorAvatar} />
                  <AvatarFallback className="bg-primary/20 text-primary">{secret.authorName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {secret.authorName}
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(secret.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <Badge variant="secondary" className="text-xs bg-secondary/50 border-border">
            Level {secret.selfRating}
          </Badge>
          <Badge variant="outline" className="text-xs bg-secondary/30 border-border">
            Keep-it-private: {secret.importance}/5
          </Badge>
          {secret.avgRating && (
            <Badge variant="default" className="text-xs flex items-center gap-1 bg-primary/80 border-primary">
              <Star className="w-3 h-3 fill-current" />
              {secret.avgRating.toFixed(1)}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="mb-4 space-y-3">
          {/* Question Text */}
          {secret.questionText && (
            <div className="pb-2 border-b border-border/50">
              <p className="text-sm font-semibold text-foreground leading-snug art-deco-shadow">
                {secret.questionText}
              </p>
            </div>
          )}

          {/* Answer */}
          {secret.isUnlocked || isRevealed ? (
            <SecretAnswerDisplay
              answerType={secret.answerType || 'text'}
              answerData={secret.answerData}
              body={secret.body}
              config={secret.questionConfig as SliderConfig | undefined}
            />
          ) : (
            <div
              className="relative cursor-pointer group"
              onClick={handleReveal}
            >
              <div className="relative p-6 rounded-lg border-2 border-dashed border-border/50 bg-secondary/20 hover:border-primary/50 hover:bg-secondary/30 transition-all">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <Lock className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors filter drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
                  <p className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                    Click to reveal answer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Level {secret.selfRating} secret
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {secret.isUnlocked || isRevealed ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rate this secret:</span>
              <RatingStars
                rating={selectedRating || 0}
                onRatingChange={handleRate}
              />
            </div>
          ) : (
            <div className="relative flex-1">
              <UnlockHelpTooltip spiciness={secret.selfRating} />
              <Button
                onClick={handleUnlock}
                className="flex items-center gap-2 art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform art-deco-text text-xs"
              >
                <Lock className="w-4 h-4" />
                Unlock (Level {secret.selfRating}+)
              </Button>
            </div>
          )}

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {secret.buyersCount}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}