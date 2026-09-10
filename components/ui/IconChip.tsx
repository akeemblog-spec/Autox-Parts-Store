import { cn } from "@/lib/utils/cn";

type ChipTone = "red" | "neutral" | "active" | "success";
type ChipSize = "sm" | "md" | "lg";

const toneClasses: Record<ChipTone, string> = {
  red: "bg-autox-red/10 text-autox-red ring-1 ring-inset ring-autox-red/20",
  active: "bg-autox-red text-white shadow-[0_8px_22px_rgba(237,28,36,.28)]",
  neutral: "bg-white/[.05] text-zinc-400 ring-1 ring-inset ring-white/[.06]",
  success: "bg-emerald-400/10 text-emerald-400 ring-1 ring-inset ring-emerald-400/20",
};

const sizeClasses: Record<ChipSize, string> = {
  sm: "h-8 w-8 rounded-lg [&>svg]:h-3.5 [&>svg]:w-3.5",
  md: "h-10 w-10 rounded-xl [&>svg]:h-[18px] [&>svg]:w-[18px]",
  lg: "h-12 w-12 rounded-2xl [&>svg]:h-5 [&>svg]:w-5",
};

/**
 * Small colored icon square/circle used throughout cart, order tracking and the
 * floating nav. Use this instead of one-off inline spans so every page shares
 * the same chip treatment.
 */
export function IconChip({
  icon: Icon,
  tone = "red",
  size = "md",
  className,
}: {
  icon: React.ElementType;
  tone?: ChipTone;
  size?: ChipSize;
  className?: string;
}) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center transition-colors", toneClasses[tone], sizeClasses[size], className)}>
      <Icon />
    </span>
  );
}
