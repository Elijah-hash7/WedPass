import React from "react";
import { cn } from "@/lib/utils";

type Trend = {
  value: number;
  direction: "up" | "down";
};

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  trend?: Trend;
  className?: string;
}

export function MetricCard({ label, value, hint, icon, trend, className }: MetricCardProps) {
  const trendColor = trend?.direction === "down" ? "text-[#b33b3b]" : "text-[var(--color-primary)]";

  return (
    <div
      className={cn(
        "card-surface relative overflow-hidden border border-[var(--color-line-soft)] bg-[var(--color-ivory)]/70 p-5 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      {/* Subtle accent line */}
      <div className="absolute left-5 right-5 top-0 h-[2px] rounded-full bg-gradient-to-r from-[var(--color-line-soft)] via-[var(--color-primary)]/45 to-transparent" />

      <div className="relative pt-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
            {label}
          </p>
          {icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-tint)] text-[var(--color-ink-strong)]">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-serif text-[2.6rem] text-[var(--color-ink-strong)] leading-none">
            {value}
          </span>
          {trend && (
            <span className={cn("text-sm font-semibold flex items-center gap-0.5", trendColor)}>
              {trend.direction === "up" ? "↗" : "↘"} {trend.value}%
            </span>
          )}
        </div>

        {hint && (
          <p className="mt-1.5 text-[12px] text-[var(--color-ink-muted)] leading-snug">{hint}</p>
        )}
      </div>
    </div>
  );
}
