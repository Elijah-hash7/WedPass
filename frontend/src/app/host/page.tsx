"use client";

import { useState } from "react";
import { FiPlusCircle, FiShield, FiCheckCircle, FiCalendar, FiClock, FiMapPin, FiUsers } from "react-icons/fi";
import CeremonyDetailsForm, { CeremonyDetails } from "@/components/CeremonyDetailsForm";
import { LinkBlock } from "@/components/cards/LinkBlock";
import { PageShell } from "@/components/shells/PageShell";
import { Button } from "@/components/ui/button";
import { createEvent, parseApiError } from "@/lib/api";
import { StoredEvent, upsertStoredEvent } from "@/lib/host-events";
import { formatWeddingDate, formatWeddingTime } from "@/lib/utils";

type Step = "form" | "summary";

const defaultCeremony: CeremonyDetails = {
  title: "",
  date: "",
  time: "",
  venueName: "",
  venueLocation: "",
  guestLimit: 0,
};

function combineDateAndTime(date: string, time: string) {
  const safeTime = time || "10:00";
  return new Date(`${date}T${safeTime}:00`).toISOString();
}

export default function HostCreatePage() {
  const [step, setStep] = useState<Step>("form");
  const [createdEvent, setCreatedEvent] = useState<StoredEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateEvent = async (details: CeremonyDetails) => {
    setCreating(true);
    setError(null);
    const start = Date.now();

    try {
      const created = await createEvent({
        name: details.title,
        date: combineDateAndTime(details.date, details.time),
        guestLimit: details.guestLimit,
        venue: [details.venueName, details.venueLocation].filter(Boolean).join(", "),
      });

      const nextEvent: StoredEvent = {
        eventId: created.eventId,
        title: details.title,
        date: created.date,
        guestLimit: created.guestLimit,
        checkInEnabled: created.checkInEnabled,
        venueName: details.venueName,
        venueLocation: details.venueLocation,
        timeLabel: details.time,
        inviteeLink: created.inviteeLink,
        usherLink: created.usherLink,
        createdAt: new Date().toISOString(),
      };

      upsertStoredEvent(nextEvent);
      setCreatedEvent(nextEvent);
      setStep("summary");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 1200 - elapsed);
      window.setTimeout(() => setCreating(false), remaining);
    }
  };

  const summaryLines = createdEvent
    ? [
        { label: "Ceremony", value: createdEvent.title, icon: <FiCheckCircle className="h-5 w-5" /> },
        { label: "Date", value: formatWeddingDate(createdEvent.date), icon: <FiCalendar className="h-5 w-5" /> },
        { label: "Time", value: createdEvent.timeLabel ? formatWeddingTime(createdEvent.timeLabel) : "Not set", icon: <FiClock className="h-5 w-5" /> },
        {
          label: "Venue",
          value:
            createdEvent.venueName || createdEvent.venueLocation
              ? `${createdEvent.venueName}${createdEvent.venueLocation ? `, ${createdEvent.venueLocation}` : ""}`
              : "Not set",
          icon: <FiMapPin className="h-5 w-5" />
        },
        { label: "Guest Limit", value: `${createdEvent.guestLimit} Guests`, icon: <FiUsers className="h-5 w-5" /> },
      ]
    : [];

  return (
    <PageShell
      eyebrow="Host HQ"
      title="Create event"
      description="Fill in ceremony details, then get your invite and usher links instantly."
      className="max-w-3xl"
    >
      {creating && <CreateSplash />}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500 font-medium">
          {error}
        </div>
      )}

      {step === "form" && (
        <div className="fade-up">
          <CeremonyDetailsForm
            key="new"
            initialValues={defaultCeremony}
            onSubmit={handleCreateEvent}
            isSubmitting={creating}
          />
        </div>
      )}

      {step === "summary" && createdEvent && (
        <div className="space-y-6 fade-up">
          {/* Success banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-[var(--color-line-strong)] bg-[var(--color-ivory)] px-6 py-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-ink-strong)] text-[var(--color-ivory)] shadow-[0_8px_16px_rgba(0,0,0,0.15)]">
              <FiCheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-[var(--color-ink-strong)] tracking-tight">Event active & ready</p>
              <p className="text-[14px] mt-0.5 text-[var(--color-ink-muted)] font-medium leading-relaxed">
                Your backend engine is spinning. Share the invite link publicly—keep the usher link private.
              </p>
            </div>
          </div>

          {/* Summary grid */}
          <section className="card-surface p-7">
            <div className="border-b border-[var(--color-line-soft)] pb-4 mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)] mb-1">
                Event Summary
              </p>
              <h3 className="font-serif text-2xl text-[var(--color-ink-strong)]">At a glance</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {summaryLines.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-start gap-4 rounded-[14px] border border-[var(--color-line-soft)] bg-[var(--color-ivory)]/90 p-4 shadow-sm slide-in stagger-${Math.min(i, 3)}`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-line-soft)] text-[var(--color-ink-strong)]">
                    {item.icon}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-[var(--color-ink-strong)]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Links */}
          <section className="card-surface p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--color-line-soft)] pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)] mb-1">
                  Access Controls
                </p>
                <h3 className="font-serif text-2xl text-[var(--color-ink-strong)]">Generated Links</h3>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[var(--color-line-soft)]">
                <FiShield className="text-[var(--color-ink-strong)] h-5 w-5" />
              </div>
            </div>
            <div className="space-y-4">
              <LinkBlock
                label="Public Invitee portal"
                description="Guests use this to RSVP and generate personal QR/Text access passes."
                url={createdEvent.inviteeLink}
                badge="Public"
              />
              <LinkBlock
                label="Usher console access"
                description="Share privately with staff. Requires zero signup for the usher."
                url={createdEvent.usherLink}
                badge="Private"
              />
            </div>
          </section>

          <Button
            variant="default"
            size="lg"
            fullWidth
            className="mt-6"
            onClick={() => {
              setStep("form");
              setCreatedEvent(null);
              setError(null);
            }}
          >
            <FiPlusCircle className="h-[18px] w-[18px]" />
            Set up another event
          </Button>
        </div>
      )}
    </PageShell>
  );
}

function CreateSplash() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ivory)]/70 px-6 backdrop-blur-[24px]">
      <div className="relative flex flex-col items-center space-y-6">
        <div className="logo-pulse flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--color-ink-strong)] text-[var(--color-ivory)] shadow-[0_24px_50px_-16px_rgba(0,0,0,0.5)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        <div className="logo-ring absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-3xl border border-[var(--color-ink-strong)]/30" />

        <div className="space-y-1.5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--color-ink-muted)]">
            Securing Infrastructure
          </p>
          <h3 className="font-serif text-2xl text-[var(--color-ink-strong)]">Generating Tokens</h3>
          <p className="text-[14px] text-[var(--color-ink-muted)] max-w-[32ch] mx-auto font-medium">
            Building live tables and issuing secure keys...
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-ink-strong)] opacity-30" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-ink-strong)] opacity-60" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-ink-strong)]" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
