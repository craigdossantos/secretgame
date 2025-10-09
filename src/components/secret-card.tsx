'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/rating-stars';

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
}

interface SecretCardProps {
  secret: Secret;
  onUnlock?: (secretId: string) => void;
  onRate?: (secretId: string, rating: number) => void;
}

export function SecretCard({ secret, onUnlock, onRate }: SecretCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleUnlock = () => {
    onUnlock?.(secret.id);
  };

  const handleRate = (rating: number) => {
    setSelectedRating(rating);
    onRate?.(secret.id, rating);
  };


  const blurredPreview = secret.body.slice(0, 50) + '...';

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
      <Card className="rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white/95 border border-black/5 transition-all duration-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={secret.authorAvatar} />
              <AvatarFallback>{secret.authorName[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">
              {secret.authorName}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(secret.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            Level {secret.selfRating}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Keep-it-private: {secret.importance}/5
          </Badge>
          {secret.avgRating && (
            <Badge variant="default" className="text-xs flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {secret.avgRating.toFixed(1)}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          {secret.isUnlocked ? (
            <p className="text-gray-800 leading-relaxed">
              {secret.body}
            </p>
          ) : (
            <div className="relative">
              <p className="text-gray-800 leading-relaxed blur-sm select-none">
                {blurredPreview}
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-white/60" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {secret.isUnlocked ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rate this secret:</span>
              <RatingStars
                rating={selectedRating || 0}
                onRatingChange={handleRate}
              />
            </div>
          ) : (
            <Button
              onClick={handleUnlock}
              className="flex items-center gap-2 rounded-xl hover:scale-105 transition-transform"
            >
              <Lock className="w-4 h-4" />
              Unlock by submitting a level {secret.selfRating}+ secret
            </Button>
          )}

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            {secret.buyersCount}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}