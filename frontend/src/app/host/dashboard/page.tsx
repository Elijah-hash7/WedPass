"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiArrowLeft,
  FiEdit3,
  FiRefreshCw,
  FiShield,
  FiTrash2,
} from "react-icons/fi";
import CeremonyDetailsForm, { CeremonyDetails } from "@/components/CeremonyDetailsForm";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageShell } from "@/components/shells/PageShell";
import { Button } from "@/components/ui/button";
import { deleteEvent, fetchMetrics, parseApiError, updateEvent } from "@/lib/api";
import { readStoredEvents, removeStoredEvent, StoredEvent, upsertStoredEvent } from "@/lib/host-events";
import { formatWeddingDate, formatWeddingTime } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }
};

function getEventState(date: string, checkInEnabled: boolean) {
  if (checkInEnabled) return { label: "Live", tone: "live" as const };
  const startAt = new Date(date).getTime();
  if (Number.isNaN(startAt)) return { label: "Draft", tone: "neutral" as const };
  if (Date.now() >= startAt) return { label: "Scheduled", tone: "neutral" as const };
  return { label: "Upcoming", tone: "upcoming" as const };
}

function combineDateAndTime(date: string, time: string) {
  const safeTime = time || "10:00";
  return new Date(`${date}T${safeTime}:00`).toISOString();
}

function eventToFormValues(event: StoredEvent): CeremonyDetails {
  const parsed = new Date(event.date);
  const localDate = Number.isNaN(parsed.getTime())
    ? ""
    : new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  const time = event.timeLabel
    ? event.timeLabel
    : Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

  return {
    title: event.title,
    date: localDate,
    time,
    venueName: event.venueName,
    venueLocation: event.venueLocation,
    guestLimit: event.guestLimit,
  };
}

