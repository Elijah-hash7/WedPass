"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/shells/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerInvitee, parseApiError } from "@/lib/api";
import { FiAward, FiGift, FiHeart, FiCopy, FiAlertTriangle } from "react-icons/fi";

export default function InvitePage() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get("eventId") ?? "";
  const [eventId, setEventId] = useState(initialEventId);
  const [eventIdDraft, setEventIdDraft] = useState(initialEventId);

  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!eventId) throw new Error("Event link is missing an eventId query parameter.");
      const res = await registerInvitee({ name, eventId });
      setAccessCode(res.accessCode);
      setMessage(res.message ?? "Your personal access code is ready.");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!accessCode) return;
    await navigator.clipboard.writeText(accessCode);
    setMessage("Copied - present this at the entrance.");
  };

  return (
    <PageShell
      eyebrow="Invitation"
      title="Welcome to WedPass"
      description="Confirm your name to receive your personal entry code."
    >
      {!eventId ? (
        <div className="card-surface p-6 sm:p-8 bg-white/85 space-y-4 text-[var(--color-ink-muted)]">
          <div className="flex items-center gap-3 text-[#8f1a2f]">
            <FiAlertTriangle />
            <p className="font-semibold text-[var(--color-ink-strong)]">Event ID required</p>
          </div>
          <p>Paste the event ID to preview this page before links are generated.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="e.g. evt_123"
              value={eventIdDraft}
              onChange={(e) => setEventIdDraft(e.target.value)}
              className="sm:col-span-2"
            />
            <Button
              variant="secondary"
              onClick={() => setEventId(eventIdDraft.trim())}
              disabled={!eventIdDraft.trim()}
            >
              Use ID
            </Button>
          </div>
          <p className="text-xs text-[var(--color-ink-muted)]">
            In production this comes from the host-generated invite link.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-surface p-6 sm:p-8 bg-white/85 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
                  Event ID: {eventId}
                </p>
                <h3 className="font-serif text-2xl text-[var(--color-ink-strong)]">RSVP & Access</h3>
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Enter your full name to receive your code.
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[var(--color-emerald-tint)] flex items-center justify-center text-[var(--color-emerald)] shadow-[0_10px_26px_-20px_rgba(31,107,74,0.55)]">
                <FiHeart />
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Your full name"
                placeholder="e.g. Adebayo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Button type="submit" fullWidth disabled={loading || !name}>
                {loading ? "Generating access code..." : "Reveal my access code"}
              </Button>
            </form>

            {error && (
              <p className="text-sm text-[#8f1a2f] bg-[#8f1a2f]/6 border border-[#8f1a2f]/30 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <div className="divider" />

            <div className="grid grid-cols-2 gap-3 text-sm text-[var(--color-ink-muted)]">
              <div className="flex items-center gap-2">
                <FiGift className="text-[var(--color-emerald)]" /> Curated seating
              </div>
              <div className="flex items-center gap-2">
                <FiAward className="text-[var(--color-emerald)]" /> Fast entry lane
              </div>
            </div>
          </div>

          <div className="card-surface p-6 sm:p-8 bg-gradient-to-b from-[var(--color-ivory)] via-white to-[var(--color-rose)] space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Your pass</p>
            <h3 className="font-serif text-3xl text-[var(--color-ink-strong)]">Access card</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">
              This code is uniquely yours. Present it to ushers for a graceful entry.
            </p>

            <div className="rounded-2xl border border-[var(--color-line-strong)] bg-white/70 shadow-[0_24px_60px_-34px_rgba(15,35,25,0.45)] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
                  Access code
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-[var(--color-emerald-tint)] text-[var(--color-emerald)]">
                  {eventId}
                </span>
              </div>
              <div className="rounded-xl border border-[var(--color-line-soft)] bg-gradient-to-r from-[rgba(31,107,74,0.08)] to-[rgba(244,217,176,0.15)] px-4 py-5 text-center">
                {accessCode ? (
                  <p className="font-mono text-2xl tracking-[0.12em] text-[var(--color-ink-strong)]">
                    {accessCode}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--color-ink-muted)]">Awaiting your name to reveal the code.</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={handleCopy} disabled={!accessCode}>
                  <FiCopy className="h-4 w-4" />
                  Copy code
                </Button>
                {message && <p className="text-sm text-[var(--color-ink-muted)]">{message}</p>}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-line-soft)] bg-white/60 p-4 text-sm text-[var(--color-ink-muted)]">
              Tip: Save the code offline or screenshot it. Your device signal will not slow your entry.
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
