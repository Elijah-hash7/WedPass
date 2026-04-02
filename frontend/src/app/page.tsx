import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FiArrowRight, FiShield, FiUsers, FiLogIn } from "react-icons/fi";

export default function LandingPage() {
  return (
    <main className="page-shell">
      <div className="space-y-8 fade-up">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-ink-muted)] flex items-center gap-2">
            WedPass
            <span className="h-[1px] w-8 bg-[var(--color-ink-muted)]/40" />
            Live ceremony verification
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-[var(--color-ink-strong)] leading-tight">
            Elegant entry for the people that matter.
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink-muted)] max-w-xl leading-relaxed">
            A premium, mobile-first flow for hosts, invitees, and ushers. Create the event, share
            beautiful invitations, and check guests in at speed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 w-full">
          <RoleCard
            title="Host console"
            copy="Create the event, share links, watch metrics."
            icon={<FiShield />}
            href="/host"
            cta="Open dashboard"
          />
          <RoleCard
            title="Invitee link"
            copy="Guests confirm names and receive personal codes."
            icon={<FiUsers />}
            href="/invite"
            cta="Open invitation"
          />
          <RoleCard
            title="Usher lane"
            copy="Fast code entry with vivid state feedback."
            icon={<FiLogIn />}
            href="/usher"
            cta="Start checking in"
          />
        </div>

        {/* How it works preview */}
        <div className="space-y-4">
          <h2 className="font-serif text-3xl text-[var(--color-ink-strong)]">How WedPass works</h2>
          <p className="text-[var(--color-ink-muted)] text-sm sm:text-base max-w-3xl">
            Create your ceremony once, share the public invite link, and let ushers verify guests with live status.
            Here’s a peek of what hosts and ushers see inside.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
            <PreviewCard title="Event summary" subtitle="Live links follow your latest details">
              <div className="space-y-3">
                {[{ label: "Ceremony", value: "Adebayo & Tolu" }, { label: "Date", value: "Saturday, April 12, 2025" }, { label: "Time", value: "10:00 AM" }, { label: "Venue", value: "Balmoral Hall, Victoria Island, Lagos" }].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[var(--color-line-soft)] bg-white px-4 py-3 flex flex-col gap-1 shadow-[0_16px_40px_-30px_rgba(15,35,25,0.35)]"
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">{item.label}</p>
                    <p className="text-[var(--color-ink-strong)] text-sm sm:text-base">{item.value}</p>
                  </div>
                ))}
              </div>
            </PreviewCard>

            <PreviewCard title="Live metrics" subtitle="Room feel">
              <div className="space-y-3">
                {[{ label: "Invitees", hint: "Guests created" }, { label: "Checked in", hint: "Successful scans" }, { label: "Invalid attempts", hint: "Codes rejected" }].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-[var(--color-line-soft)] bg-white px-4 py-3 flex items-center justify-between shadow-[0_16px_40px_-30px_rgba(15,35,25,0.35)]"
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">{metric.label}</p>
                      <p className="text-[var(--color-ink-muted)] text-sm">{metric.hint}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[var(--color-emerald-tint)] text-[var(--color-emerald)] flex items-center justify-center">
                      <FiArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--color-ink-muted)] pt-2">Metrics go live after you create the event.</p>
            </PreviewCard>

            <PreviewCard title="Event blueprint" subtitle="Keep it crisp—these details power your links.">
              <div className="space-y-3">
                {[{ label: "Celebrated couple", value: "Adebayo & Tolu" }, { label: "Ceremony date", value: "04/12/2025" }, { label: "Start time", value: "10:00 AM" }, { label: "Venue name", value: "Balmoral Hall" }, { label: "Venue location", value: "Victoria Island, Lagos" }].map((field) => (
                  <div
                    key={field.label}
                    className="rounded-xl border border-[var(--color-line-soft)] bg-white px-4 py-2.5 shadow-[0_12px_30px_-28px_rgba(15,35,25,0.35)]"
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-muted)] mb-1">{field.label}</p>
                    <p className="text-[var(--color-ink-strong)] text-sm">{field.value}</p>
                  </div>
                ))}
                <Button variant="secondary" size="sm" className="w-full">
                  Create event & generate links
                </Button>
              </div>
            </PreviewCard>
          </div>
        </div>

      </div>
    </main>
  );
}

function RoleCard({
  title,
  copy,
  icon,
  href,
  cta,
}: {
  title: string;
  copy: string;
  icon: ReactNode;
  href: string;
  cta: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="card-surface bg-white/80 p-5 sm:p-6 space-y-3 transition-transform duration-200 group-hover:-translate-y-[2px] h-full">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[var(--color-emerald-tint)] text-[var(--color-emerald)] flex items-center justify-center shadow-[0_12px_30px_-22px_rgba(31,107,74,0.6)]">
            {icon}
          </div>
          <h3 className="font-serif text-xl text-[var(--color-ink-strong)]">{title}</h3>
        </div>
        <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{copy}</p>
        <div className="text-sm font-semibold text-[var(--color-emerald)] flex items-center gap-2">
          {cta} <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-[2px]" />
        </div>
      </div>
    </Link>
  );
}

function PreviewCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="card-surface bg-white/80 p-5 sm:p-6 space-y-3 h-full">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">Preview</p>
          <h3 className="font-serif text-xl text-[var(--color-ink-strong)]">{title}</h3>
          {subtitle && <p className="text-sm text-[var(--color-ink-muted)]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
