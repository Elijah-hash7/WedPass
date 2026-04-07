"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiHelpCircle, FiLogOut, FiMail, FiMoon, FiShield, FiSun } from "react-icons/fi";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shells/PageShell";

const themeStorageKey = "wedpass-theme";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(themeStorageKey) === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", darkMode);
    window.localStorage.setItem(themeStorageKey, darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <PageShell
      eyebrow="Account"
      title="Settings"
      description="Manage your account, appearance, and learn how WedPass works."
      className="max-w-2xl"
    >
      <div className="space-y-5 fade-up">
        {/* Profile */}
        {user ? (
          <section className="card-surface bg-white/90 p-6 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-tint)] text-lg font-bold text-[var(--color-primary)] shadow-sm">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{user.name.slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                  Account
                </p>
                <h3 className="truncate font-serif text-2xl text-[var(--color-ink-strong)]">{user.name}</h3>
                <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--color-primary-tint)] px-3 py-1 text-sm text-[var(--color-primary)]">
                  <FiMail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-[12px] font-medium">{user.email}</span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="card-surface space-y-4 bg-white/90 p-6 text-center sm:p-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary)]">
              <FiShield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-[var(--color-ink-strong)]">Not signed in</h3>
              <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">
                Sign in to save your events and keep your host dashboard synced.
              </p>
            </div>
            <Button onClick={() => router.push("/auth/login")}>
              Sign in
              <FiArrowRight className="h-4 w-4" />
            </Button>
          </section>
        )}

        {/* Appearance */}
        <section className="card-surface overflow-hidden bg-white/90 p-6 sm:p-7 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                Appearance
              </p>
              <h3 className="font-serif text-2xl text-[var(--color-ink-strong)]">Dark mode</h3>
              <p className="text-[13px] text-[var(--color-ink-muted)]">
                Switch the interface feel without changing your host setup.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary-tint)] text-[var(--color-primary)] shrink-0">
              {darkMode ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((v) => !v)}
            className={`flex w-full items-center justify-between rounded-[24px] border p-4 text-left transition-all duration-300 ${
              darkMode
                ? "border-[var(--color-primary)]/35 bg-[linear-gradient(135deg,#1a1612_0%,#0f0d0b_50%,#080808_100%)] text-[var(--color-ink-strong)] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.85)]"
                : "border-[var(--color-line-strong)] bg-[var(--color-ivory)] text-[var(--color-ink-strong)]"
            }`}
          >
            <div className="space-y-0.5 pl-1">
              <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? "text-[var(--color-primary-soft)]" : "text-[var(--color-ink-muted)]"}`}>
                Interface mode
              </p>
              <p className="text-sm font-semibold">
                {darkMode ? "Dark mode is on" : "Light mode is on"}
              </p>
            </div>
            <span className={`relative flex h-10 w-[72px] items-center rounded-full border p-1 transition-colors ${darkMode ? "border-[var(--color-primary)]/20 bg-[rgba(241,227,196,0.12)]" : "border-transparent bg-[var(--color-shell)]"}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full shadow-[0_8px_18px_-10px_rgba(26,12,18,0.6)] transition-all duration-300 ${
                darkMode
                  ? "translate-x-8 bg-[var(--color-primary)] text-[#111111]"
                  : "translate-x-0 bg-[var(--color-ink-strong)] text-white"
              }`}>
                {darkMode ? <FiMoon className="h-4 w-4" /> : <FiSun className="h-4 w-4" />}
              </span>
            </span>
          </button>
        </section>

        {/* Help */}
        <section className="card-surface overflow-hidden bg-white/90">
          <HelpSection />
        </section>

        {/* Sign out */}
        {user && (
          <Button variant="outline" fullWidth onClick={handleLogout}>
            <FiLogOut className="h-4 w-4" />
            Sign out
          </Button>
        )}
      </div>
    </PageShell>
  );
}

function HelpSection() {
  const steps = [
    {
      title: "Create an event",
      description: "Fill in ceremony details, date, time, venue, and guest limit. WedPass generates an invite link and usher link automatically.",
    },
    {
      title: "Share the invite link",
      description: "Send the public invite link to guests. They enter their name and receive a personal access code.",
    },
    {
      title: "Toggle check-in when ready",
      description: "Turn invite check-in on from the dashboard only when entry should begin so ushers do not start too early.",
    },
    {
      title: "Monitor live metrics",
      description: "Watch registrations, successful scans, and remaining guests from the selected event dashboard.",
    },
  ];

  return (
    <div className="space-y-4 px-6 pb-6 pt-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-primary)]">
          <FiHelpCircle className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">Guide</p>
          <h4 className="font-serif text-xl text-[var(--color-ink-strong)]">How WedPass works</h4>
        </div>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-2xl border border-[var(--color-line-soft)] bg-[var(--color-ivory)] p-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm font-semibold text-[var(--color-ink-strong)]">{step.title}</p>
            </div>
            <p className="pl-10 pt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
