"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowRight, FiGrid, FiPlusCircle } from "react-icons/fi";
import { useAuth } from "@/lib/auth-context";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.35, duration: 0.75 } },
};

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  const firstName = user.name.split(" ")[0];

  return (
    <main className="page-shell has-bottom-nav">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Soft atmospheric background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-64 bg-gradient-to-b from-[var(--color-primary-glow)] to-transparent pointer-events-none opacity-50 blur-3xl" />

        {/* Hero Card */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-[24px] border border-[var(--color-line-soft)] px-6 pb-5 pt-7 text-[var(--color-ivory)] shadow-[0_24px_54px_-20px_rgba(0,0,0,0.4)]"
          style={{
            background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)"
          }}
        >
          {/* Noise + subtle gold mesh overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.3),transparent_55%)]" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(194,155,67,0.15),transparent_65%)] blur-2xl" />
          
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#efdbac] mb-3 opacity-90"
            >
              Horizon OS
            </motion.p>
            <div className="space-y-3">
              <h1 className="max-w-[15ch] text-[1.9rem] leading-[1.1] font-semibold text-white tracking-tight">
                Hello, {firstName}. <br />
                Your events await.
              </h1>
              <p className="max-w-[28ch] text-[15px] leading-relaxed text-white/50 font-medium tracking-wide">
                Create elegant ceremonies, share invite links, and manage live check-ins effortlessly.
              </p>
            </div>

            {/* Decorative stat row */}
            <div className="mt-4 flex items-center gap-6 border-t border-white/10 pt-4">
              <div className="space-y-1 pl-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Role</p>
                <p className="text-[13px] font-semibold text-white/90">Host</p>
              </div>
              <div className="h-6 w-[1px] bg-white/10" />
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#efdbac] opacity-90" />
                  <p className="text-[13px] font-semibold text-white/90">Active System</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Action cards - Section */}
        <motion.div variants={itemVariants} className="space-y-3">
          <p className="px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
            Quick Actions
          </p>
          <div className="grid gap-3">
            <ActionCard
              title="Create new event"
              copy="Set up a ceremony and instantly generate secure invite and usher links."
              href="/host"
              icon={<FiPlusCircle className="h-[20px] w-[20px]" />}
              variant="primary"
            />
            <ActionCard
              title="Dashboard metrics"
              copy="View saved events, pause check-ins, and monitor guest metrics."
              href="/host/dashboard"
              icon={<FiGrid className="h-[20px] w-[20px]" />}
              variant="secondary"
            />
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

function ActionCard({
  title,
  copy,
  icon,
  href,
  variant = "secondary",
}: {
  title: string;
  copy: string;
  icon: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";

  return (
    <Link href={href} className="group block focus:outline-none">
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        className={`card-surface h-full p-5 relative overflow-hidden ${isPrimary ? 'border-[var(--color-line-strong)]' : ''}`}
      >
        {isPrimary && (
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--color-ink-strong)]" />
        )}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-all duration-300 ${
              isPrimary
                ? "bg-[var(--color-ink-strong)] text-[var(--color-ivory)] shadow-md group-hover:opacity-90"
                : "bg-[var(--color-line-soft)] text-[var(--color-ink-muted)] group-hover:bg-[var(--color-line-strong)] group-hover:text-[var(--color-ink-strong)]"
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className={`text-[16px] font-semibold tracking-tight ${isPrimary ? "text-[var(--color-ink-strong)]" : "text-[var(--color-ink-soft)]"}`}>
              {title}
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)] font-medium">
              {copy}
            </p>
          </div>
          <div
            className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
              isPrimary
                ? "bg-[var(--color-primary-tint)] text-[var(--color-ink-strong)] group-hover:bg-[var(--color-ink-strong)] group-hover:text-[var(--color-ivory)]"
                : "text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink-strong)]"
            }`}
          >
            <FiArrowRight className="h-[16px] w-[16px] transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
