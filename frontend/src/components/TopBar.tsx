"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function getCartoonAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function TopBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/auth") || pathname.startsWith("/invite") || pathname.startsWith("/usher")) {
    return null;
  }

  const avatarSeed = user?.id ?? user?.name ?? "wedpass-host";
  const avatarUrl = getCartoonAvatarUrl(avatarSeed);
  const initials = getInitials(user?.name ?? "WP");

  return (
    <div className={`sticky top-0 z-50 flex w-full items-center justify-between transition-all duration-300 pointer-events-auto ${scrolled ? "border-b border-[var(--color-line-soft)] bg-[var(--color-ivory)]/75 px-5 py-3 shadow-sm backdrop-blur-md sm:px-6" : "bg-transparent px-5 py-5 sm:px-6 sm:py-6"}`}>
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-ink-strong)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <span className="font-sans text-[14px] font-semibold tracking-widest uppercase text-[var(--color-ink-strong)]">
          WedPass
        </span>
      </div>

      {pathname.startsWith("/host") && (
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-gold)] bg-gradient-to-br from-[#f9e8c8] to-[#e8c882] shadow-md">
          {!imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Profile avatar"
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="font-sans text-[13px] font-bold text-[#7a5a1a]">
              {initials}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