export default function DashboardPage() {
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof fetchMetrics>> | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEvents(readStoredEvents());
  }, []);

  const selectedEvent = useMemo(
    () => events.find((event) => event.eventId === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  const loadMetrics = useCallback(async (eventId?: string | null) => {
    const id = eventId ?? selectedEventId;
    if (!id) return;
    setMetricsLoading(true);
    try {
      const data = await fetchMetrics(id);
      setMetrics(data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setMetricsLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) { setMetrics(null); return; }
    void loadMetrics(selectedEventId);
    const interval = window.setInterval(() => void loadMetrics(selectedEventId), 5_000);
    return () => window.clearInterval(interval);
  }, [selectedEventId, loadMetrics]);

  const handleSelect = (event: StoredEvent) => {
    setSelectedEventId(event.eventId);
    setEditing(false);
    setError(null);
  };

  const handleBack = () => {
    setSelectedEventId(null);
    setEditing(false);
    setError(null);
  };

  const handleToggleCheckIn = async () => {
    if (!selectedEvent) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateEvent(selectedEvent.eventId, {
        checkInEnabled: !selectedEvent.checkInEnabled,
      });
      const merged = upsertStoredEvent({
        ...selectedEvent,
        date: updated.date,
        guestLimit: updated.guestLimit,
        checkInEnabled: updated.checkInEnabled,
        inviteeLink: updated.inviteeLink,
        usherLink: updated.usherLink,
      });
      setEvents(merged);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEditEvent = async (details: CeremonyDetails) => {
    if (!selectedEvent) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateEvent(selectedEvent.eventId, {
        name: details.title,
        date: combineDateAndTime(details.date, details.time),
        guestLimit: details.guestLimit,
        venue: [details.venueName, details.venueLocation].filter(Boolean).join(", "),
      });
      const merged = upsertStoredEvent({
        ...selectedEvent,
        title: details.title,
        date: updated.date,
        guestLimit: updated.guestLimit,
        checkInEnabled: updated.checkInEnabled,
        venueName: details.venueName,
        venueLocation: details.venueLocation,
        timeLabel: details.time,
        inviteeLink: updated.inviteeLink,
        usherLink: updated.usherLink,
      });
      setEvents(merged);
      setEditing(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    const confirmed = window.confirm(
      `Delete "${selectedEvent.title}"? This removes the event and old invite and usher links will stop working.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteEvent(selectedEvent.eventId);
      const nextEvents = removeStoredEvent(selectedEvent.eventId);
      setEvents(nextEvents);
      setSelectedEventId(null);
      setMetrics(null);
      setEditing(false);
    } catch (err: unknown) {
      const errorMessage = parseApiError(err);
      const statusCode =
        typeof err === "object" && err !== null && "response" in err &&
        typeof (err as { response?: { status?: number } }).response?.status === "number"
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;

      if (errorMessage !== "Event not found" && statusCode !== 404) {
        setError(errorMessage);
        setDeleting(false);
        return;
      }
    }

    try {
      const nextEvents = removeStoredEvent(selectedEvent.eventId);
      setEvents(nextEvents);
      setSelectedEventId(null);
      setMetrics(null);
      setEditing(false);
    } finally {
      setDeleting(false);
    }
  };

  const metricCards = [
    { label: "Total invitees", value: metrics?.totalInvitees ?? "—", hint: "Guests registered", icon: <FiActivity /> },
    { label: "Checked in", value: metrics?.checkedInCount ?? "—", hint: "Successful scans", icon: <FiActivity /> },
    { label: "Remaining", value: metrics?.remainingCount ?? "—", hint: "Still outside", icon: <FiActivity /> },
  ];

  return (
    <PageShell
      eyebrow="Host HQ"
      title={selectedEvent ? selectedEvent.title : "Dashboard"}
      description={
        selectedEvent
          ? `${formatWeddingDate(selectedEvent.date)}${selectedEvent.timeLabel ? ` · ${formatWeddingTime(selectedEvent.timeLabel)}` : ""}${selectedEvent.venueName ? ` · ${selectedEvent.venueName}` : ""}`
          : "Browse events, control check-in, and watch live metrics."
      }
      className="max-w-4xl"
    >
      {error && (
        <div className="rounded-xl border border-[#8f1a2f]/20 bg-[#8f1a2f]/5 px-4 py-3 text-sm text-[#8f1a2f]">
          {error}
        </div>
      )}

      {/* Events list */}
      {!selectedEventId && (
        <section className="card-surface p-6 sm:p-8 fade-up shadow-sm border border-[var(--color-line-soft)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                Your events
              </p>
              <h3 className="font-serif text-xl text-[var(--color-ink-strong)]">Saved events</h3>
            </div>
            {events.length > 0 && (
              <span className="rounded-full bg-[var(--color-primary-tint)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                {events.length}
              </span>
            )}
          </div>

          {events.length === 0 ? (
            <div className="space-y-5 rounded-[20px] border border-dashed border-[var(--color-line-strong)]/80 p-10 text-center bg-[var(--color-ivory)]/30">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-ink-strong)] text-[var(--color-ivory)] shadow-sm">
                <FiActivity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink-strong)]">No events yet</p>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Create your first event to get started.</p>
              </div>
              <Link href="/host">
                <Button variant="secondary" size="sm">Create your first event</Button>
              </Link>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className="space-y-3"
            >
              {events.map((event) => {
                const state = getEventState(event.date, event.checkInEnabled);
                return (
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    key={event.eventId}
                    type="button"
                    onClick={() => handleSelect(event)}
                    className="group w-full rounded-2xl border border-[var(--color-line-soft)] bg-[var(--color-ivory)]/90 px-5 py-4 text-left transition-all hover:border-[var(--color-ink-strong)]/10 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)] backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-serif text-[1.2rem] leading-tight text-[var(--color-ink-strong)] truncate">
                          {event.title}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[var(--color-ink-muted)]">
                          {formatWeddingDate(event.date)}
                          {event.venueName ? ` · ${event.venueName}` : ""}
                        </p>
                      </div>
                      <span
                        className={
                          state.tone === "live"
                            ? "shrink-0 rounded-md bg-emerald-500/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700"
                            : "shrink-0 rounded-md bg-[var(--color-shell)] px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-[var(--color-ink-muted)] border border-[var(--color-line-soft)]"
                        }
                      >
                        {state.label}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Open event</span>
                      <span>→</span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </section>
      )}

      {/* Selected event detail */}
      {selectedEventId && selectedEvent && (
        <div className="space-y-5 fade-up">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors group"
          >
            <FiArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to events
          </button>

          {/* Status + check-in control */}
          <section className="card-surface p-6 sm:p-8 space-y-6 shadow-sm border border-[var(--color-line-soft)]">
            {/* Check-in toggle header */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                Entry control
              </p>
              <h3 className="font-serif text-xl text-[var(--color-ink-strong)]">Check-in activation</h3>
              <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">
                Ushers see &ldquo;Event not started yet&rdquo; until you switch this on.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleCheckIn}
              disabled={saving}
              role="switch"
              aria-checked={selectedEvent.checkInEnabled}
              aria-label={`${selectedEvent.checkInEnabled ? "Disable" : "Enable"} check-in`}
              className={`w-full rounded-[28px] border p-5 text-left transition-all duration-500 ${
                selectedEvent.checkInEnabled
                  ? "border-[var(--color-gold)]/40 bg-[radial-gradient(ellipse_at_top_right,var(--color-gold),rgba(194,155,67,0.7))] text-[var(--color-ink-strong)] shadow-[0_16px_40px_-16px_var(--color-gold-glow)]"
                  : "border-[var(--color-line-strong)] bg-[rgba(255,255,255,0.2)] text-[var(--color-ink-strong)] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.04)] hover:bg-[var(--color-ivory)]"
              } ${saving ? "opacity-70 scale-[0.97]" : "hover:scale-[1.015]"}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5 pl-1">
                  <p className={`text-[11px] font-bold uppercase tracking-[0.26em] ${selectedEvent.checkInEnabled ? "text-[var(--color-ink-strong)]/70" : "text-[var(--color-ink-muted)]"}`}>
                    Invite check-in
                  </p>
                  <p className="text-sm font-semibold">
                    {selectedEvent.checkInEnabled ? "ACTIVE — Ushers can scan" : "Offline — Waiting to start"}
                  </p>
                </div>
                <span className={`relative flex h-[44px] w-[80px] shrink-0 items-center rounded-full p-1.5 transition-colors duration-400 ease-[var(--ease-spring)] shadow-inner ${selectedEvent.checkInEnabled ? "bg-[var(--color-ink-strong)]/10" : "bg-[var(--color-line-soft)]"}`}>
                  <span className={`flex h-[32px] w-[32px] items-center justify-center rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-400 ease-[var(--ease-spring)] ${
                    selectedEvent.checkInEnabled
                      ? "translate-x-9 bg-[var(--color-ink-strong)] text-[var(--color-ivory)]"
                      : "translate-x-0 bg-[var(--color-ivory)] text-[var(--color-ink-strong)]"
                  }`}>
                    <FiShield className="h-3.5 w-3.5" />
                  </span>
                </span>
              </div>
            </button>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={() => setEditing((v) => !v)}
                disabled={saving || deleting}
              >
                <FiEdit3 className="h-4 w-4" />
                {editing ? "Close editor" : "Edit event"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={saving || deleting}
              >
                <FiTrash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </section>

          {/* Edit form */}
          {editing && (
            <div className="fade-up">
              <CeremonyDetailsForm
                key={`${selectedEvent.eventId}-${selectedEvent.title}-${selectedEvent.date}`}
                initialValues={eventToFormValues(selectedEvent)}
                onSubmit={handleEditEvent}
                isSubmitting={saving}
                submitButtonText="Save changes"
              />
            </div>
          )}

          {/* Live metrics */}
          <section className="card-surface p-6 sm:p-8 space-y-5 shadow-sm border border-[var(--color-line-soft)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                  Live metrics
                </p>
                <h3 className="font-serif text-xl text-[var(--color-ink-strong)]">Room feel</h3>
                <p className="mt-0.5 text-[11px] text-[var(--color-ink-muted)]">Refreshes every 5 seconds</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => loadMetrics()} disabled={metricsLoading}>
                <FiRefreshCw className={`h-4 w-4 ${metricsLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {metricsLoading && !metrics ? (
              <p className="text-[13px] text-[var(--color-ink-muted)] animate-pulse">
                Fetching latest check-ins...
              </p>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
              >
                {metricCards.map((metric) => (
                  <motion.div variants={itemVariants} key={metric.label}>
                    <MetricCard
                      label={metric.label}
                      value={metric.value}
                      hint={metric.hint}
                      icon={metric.icon}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        </div>
      )}
    </PageShell>
  );
}
