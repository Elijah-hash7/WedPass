import React from "react";
import { cn } from "@/lib/utils";
import { FiCheck, FiAlertTriangle, FiXCircle } from "react-icons/fi";

type Status = "valid" | "already_checked" | "invalid";

const styles: Record<Status, { bg: string; text: string; icon: React.ReactNode; accent: string }> = {
  valid: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-[var(--color-ink-strong)]",
    accent: "text-emerald-600",
    icon: <FiCheck className="h-6 w-6" />,
  },
  already_checked: {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-[var(--color-ink-strong)]",
    accent: "text-amber-600",
    icon: <FiAlertTriangle className="h-6 w-6" />,
  },
  invalid: {
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-[var(--color-ink-strong)]",
    accent: "text-red-600",
    icon: <FiXCircle className="h-6 w-6" />,
  },
};

interface StatusCardProps {
  status: Status;
  title: string;
  message: string;
  name?: string;
  hint?: string;
  className?: string;
}

export function StatusCard({ status, title, message, name, hint, className }: StatusCardProps) {
  const style = styles[status];

  return (
    <div
      className={cn(
        "card-surface relative overflow-hidden p-6 sm:p-7",
        style.bg,
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "h-12 w-12 rounded-[14px] flex items-center justify-center bg-[var(--color-ivory)] shadow-sm border border-[var(--color-line-soft)]",
            style.accent
          )}
        >
          {style.icon}
        </div>
        <div className="space-y-1">
          <p className={cn("text-[15px] font-bold tracking-tight", style.accent)}>{title}</p>
          <p className={cn("text-[14px] font-medium leading-relaxed", style.text)}>{message}</p>
          {name && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              Guest: <span className="font-semibold text-[var(--color-ink-strong)]">{name}</span>
            </p>
          )}
          {hint && <p className="text-sm text-[var(--color-ink-muted)]">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
