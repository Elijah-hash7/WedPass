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
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-[var(--color-gold-glow)] opacity-60 blur-3xl" />
        <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-[var(--color-primary-glow)] opacity-80 blur-3xl" />
      </div>

      <div className={cn("page-shell has-bottom-nav pt-32 sm:pt-36", className)}>
        {/* Page header */}
        <header className="mb-8 space-y-3">
          {eyebrow && (
            <div className="flex items-center gap-2.5">
              <span className="h-px w-8 bg-[var(--color-primary)]/40 rounded-full" />
              <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--color-ink-muted)]">
                {eyebrow}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="font-serif text-[2.4rem] sm:text-[2.8rem] text-[var(--color-ink-strong)] leading-[1.08]">
                {title}
              </h1>
              {description && (
                <p className="max-w-[38ch] text-[var(--color-ink-muted)] text-[14px] leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
          </div>
          {/* Subtle divider */}
          <div className="section-divider" />
        </header>

        <div className="space-y-5">{children}</div>
      </div>
    </div>
  );
}
