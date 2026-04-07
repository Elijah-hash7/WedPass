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
              "flex h-12 w-full rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-ivory)] px-4 text-[15px] font-medium text-[var(--color-ink-strong)] placeholder:text-[var(--color-ink-muted)] placeholder:font-normal shadow-[0_2px_4px_rgba(0,0,0,0.02)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--color-ink-strong)]/15 focus-visible:border-[var(--color-ink-strong)] transition-all duration-200",
              icon ? "pr-12" : undefined,
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
