import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "genuine" | "discount" | "outOfStock" | "neutral" | "success";
  className?: string;
}

const styles = {
  genuine: "bg-autox-red text-white shadow-[0_4px_14px_rgba(237,28,36,.3)]",
  discount: "bg-white text-black",
  outOfStock: "bg-autox-panel3 text-autox-gray border border-autox-border",
  neutral: "bg-white/[.05] text-white border border-white/[.08]",
  success: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20",
};

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
