import React from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden pb-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[rgba(244,217,176,0.35)] blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[rgba(31,107,74,0.15)] blur-3xl" />
      </div>
      <div className={cn("page-shell", className)}>
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
                <span className="h-[1px] w-6 bg-[var(--color-ink-muted)]/50" />
                {eyebrow}
              </span>
            )}
            <h1 className="font-serif text-4xl sm:text-5xl text-[var(--color-ink-strong)] leading-tight">
              {title}
            </h1>
            {description && (
              <p className="max-w-2xl text-[var(--color-ink-muted)] text-base leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
