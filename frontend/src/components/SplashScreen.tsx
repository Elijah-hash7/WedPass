"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen({ onDone }: { onDone?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDone?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--color-shell)]"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -left-16 top-12 h-96 w-96 rounded-full bg-[rgba(212,176,69,0.15)] blur-[100px]" />
            <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[rgba(139,58,98,0.12)] blur-[100px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-72 w-[500px] rounded-full bg-[rgba(201,168,76,0.15)] blur-[100px]" />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Logo Icon */}
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-[var(--color-primary)] text-white shadow-[0_25px_60px_-15px_rgba(139,58,98,0.5)]">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>

            {/* Brand Name */}
            <div className="text-center space-y-2">
              <motion.p
                initial={{ letterSpacing: "0.2em", opacity: 0 }}
                animate={{ letterSpacing: "0.5em", opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="font-sans text-[11px] font-bold uppercase text-[var(--color-ink-muted)]"
              >
                WedPass
              </motion.p>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="font-serif text-[2.8rem] italic font-light text-[var(--color-ink-strong)] tracking-wide"
              >
                Elegant Ceremonies
              </motion.h1>
            </div>

            {/* Loading Indicator */}
            <div className="mt-12 w-48 h-[1px] bg-[var(--color-line-soft)] relative overflow-hidden">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
