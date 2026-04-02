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
  const trendColor =
    trend?.direction === "down" ? "text-[#b33b3b]" : "text-[var(--color-emerald)]";

  return (
    <div
      className={cn(
        "card-surface relative overflow-hidden p-6 sm:p-7 backdrop-blur-md",
        "bg-[var(--color-ivory)]",
        className
      )}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
            {label}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-4xl text-[var(--color-ink-strong)] leading-none">
              {value}
            </span>
            {trend && (
              <span className={cn("text-sm font-semibold flex items-center gap-1", trendColor)}>
                {trend.direction === "up" ? "↗" : "↘"} {trend.value}%
              </span>
            )}
          </div>
          {hint && <p className="text-sm text-[var(--color-ink-muted)]">{hint}</p>}
        </div>
        {icon && (
          <div className="h-12 w-12 rounded-2xl bg-[var(--color-emerald-tint)] flex items-center justify-center text-[var(--color-emerald)] shadow-[0_10px_28px_-18px_rgba(31,107,74,0.45)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
