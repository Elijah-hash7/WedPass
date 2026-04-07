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
        "bg-[var(--color-ink-strong)] text-[var(--color-ivory)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.2)] hover:-translate-y-0.5";
      break;
    case "secondary":
      variantClasses =
        "bg-[var(--color-ivory)] text-[var(--color-ink-strong)] border border-[var(--color-line-strong)] shadow-sm hover:bg-[var(--color-shell)] hover:border-[var(--color-ink-muted)]";
      break;
    case "outline":
      variantClasses =
        "border border-[var(--color-line-strong)] text-[var(--color-ink-strong)] bg-transparent hover:bg-[var(--color-shell)]";
      break;
    case "ghost":
      variantClasses =
        "text-[var(--color-ink-strong)] hover:bg-[var(--color-shell)]";
      break;
    case "link":
      variantClasses =
        "text-[var(--color-ink-strong)] underline underline-offset-[6px] decoration-[var(--color-gold)] hover:text-[#c29b43]";
      break;
    case "destructive":
      variantClasses =
        "bg-[#ef4444] text-white shadow-sm hover:bg-[#dc2626]";
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
