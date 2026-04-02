import React from "react";
import { cn } from "@/lib/utils";
import { FiCheck, FiAlertTriangle, FiXCircle } from "react-icons/fi";

type Status = "valid" | "already_checked" | "invalid";

const styles: Record<Status, { bg: string; text: string; icon: React.ReactNode; accent: string }> = {
  valid: {
    bg: "bg-gradient-to-br from-[rgba(31,107,74,0.1)] via-[rgba(31,107,74,0.05)] to-white",
    text: "text-[var(--color-ink-strong)]",
    accent: "text-[var(--color-emerald)]",
    icon: <FiCheck className="h-5 w-5" />,
  },
  already_checked: {
    bg: "bg-gradient-to-br from-[rgba(244,217,176,0.24)] via-[rgba(248,243,234,0.4)] to-white",
    text: "text-[var(--color-ink-strong)]",
    accent: "text-[#c27a26]",
    icon: <FiAlertTriangle className="h-5 w-5" />,
  },
  invalid: {
    bg: "bg-gradient-to-br from-[rgba(143,26,47,0.16)] via-[rgba(255,255,255,0.85)] to-white",
    text: "text-[var(--color-ink-strong)]",
    accent: "text-[#8f1a2f]",
    icon: <FiXCircle className="h-5 w-5" />,
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
            "h-11 w-11 rounded-2xl flex items-center justify-center bg-white shadow-[0_12px_30px_-24px_rgba(0,0,0,0.5)] border border-[var(--color-line-soft)]",
            style.accent
          )}
        >
          {style.icon}
        </div>
        <div className="space-y-2">
          <p className={cn("text-sm font-semibold tracking-wide", style.accent)}>{title}</p>
          <p className={cn("text-base", style.text)}>{message}</p>
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
