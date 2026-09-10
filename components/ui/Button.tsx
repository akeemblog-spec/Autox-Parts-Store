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
    "bg-autox-red text-white shadow-[0_10px_28px_rgba(237,28,36,.28)] hover:bg-autox-redDark hover:shadow-redGlow",
  secondary: "bg-autox-panel3 text-white border border-autox-border hover:border-autox-red/60 hover:bg-white/[.04]",
  outline: "bg-transparent text-white border border-autox-border hover:border-autox-red hover:text-autox-red hover:bg-autox-red/[.06]",
  ghost: "bg-transparent text-autox-gray hover:text-white hover:bg-white/[.04]",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3.5 py-2 gap-1.5 rounded-lg",
  md: "text-sm px-5 py-3 gap-2 rounded-xl",
  lg: "text-base px-7 py-4 gap-2.5 rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonBaseProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-bold uppercase tracking-wide transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
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
        "inline-flex items-center justify-center font-bold uppercase tracking-wide transition-all duration-200 active:scale-[0.97]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
