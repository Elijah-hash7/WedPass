"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FiDownload, FiHeart, FiShare2 } from "react-icons/fi";
import * as htmlToImage from "html-to-image";
import { fetchEventByToken, parseApiError, registerInvitee, type EventDetailsResponse } from "@/lib/api";
import { formatWeddingDate } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";

const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 15 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 28, staggerChildren: 0.1 } },
  exit: { opacity: 0, scale: 0.96, y: -15, transition: { duration: 0.25 } },
};

type ViewState = "rsvp" | "generating" | "card";

export default function InviteTokenPage() {
  const params = useParams<{ inviteeToken: string }>();
  const inviteeToken = params.inviteeToken;

  const [event, setEvent] = useState<EventDetailsResponse | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>("rsvp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inviteeToken) return;
    fetchEventByToken(inviteeToken)
      .then(setEvent)
      .catch(() => {})
      .finally(() => setEventLoading(false));
  }, [inviteeToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await registerInvitee({ name, inviteeToken });
      setAccessCode(res.accessCode);
      setView("generating");

      await new Promise((r) => setTimeout(r, 1800));
      setView("card");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const brideGroom = event?.name?.split(/\s+(?:&|and)\s+/i) ?? [];
  const groomName = brideGroom[0] || "Groom";
  const brideName = brideGroom[1] || "Bride";
  const eventDate = event?.date ? formatWeddingDate(event.date) : "";

  const generateInvitationImage = useCallback(async () => {
    if (!cardRef.current) throw new Error("Invitation card is not ready.");
    const el = cardRef.current;
    
    // dynamically fetch the current background color instead of forcing black
    const computedBg = getComputedStyle(el).backgroundColor;
    const finalBgColor = computedBg !== "rgba(0, 0, 0, 0)" ? computedBg : undefined;
    
    return htmlToImage.toPng(el, {
      pixelRatio: 2,
      backgroundColor: finalBgColor,
      skipFonts: true,
    });
  }, []);

  const handleDownloadImage = useCallback(async () => {
    setError(null);
    try {
      const dataUrl = await generateInvitationImage();
      if (!dataUrl) throw new Error("Could not generate invitation image.");
      const link = document.createElement("a");
      link.download = `WedPass-${groomName}-${brideName}-Access.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      setError(parseApiError(err) || "Failed to download image. Try taking a screenshot.");
    }
  }, [brideName, generateInvitationImage, groomName]);

  const handleShare = useCallback(async () => {
    setError(null);
    const shareText = `You're invited to the wedding of ${groomName} & ${brideName}!\n\nDate: ${eventDate}\nAccess Code: ${accessCode}\n\nPowered by WedPass`;

    if (navigator.share) {
      try {
        const dataUrl = await generateInvitationImage();
        if (dataUrl) {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], "wedding-access.png", { type: "image/png" });
          await navigator.share({
            title: `${groomName} & ${brideName} Wedding Access`,
            text: shareText,
            files: [file],
          });
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.warn("Falling back to text share.", err);
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      alert("Invitation details copied to clipboard!");
    } catch (err) {
      setError(parseApiError(err));
    }
  }, [accessCode, brideName, eventDate, generateInvitationImage, groomName]);

  // For OTP style formatting i.e (W) (4) (D) (X)
  const formatCodeAsBlocks = (code: string) => {
    return code.split("").map((char, idx) => (
      <div key={idx} className="flex h-14 sm:h-20 flex-1 max-w-[3.5rem] sm:max-w-[4.5rem] items-center justify-center rounded-xl sm:rounded-2xl bg-[var(--color-ivory)] shadow-[0_12px_24px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,1)] border border-[var(--color-line-soft)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-60" />
        <span className="text-2xl sm:text-4xl font-serif font-medium tracking-tight text-[var(--color-ink-strong)] relative z-10">
          {char}
        </span>
      </div>
    ));
  };

  return (
    <main className="relative min-h-screen w-full bg-[var(--color-shell)] text-[var(--color-ink-strong)] flex flex-col items-center px-4 pt-12 pb-32 sm:pt-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-ivory)] via-[var(--color-shell)] to-[rgba(239,219,172,0.2)]" />
      <div className="absolute top-0 left-1/2 -ml-[400px] -z-10 h-[800px] w-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(194,155,67,0.12),transparent_70%)] blur-3xl pointer-events-none" />
      <div className="w-full max-w-[800px] mx-auto z-10">
      <AnimatePresence mode="wait">
        {/* RSVP FORM STATE */}
        {view === "rsvp" && (
          <motion.div
            key="rsvp"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="card-surface overflow-hidden rounded-[32px] bg-[var(--color-ivory)]/70 backdrop-blur-2xl shadow-[var(--shadow-strong)] border border-[var(--color-line-soft)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 text-[var(--color-ink-strong)]">
              {/* Left: RSVP invitation display */}
              <div className="relative p-12 sm:p-16 flex flex-col items-center justify-center text-center overflow-hidden border-b border-[var(--color-line-soft)] lg:border-b-0 lg:border-r bg-[var(--color-ivory)]/40">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(194,155,67,0.05))]" />
                {/* Subtle light glow behind text */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[var(--color-ivory)] rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10 w-full space-y-8">
                  <div className="space-y-5">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--color-gold)] font-bold opacity-80">
                      You are Invited
                    </p>
                    <div className="mx-auto w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-60" />
                    <h2 className="font-serif text-[3.2rem] sm:text-[3.8rem] text-[var(--color-ink-strong)] leading-[1.1] tracking-tight drop-shadow-sm">
                      {eventLoading ? (
                        <span className="inline-block h-10 w-48 rounded-lg bg-[var(--color-line-soft)] shimmer-bg" />
                      ) : (
                        <>{groomName} <span className="block text-[var(--color-gold)] text-3xl my-3">&</span> {brideName}</>
                      )}
                    </h2>
                  </div>

                  <div className="mx-auto h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--color-line-strong)] to-transparent" />

                  {event && (
                    <div className="space-y-1.5">
                      <p className="text-[13px] font-bold text-[var(--color-ink-muted)]/80 uppercase tracking-[0.25em]">{eventDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: RSVP form */}
              <div className="relative p-10 flex flex-col justify-center">
                <div className="absolute inset-0 bg-transparent blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-10">
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-ink-muted)] font-bold">
                      Digital Pass
                    </p>
                    <h3 className="font-serif text-4xl font-medium text-[var(--color-ink-strong)] tracking-tight">
                      Secure Access
                    </h3>
                    <p className="text-[15px] leading-relaxed text-[var(--color-ink-soft)] max-w-[32ch]">
                      Enter your name to unlock your personalized code.
                    </p>
                  </div>

                  <form className="space-y-7" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Guest full name"
                        className="flex h-[60px] w-full rounded-2xl border border-[var(--color-line-soft)] bg-[var(--color-shell)] px-5 text-[16px] text-[var(--color-ink-strong)] placeholder:text-[var(--color-ink-muted)] shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]/30 focus-visible:border-[var(--color-gold)] transition-all font-medium"
                        required
                      />
                    </div>

                    {error && (
                      <div className="rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-[14px] font-medium text-red-600">
                        {error}
                      </div>
                    )}

                    <button type="submit" disabled={loading || !name.trim()} className="flex items-center justify-center w-full bg-[var(--color-ink-strong)] text-[var(--color-ivory)] hover:bg-[var(--color-ink-soft)] border-none shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.4)] h-[60px] rounded-2xl font-black uppercase tracking-[0.1em] text-[13px] transition-all disabled:opacity-50">
                      {loading ? "Authenticating..." : "Generate Pass"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* GENERATING STATE */}
        {view === "generating" && (
          <motion.div
            key="generating"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center py-24"
          >
            <div className="text-center space-y-8">
              <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[3px] border-[var(--color-line-soft)] border-t-[var(--color-gold)] animate-[spin_2s_ease-in-out_infinite]" />
                <div className="absolute inset-3 rounded-full border-[2px] border-transparent border-b-[var(--color-ink-strong)] animate-[spin_1.5s_linear_infinite_reverse]" />
                <FiHeart className="h-8 w-8 text-[var(--color-gold)] animate-pulse" />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-3xl text-[var(--color-ink-strong)] tracking-tight">
                  Generating Pass
                </h3>
                <p className="text-[15px] text-[var(--color-ink-muted)] font-medium">
                  Personalizing for {name}...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* GENERATED CARD STATE */}
        {view === "card" && accessCode && (
          <motion.div
            key="card"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6 max-w-lg mx-auto"
          >
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-400 mb-4 text-center">
                {error}
              </div>
            )}
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-[32px] border border-[var(--color-line-soft)] bg-[var(--color-ivory)] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,1)] pb-8"
            >
              {/* Soft rich gradient overlay */}
              <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(194,155,67,0.1),transparent_60%)]" />
              <div className="absolute inset-x-0 bottom-0 h-40 opacity-20 pointer-events-none bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.05))]" />

              <div className="relative pt-14 pb-10 px-6 sm:px-12 text-center border-b border-[var(--color-line-soft)] bg-[var(--color-ivory)]/40">
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[var(--color-gold)] mb-5">
                  Exclusive Access
                </p>
                <div className="space-y-3">
                  <h2 className="font-serif text-4xl sm:text-5xl text-[var(--color-ink-strong)] leading-tight tracking-tight drop-shadow-sm">
                    {groomName} <span className="text-[var(--color-gold)] mx-1">&</span> {brideName}
                  </h2>
                </div>
              </div>

              <div className="px-6 sm:px-12 py-10 space-y-10 relative">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[var(--color-ink-muted)]">Date</p>
                    <p className="text-[15px] font-semibold text-[var(--color-ink-strong)] leading-snug">{eventDate}</p>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[var(--color-ink-muted)]">Venue</p>
                    <p className="text-[15px] font-semibold text-[var(--color-ink-strong)] leading-snug">{event?.venue}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-line-strong)] to-transparent" />

                <div className="text-center space-y-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Entry Code
                  </p>
                  <div className="flex justify-center gap-1.5 sm:gap-3 perspective-1000 w-full">
                    {formatCodeAsBlocks(accessCode)}
                  </div>
                  <p className="text-[12px] font-medium text-[var(--color-ink-muted)] mt-8 tracking-wide max-w-[32ch] mx-auto">
                    Screenshot this pass. Present the code to ushers upon arrival.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button type="button" onClick={handleDownloadImage} className="flex items-center justify-center gap-2.5 w-full bg-[var(--color-ink-strong)] text-[var(--color-ivory)] hover:bg-[var(--color-ink-soft)] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4)] h-14 rounded-2xl font-bold transition-all disabled:opacity-50 min-w-[200px] text-[14px] uppercase tracking-[0.1em]">
                <FiDownload className="h-[16px] w-[16px]" />
                Save to Photos
              </button>
              <button type="button" onClick={handleShare} className="flex items-center justify-center bg-[var(--color-ivory)] border border-[var(--color-line-strong)] text-[var(--color-ink-strong)] hover:bg-[var(--color-shell)] h-14 rounded-2xl shadow-sm sm:w-[76px] flex-none transition-all disabled:opacity-50">
                <FiShare2 className="h-[18px] w-[18px]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </main>
  );
}
