"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiAlertCircle, FiCheckCircle, FiClock, FiLock, FiZap } from "react-icons/fi";
import { PageShell } from "@/components/shells/PageShell";
import { StatusCard } from "@/components/cards/StatusCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkAccessCode, fetchEventByUsherToken, parseApiError } from "@/lib/api";
import { formatWeddingDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type RecentItem = {
  code: string;
  status: "valid" | "invalid" | "already_checked";
  name?: string;
  message?: string;
  checkedAt: string;
};

function formatAccessCode(value: string) {
  const compact = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);
  if (compact.length <= 3) return compact;
  return `${compact.slice(0, 3)}-${compact.slice(3)}`;
}

export default function UsherTokenPage() {
  const params = useParams<{ usherToken: string }>();
  const usherToken = params.usherToken;

  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecentItem | null>(null);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [eventName, setEventName] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [checkInEnabled, setCheckInEnabled] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllRecent, setShowAllRecent] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const event = await fetchEventByUsherToken(usherToken);
        setEventName(event.name);
        setEventDate(event.date);
        setCheckInEnabled(event.checkInEnabled);
      } catch (err) {
        setError(parseApiError(err));
      } finally {
        setBooting(false);
      }
    };

    void loadEvent();
  }, [usherToken]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim() || !checkInEnabled) return;

    setLoading(true);
    setError(null);

    try {
      const trimmedCode = accessCode.trim().toUpperCase();
      const res = await checkAccessCode(trimmedCode, usherToken);
      const payload: RecentItem = {
        code: trimmedCode,
        status: res.status,
        name: res.name,
        message: res.message,
        checkedAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };

      setResult(payload);
      setRecent((prev) => [payload, ...prev]);
      setAccessCode("");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const stateTitle =
    result?.status === "valid"
      ? "Entry Granted"
      : result?.status === "already_checked"
        ? "Already Checked In"
        : "Deny Entry";

  const stateMessage =
    result?.status === "valid"
      ? "Guest may proceed."
      : result?.status === "already_checked"
        ? result.message ?? "This code has already been scanned."
        : result?.message ?? "Code not recognised in the system.";

  const stateHint =
    result?.status === "valid"
      ? "Welcome the guest and prepare for the next."
      : result?.status === "already_checked"
        ? "Verify if guest is re-entering before allowing them in."
        : "Ask guest to confirm the name matching their ID.";

  return (
    <PageShell
      eyebrow="Console"
      title="Check-In"
      description="Scan or type guest access codes. Built for speed."
      actions={
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
          <FiClock className="h-4 w-4" />
          Live session
        </div>
      }
      className="max-w-5xl"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="card-surface space-y-6 p-6 sm:p-8 lg:col-span-7 xl:col-span-8 border-0 shadow-[0_24px_54px_-20px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between border-b border-[var(--color-line-soft)] pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[var(--color-ink-muted)] mb-1">Live Terminal</p>
              <h3 className="font-serif text-2xl text-[var(--color-ink-strong)]">Verify Guest</h3>
              {eventName && (
                <p className="mt-1 text-[13px] font-medium text-[var(--color-ink-muted)]">
                  {eventName}
                  {eventDate ? ` · ${formatWeddingDate(eventDate)}` : ""}
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-ink-strong)] text-[var(--color-ivory)]">
              <FiZap className="h-5 w-5" />
            </div>
          </div>

          {booting ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-line-strong)] p-6 text-center text-sm font-medium text-[var(--color-ink-muted)]">
              Connecting to secure gateway...
            </div>
          ) : !checkInEnabled ? (
            <div className="rounded-2xl border border-[#d97706]/20 bg-[#d97706]/10 p-5">
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-full bg-white p-2 shadow-sm text-[#d97706]">
                  <FiAlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[15px] font-bold tracking-tight text-[#b45309]">Event not active</p>
                  <p className="mt-1 text-[13px] leading-relaxed font-medium text-[#d97706]">
                    The host has paused the check-in system. You cannot verify guests until the switch is flipped.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={submit}>
            <div className="relative">
              <Input
                label="Digital pass code"
                value={accessCode}
                onChange={(e) => setAccessCode(formatAccessCode(e.target.value))}
                placeholder="XXX-XXXX"
                className="h-20 text-4xl sm:text-5xl font-black font-mono tracking-[0.2em] uppercase text-center focus-visible:ring-4 focus-visible:ring-[var(--color-ink-strong)]/10"
                autoFocus
                disabled={!checkInEnabled || booting}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" size="lg" className="w-full text-[16px] h-14" disabled={loading || !accessCode.trim() || !checkInEnabled || booting}>
                {loading ? "Authenticating..." : "Scan & Verify"}
              </Button>
            </div>
          </form>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {result ? (
            <motion.div
              key="result-status"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
            >
              <StatusCard
                status={result.status}
                title={stateTitle}
                message={stateMessage}
                name={result.name}
                hint={stateHint}
              />
            </motion.div>
          ) : (
            <motion.div
              key="result-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-[var(--color-line-strong)]/80 p-8 text-center"
            >
              <p className="text-[14px] font-medium text-[var(--color-ink-muted)]">
                {checkInEnabled
                  ? "Awaiting code..."
                  : "Scanning offline until host unlocks."}
              </p>
            </motion.div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-5 xl:col-span-4">
          <div className="card-surface p-6 shadow-sm border border-[var(--color-line-soft)]">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-line-soft)] pb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Recent Log</p>
              <FiCheckCircle className="text-[var(--color-ink-muted)]" />
            </div>
            {recent.length === 0 ? (
              <p className="text-[13px] font-medium text-[var(--color-ink-muted)] italic">No scans confirmed yet.</p>
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {(showAllRecent ? recent : recent.slice(0, 4)).map((item, index) => (
                    <motion.div
                      key={`${item.code}-${index}`}
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-line-soft)] bg-[var(--color-ivory)]/90 px-3 py-2.5"
                    >
                      <div>
                        <p className="font-mono text-[13px] font-bold tracking-widest text-[var(--color-ink-strong)]">{item.code}</p>
                        <p className="text-[11px] font-medium text-[var(--color-ink-muted)] mt-0.5">
                          {item.name ?? "Unknown"} · {item.checkedAt}
                        </p>
                      </div>
                      <span
                        className={
                          item.status === "valid"
                            ? "rounded-md bg-emerald-500/15 px-2.5 py-1 text-[11px] uppercase tracking-wide font-black text-emerald-700"
                            : item.status === "already_checked"
                              ? "rounded-md bg-amber-500/15 px-2.5 py-1 text-[11px] uppercase tracking-wide font-black text-amber-700"
                              : "rounded-md bg-red-500/15 px-2.5 py-1 text-[11px] uppercase tracking-wide font-black text-red-700"
                        }
                      >
                        {item.status === "already_checked" ? "USED" : item.status === "valid" ? "OK" : "DENY"}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {recent.length > 4 && (
                  <button
                    onClick={() => setShowAllRecent(!showAllRecent)}
                    className="w-full mt-3 rounded-lg py-2.5 text-[12px] font-bold tracking-widest uppercase text-[var(--color-ink-muted)] hover:bg-[var(--color-line-soft)] transition-colors"
                  >
                    {showAllRecent ? "Show Less" : `View all ${recent.length} checks`}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="card-surface p-6 shadow-sm border border-[var(--color-line-soft)]">
            <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--color-ink-strong)] mb-3">
              <FiLock className="h-4 w-4" />
              Security Protocol
            </div>
            <ol className="list-decimal list-inside space-y-2 text-[13px] font-medium text-[var(--color-ink-soft)] leading-relaxed">
              <li>Confirm the code aloud with guest.</li>
              <li>Always check the large indicator colour.</li>
              <li>Wait for host to unlock system before starting.</li>
              <li>Double-scan to verify re-entries.</li>
            </ol>
          </div>


        </div>
      </div>
    </PageShell>
  );
}
