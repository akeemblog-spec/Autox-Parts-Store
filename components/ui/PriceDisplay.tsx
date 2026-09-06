import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface PriceDisplayProps {
  price: number;
  previousPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-3xl",
};

export function PriceDisplay({ price, previousPrice, size = "md", className }: PriceDisplayProps) {
  return (
    <div className={cn("flex items-baseline gap-2 flex-wrap", className)}>
      <span className={cn("font-bold text-white", sizeClasses[size])}>{formatPrice(price)}</span>
      {previousPrice && previousPrice > price && (
        <span className="text-xs text-autox-gray line-through">{formatPrice(previousPrice)}</span>
      )}
    </div>
  );
}
