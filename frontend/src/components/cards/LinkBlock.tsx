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
    <div className={cn("card-surface p-5 sm:p-6 space-y-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
            {label}
          </p>
          {description && (
            <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">{description}</p>
          )}
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-[var(--color-ink-strong)] px-3 py-1 text-[10px] font-bold tracking-[0.05em] text-[var(--color-ivory)] border border-[var(--color-line-strong)]">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <Input value={url} readOnly className="font-mono text-[13px]" />
        <Button
          onClick={handleCopy}
          variant={copied ? "default" : "secondary"}
          size="sm"
          className="sm:w-auto w-full shrink-0"
        >
          {copied ? (
            <>
              <FiCheckCircle className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <FiClipboard className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
