"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/shells/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusCard } from "@/components/cards/StatusCard";
import { checkAccessCode, parseApiError } from "@/lib/api";
import { FiClock, FiCornerUpLeft, FiLock, FiZap, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

type RecentItem = {
  code: string;
  status: "valid" | "invalid" | "already_checked";
  name?: string;
  message?: string;
};

export default function UsherPage() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get("eventId") ?? "";
  const defaultToken = useMemo(() => process.env.NEXT_PUBLIC_USHER_TOKEN || "", []);

  const [eventId, setEventId] = useState(initialEventId);
  const [eventIdDraft, setEventIdDraft] = useState(initialEventId);
  const [accessCode, setAccessCode] = useState("");
  const [usherToken, setUsherToken] = useState(defaultToken);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecentItem | null>(null);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) {
      setError("Missing eventId in URL. Enter one below or open the usher link from the host dashboard.");
      return;
    }
    if (!accessCode) return;
    setLoading(true);
    setError(null);
    try {
      const trimmedCode = accessCode.trim().toUpperCase();
      const res = await checkAccessCode(trimmedCode, usherToken || undefined);
      const payload: RecentItem = { code: trimmedCode, status: res.status, name: res.name, message: res.message };
      setResult(payload);
      setRecent((prev) => [payload, ...prev].slice(0, 5));
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAccessCode("");
    setResult(null);
    setError(null);
  };

  const stateTitle =
    result?.status === "valid"
      ? "Entry granted"
      : result?.status === "already_checked"
      ? "Already checked-in"
      : "Code not recognized";

  const stateHint =
    result?.status === "valid"
      ? "Open the gate and welcome the guest."
      : result?.status === "already_checked"
      ? "Kindly confirm if the guest re-entered or assist them at help desk."
      : "Ask guest to confirm invite name or try again carefully.";

  return (
    <PageShell
      eyebrow="Usher lane"
      title="Check-in console"
      description="Fast, legible verification for ushers. Optimised for repeat scans on mobile."
      actions={
        <div className="flex items-center gap-2 text-[var(--color-ink-muted)] text-sm">
          <FiClock /> {eventId || "no event"}
        </div>
      }
    >
      {!eventId ? (
        <div className="card-surface p-6 sm:p-8 bg-white/85 space-y-4 text-[var(--color-ink-muted)]">
          <div className="flex items-center gap-3 text-[#8f1a2f]">
            <FiAlertTriangle />
            <p className="font-semibold text-[var(--color-ink-strong)]">Event ID required</p>
          </div>
          <p>Paste the event ID to test check-in without generating a link.</p>
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
          <p className="text-xs text-[var(--color-ink-muted)]">In production this comes from the host-generated usher link.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-surface p-6 sm:p-8 bg-white/90 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
                  Primary action
                </p>
                <h3 className="font-serif text-2xl text-[var(--color-ink-strong)]">Enter access code</h3>
                <p className="text-sm text-[var(--color-ink-muted)]">Large input · paste-friendly · auto-format</p>
              </div>
              <FiZap className="text-[var(--color-emerald)]" />
            </div>

            <form className="space-y-3" onSubmit={submit}>
              <Input
                label="Access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className="text-xl tracking-[0.18em] uppercase h-14"
                autoFocus
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Usher token (header)"
                  value={usherToken}
                  onChange={(e) => setUsherToken(e.target.value)}
                  placeholder="Provided by host"
                  className="h-12"
                />
                <div className="flex items-end gap-3">
                  <Button type="submit" fullWidth disabled={loading || !accessCode}>
                    {loading ? "Checking..." : "Check access"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={reset}>
                    <FiCornerUpLeft className="h-4 w-4" /> Next guest
                  </Button>
                </div>
              </div>
            </form>

            {error && (
              <p className="text-sm text-[#8f1a2f] bg-[#8f1a2f]/6 border border-[#8f1a2f]/30 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            {result ? (
              <StatusCard
                status={result.status}
                title={stateTitle}
                message={result.status === "valid" ? "Guest may enter." : result.message ?? stateHint}
                name={result.name}
                hint={stateHint}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-line-strong)]/70 p-6 text-[var(--color-ink-muted)]">
                Awaiting the first scan. Keep this page on-screen; it is optimised for repeated entries.
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="card-surface p-5 bg-white/85 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Recent checks</p>
                <FiCheckCircle className="text-[var(--color-emerald)]" />
              </div>
              {recent.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-muted)]">No scans yet.</p>
              ) : (
                <div className="space-y-3">
                  {recent.map((item, idx) => (
                    <div
                      key={`${item.code}-${idx}`}
                      className="rounded-xl border border-[var(--color-line-soft)] bg-[var(--color-ivory)] px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-mono text-sm tracking-[0.14em] text-[var(--color-ink-strong)]">
                          {item.code}
                        </p>
                        <p className="text-xs text-[var(--color-ink-muted)]">
                          {item.name ?? "Guest"}
                        </p>
                      </div>
                      <span
                        className=
                          {item.status === "valid"
                            ? "px-3 py-1 rounded-full text-xs bg-[var(--color-emerald-tint)] text-[var(--color-emerald)]"
                            : item.status === "already_checked"
                            ? "px-3 py-1 rounded-full text-xs bg-[rgba(244,217,176,0.3)] text-[#c27a26]"
                            : "px-3 py-1 rounded-full text-xs bg-[rgba(143,26,47,0.12)] text-[#8f1a2f]"}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card-surface p-5 bg-white/80 text-sm text-[var(--color-ink-muted)] space-y-2">
              <div className="flex items-center gap-2 text-[var(--color-ink-strong)]">
                <FiLock /> Entry protocol
              </div>
              <ol className="list-decimal list-inside space-y-1">
                <li>Confirm code aloud with guest.</li>
                <li>Green = admit · Amber = ask · Red = deny.</li>
                <li>Use "Next guest" between scans.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
