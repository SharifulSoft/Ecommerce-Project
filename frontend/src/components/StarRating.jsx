import { useState } from 'react';

export default function StarRating({ rating = 0, onRatingChange = null, interactive = false, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const displayRating = interactive ? hoverRating || rating : rating;

  const handleStarClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${sizeClasses[size]} transition-all ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
          disabled={!interactive}
        >
          {star <= displayRating ? (
            <span className="text-yellow-400">★</span>
          ) : (
            <span className="text-gray-300">☆</span>
          )}
        </button>
      ))}
    </div>
  );
}

