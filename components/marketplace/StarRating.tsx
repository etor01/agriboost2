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
  const iconClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`${iconClass} ${
              s <= Math.round(rating)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200 fill-gray-200"
            }`}
            strokeWidth={0}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs font-semibold text-amber-600 leading-none">
          {rating.toFixed(1)}
        </span>
      )}
      {showCount && reviews !== undefined && (
        <span className="text-xs text-gray-400 leading-none">({reviews})</span>
      )}
    </div>
  );
}
