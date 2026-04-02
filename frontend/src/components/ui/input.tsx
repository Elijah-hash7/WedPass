import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, description, icon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-[var(--color-ink-soft)] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-ivory)]/90 px-4 text-sm text-[var(--color-ink-strong)] placeholder:text-[var(--color-ink-muted)] shadow-[0_10px_35px_-28px_rgba(15,35,25,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,107,74,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ivory)] transition-all",
              icon && "pr-12",
              className
            )}
            ref={ref}
            {...props}
          />
          {icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--color-ink-muted)]">
              {icon}
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
