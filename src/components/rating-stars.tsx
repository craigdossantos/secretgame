"use client";

import { useState, useCallback } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function RatingStars({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = "md",
  className = "",
  label = "Rating",
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const displayRating = hoverRating ?? rating;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, starIndex: number) => {
      if (readonly) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onRatingChange?.(starIndex);
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        const newRating = Math.min(5, rating + 1);
        onRatingChange?.(newRating);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        const newRating = Math.max(1, rating - 1);
        onRatingChange?.(newRating);
      }
    },
    [readonly, rating, onRatingChange],
  );

  return (
    <div
      className={`flex gap-1 ${className}`}
      role="radiogroup"
      aria-label={label}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1;
        const isFilled = starIndex <= displayRating;
        const isSelected = starIndex === rating;

        if (readonly) {
          return (
            <Star
              key={i}
              className={`${sizeClasses[size]} transition-colors ${
                isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
              aria-hidden="true"
            />
          );
        }

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${starIndex} star${starIndex !== 1 ? "s" : ""}`}
            tabIndex={isSelected || (rating === 0 && i === 0) ? 0 : -1}
            className={`p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 ${
              !readonly ? "cursor-pointer" : ""
            }`}
            onMouseEnter={() => setHoverRating(starIndex)}
            onMouseLeave={() => setHoverRating(null)}
            onClick={() => onRatingChange?.(starIndex)}
            onKeyDown={(e) => handleKeyDown(e, starIndex)}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              } ${!readonly ? "hover:text-yellow-400 hover:fill-yellow-400" : ""}`}
              aria-hidden="true"
            />
          </button>
        );
      })}
      <span className="sr-only">{rating} of 5 stars selected</span>
    </div>
  );
}
