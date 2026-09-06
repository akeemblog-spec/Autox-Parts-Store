import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-autox-red text-white hover:bg-autox-redDark shadow-[0_0_0_1px_rgba(237,28,36,0.6)] hover:shadow-redGlow",
  secondary: "bg-autox-panel3 text-white border border-autox-border hover:border-autox-red/60",
  outline: "bg-transparent text-white border border-autox-border hover:border-autox-red hover:text-autox-red",
  ghost: "bg-transparent text-autox-gray hover:text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-2 gap-1.5",
  md: "text-sm px-5 py-3 gap-2",
  lg: "text-base px-7 py-4 gap-2.5",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonBaseProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold uppercase tracking-wide rounded-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

interface ButtonLinkProps extends ButtonBaseProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function ButtonLink({ href, variant = "primary", size = "md", className, children, onClick }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center font-semibold uppercase tracking-wide rounded-sm transition-all duration-200 active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
