"use client";

import { useEffect, useMemo, useState } from "react";
import { FiBarChart2, FiExternalLink, FiRefreshCw, FiShield } from "react-icons/fi";
import CeremonyDetailsForm from "@/components/CeremonyDetailsForm";
import { PageShell } from "@/components/shells/PageShell";
import { LinkBlock } from "@/components/cards/LinkBlock";
import { MetricCard } from "@/components/cards/MetricCard";
import { Button } from "@/components/ui/button";
import {
  buildInviteLink,
  buildUsherLink,
  createEvent,
  fetchMetrics,
  parseApiError,
} from "@/lib/api";
import { formatWeddingDate, formatWeddingTime } from "@/lib/utils";

type Ceremony = {
  couple: string;
  date: string;
  venueName: string;
  venueLocation: string;
  time: string;
};

const defaultCeremony: Ceremony = {
  couple: "",
  date: "",
  venueName: "",
  venueLocation: "",
  time: "",
};

export default function HostPage() {
  const [ceremonyDetails, setCeremonyDetails] = useState<Ceremony>(defaultCeremony);
  const [eventId, setEventId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [usherLink, setUsherLink] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
    []
  );

  const handleCreateEvent = async (details: Ceremony) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createEvent(details);
      if (!created.id) {
        throw new Error("API did not return an event id.");
      }
      const id = created.id;
      setEventId(id);
      setCeremonyDetails(details);
      setInviteLink(created.inviteLink ? created.inviteLink : buildInviteLink(origin, id));
      setUsherLink(created.usherLink ? created.usherLink : buildUsherLink(origin, id));
      setBanner("Event saved and links updated");
    } catch (err) {
      setError(parseApiError(err));
      setBanner("Event not saved — check API connection.");
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    if (!eventId) return;
    setMetricsLoading(true);
    try {
      const data = await fetchMetrics(eventId);
      setMetrics(data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const summaryLines = [
    { label: "Ceremony", value: ceremonyDetails.couple || "Not set" },
    { label: "Date", value: ceremonyDetails.date ? formatWeddingDate(ceremonyDetails.date) : "Not set" },
    { label: "Time", value: ceremonyDetails.time ? formatWeddingTime(ceremonyDetails.time) : "Not set" },
    {
      label: "Venue",
      value:
        ceremonyDetails.venueName || ceremonyDetails.venueLocation
          ? `${ceremonyDetails.venueName}${ceremonyDetails.venueLocation ? `, ${ceremonyDetails.venueLocation}` : ""}`
          : "Not set",
    },
  ];

  const mappedMetrics = [
    {
      label: "Invitees",
      value: metrics?.invitees ?? "—",
      hint: "Guests created",
    },
    {
      label: "Checked in",
      value: metrics?.checkedIn ?? "—",
      hint: "Successful scans",
    },
    {
      label: "Invalid attempts",
      value: metrics?.invalid ?? metrics?.invalidAttempts ?? "—",
      hint: "Codes rejected",
    },
  ];

  return (
    <PageShell
      eyebrow="Host HQ"
      title="Host dashboard — WedPass"
      description="Design-grade control for your ceremony links, invitees, and live metrics."
      actions={
        eventId && (
          <Button variant="secondary" size="pill" onClick={loadMetrics} disabled={metricsLoading}>
            <FiRefreshCw className="h-4 w-4" />
            Refresh metrics
          </Button>
        )
      }
    >
      {banner && (
        <div className="card-surface bg-[var(--color-emerald-tint)]/80 border border-[var(--color-line-strong)] p-4 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--color-emerald)]">{banner}</p>
            <p className="text-sm text-[var(--color-ink-muted)]">Crafted for a premium entry experience.</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setBanner(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <CeremonyDetailsForm
            onSubmit={handleCreateEvent}
            submitButtonText={eventId ? "Update event & regenerate links" : "Create event & generate links"}
            isSubmitting={loading}
            initialValues={ceremonyDetails}
          />

          <div className="card-surface p-6 sm:p-7 bg-white/90">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">Event summary</p>
                <h3 className="font-serif text-2xl text-[var(--color-ink-strong)]">At a glance</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                <FiExternalLink />
                Live links follow your latest details
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summaryLines.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[var(--color-line-soft)] bg-[var(--color-ivory)] px-4 py-3 shadow-[0_12px_30px_-26px_rgba(15,35,25,0.4)]"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">{item.label}</p>
                  <p className="text-base text-[var(--color-ink-strong)] mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card-surface p-6 sm:p-7 bg-white/90 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">System links</p>
                <h3 className="font-serif text-xl text-[var(--color-ink-strong)]">Invite & usher</h3>
              </div>
              <FiShield className="text-[var(--color-ink-muted)]" />
            </div>

            {inviteLink && usherLink ? (
              <div className="space-y-3">
                <LinkBlock
                  label="Invitee registration link"
                  description="Share publicly — it feels like a digital invitation."
                  url={inviteLink}
                  badge="Public"
                />
                <LinkBlock
                  label="Usher check-in link"
                  description="Only for staff devices. Token protected."
                  url={usherLink}
                  badge="Private"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-line-strong)]/60 p-6 text-center text-[var(--color-ink-muted)]">
                Generate your event to receive invite and usher links.
              </div>
            )}

            {error && (
              <p className="text-sm text-[#8f1a2f] bg-[#8f1a2f]/5 border border-[#8f1a2f]/30 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
          </div>

          <div className="card-surface p-6 sm:p-7 bg-white/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Live metrics</p>
                <h3 className="font-serif text-xl text-[var(--color-ink-strong)]">Room feel</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={loadMetrics} disabled={!eventId || metricsLoading}>
                <FiBarChart2 className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            {metricsLoading && (
              <p className="text-sm text-[var(--color-ink-muted)]">Fetching latest check-ins…</p>
            )}

            {!metricsLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mappedMetrics.map((metric) => (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    hint={metric.hint}
                    icon={<FiBarChart2 />}
                  />
                ))}
              </div>
            )}
            {!eventId && (
              <p className="text-sm text-[var(--color-ink-muted)]">
                Metrics go live after you create the event.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
