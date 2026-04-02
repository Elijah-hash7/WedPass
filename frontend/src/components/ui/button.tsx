import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
type Size = "default" | "sm" | "lg" | "icon" | "pill";

const buttonVariants = ({ variant = "default", size = "default" }: { variant?: Variant; size?: Size }) => {
  const base =
    "relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-ring disabled:opacity-60 disabled:pointer-events-none";

  let variantClasses = "";
  switch (variant) {
    case "default":
      variantClasses =
        "bg-[var(--color-emerald)] text-white border border-[var(--color-line-strong)] shadow-elevated hover:-translate-y-[1px] hover:shadow-[0_20px_60px_-28px_rgba(12,44,33,0.65)] active:translate-y-[0px]";
      break;
    case "secondary":
      variantClasses =
        "bg-[var(--color-ivory)] text-[var(--color-ink-strong)] border border-[var(--color-line-strong)] shadow-[0_16px_40px_-32px_rgba(15,35,25,0.35)] hover:-translate-y-[1px]";
      break;
    case "outline":
      variantClasses =
        "border border-[var(--color-line-strong)] text-[var(--color-ink-strong)] bg-white/60 hover:bg-[var(--color-emerald-tint)]";
      break;
    case "ghost":
      variantClasses =
        "text-[var(--color-ink-strong)] hover:bg-[var(--color-emerald-tint)]";
      break;
    case "link":
      variantClasses =
        "text-[var(--color-emerald)] underline underline-offset-[6px] decoration-[var(--color-amber)] hover:text-[var(--color-ink-strong)]";
      break;
    case "destructive":
      variantClasses =
        "bg-[#8f1a2f] text-white border border-[rgba(143,26,47,0.24)] hover:bg-[#781326]";
      break;
  }

  let sizeClasses = "";
  switch (size) {
    case "default":
      sizeClasses = "h-12 px-6 text-sm";
      break;
    case "sm":
      sizeClasses = "h-10 px-4 text-sm rounded-lg";
      break;
    case "lg":
      sizeClasses = "h-14 px-8 text-base";
      break;
    case "icon":
      sizeClasses = "h-11 w-11";
      break;
    case "pill":
      sizeClasses = "h-11 px-6 rounded-full text-sm";
      break;
  }

  return `${base} ${variantClasses} ${sizeClasses}`;
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), fullWidth && "w-full", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
