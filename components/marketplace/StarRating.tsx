// components/marketplace/StarRating.tsx
"use client";

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviews?: number;
  showCount?: boolean;
  size?: "sm" | "md";
}

export default function StarRating({
  rating,
  reviews,
  showCount = true,
  size = "sm",
}: StarRatingProps) {
  const iconClass = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`${iconClass} ${
              s <= Math.round(rating)
                ? "text-amber-500 fill-amber-500"
                : "text-zinc-200 fill-zinc-200"
            }`}
            strokeWidth={0}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-[11px] font-semibold text-zinc-800 leading-none">
          {rating.toFixed(1)}
        </span>
      )}
      {showCount && reviews !== undefined && (
        <span className="text-[10px] text-zinc-400 leading-none">({reviews})</span>
      )}
    </div>
  );
}

