"use client";

import { FcGoogle } from "react-icons/fc";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export default function LoginPage() {
  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--color-shell)] px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-4xl text-[var(--color-ink-strong)]">Welcome</h1>
          <p className="text-[13px] text-[var(--color-ink-muted)]">
            Sign in to manage your wedding events
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-md shadow-xl border border-[#e8d5b7] rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <p className="font-serif text-xl text-[var(--color-ink-strong)]">Sign in to WedPass</p>
            <p className="text-[12px] text-[var(--color-ink-muted)]">
              Use your Google account to continue
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#e8d5b7] bg-white px-4 py-3.5 text-sm font-semibold text-[var(--color-ink-strong)] shadow-sm transition hover:bg-[#faf8f5] active:scale-[0.98]"
          >
            <FcGoogle className="h-5 w-5 shrink-0" />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
