import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FiClipboard, FiCheckCircle } from "react-icons/fi";

interface LinkBlockProps {
  label: string;
  description?: string;
  url: string;
  badge?: string;
  className?: string;
}

export function LinkBlock({ label, description, url, badge, className }: LinkBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn("card-surface p-6 sm:p-7 space-y-4 bg-white/80", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)] flex items-center gap-2">
            <span className="h-[1px] w-5 bg-[var(--color-ink-muted)]/40" />
            {label}
          </p>
          {description && <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{description}</p>}
        </div>
        {badge && (
          <span className="px-3 py-1 text-xs rounded-full bg-[var(--color-emerald-tint)] text-[var(--color-emerald)] border border-[var(--color-line-soft)]">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input value={url} readOnly className="font-mono text-[13px] bg-white" />
        <Button onClick={handleCopy} variant="secondary" size="sm" className="sm:w-auto w-full">
          {copied ? (
            <>
              <FiCheckCircle className="h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <FiClipboard className="h-4 w-4" /> Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
