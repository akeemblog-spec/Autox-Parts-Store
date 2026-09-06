import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: number;
  className?: string;
}

export function Rating({ value, reviewCount, size = 13, className }: RatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star size={size} className="fill-autox-red text-autox-red" />
      <span className="text-xs font-semibold text-white">{value.toFixed(1)}</span>
      {typeof reviewCount === "number" && (
        <span className="text-xs text-autox-gray">({reviewCount})</span>
      )}
    </div>
  );
}
