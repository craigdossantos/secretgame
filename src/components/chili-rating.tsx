'use client';

import { useState } from 'react';

interface ChiliRatingProps {
  rating: number; // Current average rating 1-5
  userRating?: number; // User's personal rating
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showAverage?: boolean; // Show average rating when user hasn't rated
}

export function ChiliRating({
  rating,
  userRating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showAverage = false
}: ChiliRatingProps) {
  const [hovered, setHovered] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  };

  // Determine what rating to display
  const hasUserRating = userRating && userRating > 0;

  const getChiliClasses = (index: number) => {
    if (readonly) {
      // Readonly mode - just show filled chilies in red
      if (index <= rating) {
        return 'saturate-150 opacity-100 drop-shadow-sm'; // Filled red chili
      }
      return 'grayscale opacity-20'; // Empty gray chili
    }

    // Interactive mode
    if (!hasUserRating) {
      // No user rating yet - show outline chilies that fill red on hover
      if (isHovering && index <= hovered) {
        return 'saturate-150 opacity-100 drop-shadow-md animate-pulse'; // Filled red on hover
      }
      return 'grayscale opacity-40 hover:saturate-150 hover:opacity-100'; // Outline (gray) that becomes red on hover
    } else {
      // User has rated - show their rating, update on hover
      if (isHovering && index <= hovered) {
        return 'saturate-200 opacity-100 drop-shadow-lg scale-110'; // Hover state for new rating
      }
      if (index <= userRating) {
        return 'saturate-150 opacity-100 drop-shadow-sm'; // User's rating in red
      }
      return 'grayscale opacity-20'; // Empty gray chili
    }
  };

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseEnter={() => !readonly && setIsHovering(true)}
      onMouseLeave={() => {
        !readonly && setIsHovering(false);
        !readonly && setHovered(0);
      }}
    >
      {[1, 2, 3, 4, 5].map((index) => (
        <button
          key={index}
          type="button"
          className={`${sizeClasses[size]} transition-all duration-200 ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'
          }`}
          onMouseEnter={() => !readonly && setHovered(index)}
          onClick={() => !readonly && onRatingChange?.(index)}
          disabled={readonly}
          title={`${index} chili${index > 1 ? 's' : ''} - ${
            index === 1 ? 'Mild' :
            index === 2 ? 'Medium' :
            index === 3 ? 'Hot' :
            index === 4 ? 'Very Hot' : 'Extreme'
          }`}
        >
          <span className={`inline-block ${getChiliClasses(index)} transition-all duration-200`}>
            🌶️
          </span>
        </button>
      ))}
    </div>
  );
}