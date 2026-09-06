import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "genuine" | "discount" | "outOfStock" | "neutral";
  className?: string;
}

const styles = {
  genuine: "bg-autox-red text-white",
  discount: "bg-white text-black",
  outOfStock: "bg-autox-panel3 text-autox-gray border border-autox-border",
  neutral: "bg-autox-panel3 text-white border border-autox-border",
};

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
