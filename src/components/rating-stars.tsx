'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingStars({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = 'md',
  className = '',
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const displayRating = hoverRating ?? rating;

  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1;
        const isFilled = starIndex <= displayRating;

        return (
          <Star
            key={i}
            className={`${sizeClasses[size]} transition-colors ${
              isFilled
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } ${
              !readonly
                ? 'cursor-pointer hover:text-yellow-400 hover:fill-yellow-400'
                : ''
            }`}
            onMouseEnter={!readonly ? () => setHoverRating(starIndex) : undefined}
            onMouseLeave={!readonly ? () => setHoverRating(null) : undefined}
            onClick={!readonly ? () => onRatingChange?.(starIndex) : undefined}
          />
        );
      })}
    </div>
  );
}