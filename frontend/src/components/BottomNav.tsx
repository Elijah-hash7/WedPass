"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiSettings } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/settings", label: "Settings", icon: FiSettings },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth") || pathname.startsWith("/invite") || pathname.startsWith("/usher")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2">
      <div className="glass-panel px-6 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-around relative">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/host")
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex w-24 flex-col items-center justify-center gap-1.5 py-2 z-10 transition-colors duration-200",
                  active
                    ? "text-[var(--color-ink-strong)]"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-strong)]"
                )}
              >
                <motion.div whileTap={{ scale: 0.8 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                  <item.icon
                    className="h-[22px] w-[22px]"
                    strokeWidth={active ? 2.5 : 2}
                  />
                </motion.div>
                <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>

                {active && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-1 box-content h-1 w-1 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary-glow)]"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)] bg-[var(--color-shell)]/95 backdrop-blur-md" />
    </nav>
  );
}
