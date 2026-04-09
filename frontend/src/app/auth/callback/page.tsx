"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<"signing-in" | "creating">("signing-in");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const id = params.get("id");
    const name = params.get("name");
    const email = params.get("email");
    const avatar = params.get("avatar");
    const isNew = params.get("new") === "1";
    const error = params.get("error");

    if (error || !token || !id) {
      router.replace("/auth/login?error=google_failed");
      return;
    }

    const user = {
      id,
      name: name ?? "",
      email: email ?? "",
      avatar: avatar || undefined,
      provider: "google" as const,
    };

    login(user, token);

    if (isNew) {
      setStatus("creating");
      const t = setTimeout(() => router.replace("/"), 1500);
      return () => clearTimeout(t);
    } else {
      router.replace("/");
    }
  }, [router, login]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[var(--color-shell)]">
      {status === "creating" ? (
        <>
          <p className="font-serif text-xl text-[var(--color-ink-strong)]">Creating your account…</p>
          <p className="text-sm text-[var(--color-ink-muted)]">Just a moment while we set things up</p>
        </>
      ) : (
        <p className="text-sm text-[var(--color-ink-muted)]">Signing you in…</p>
      )}
    </div>
  );
}
