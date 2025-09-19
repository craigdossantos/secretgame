'use client';

import { useState } from 'react';

interface ChiliRatingProps {
  rating: number; // 1-5
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ChiliRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md'
}: ChiliRatingProps) {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const currentRating = hovered || rating;

  const getChiliColor = (index: number) => {
    if (index <= currentRating) {
      if (currentRating <= 1) return 'text-green-500'; // Mild
      if (currentRating <= 2) return 'text-yellow-500'; // Medium
      if (currentRating <= 3) return 'text-orange-500'; // Hot
      if (currentRating <= 4) return 'text-red-500'; // Very Hot
      return 'text-red-700'; // Extreme
    }
    return 'text-gray-300';
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((index) => (
        <button
          key={index}
          className={`${sizeClasses[size]} ${getChiliColor(index)} transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          onMouseEnter={() => !readonly && setHovered(index)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onRatingChange?.(index)}
          disabled={readonly}
          title={`${index} chili${index > 1 ? 's' : ''} - ${
            index === 1 ? 'Mild' :
            index === 2 ? 'Medium' :
            index === 3 ? 'Hot' :
            index === 4 ? 'Very Hot' : 'Extreme'
          }`}
        >
          🌶️
        </button>
      ))}
    </div>
  );
}