"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const id = params.get("id");
    const name = params.get("name");
    const email = params.get("email");
    const avatar = params.get("avatar");
    const error = params.get("error");

    if (error || !token || !id) {
      router.replace("/auth/login?error=google_failed");
      return;
    }

    localStorage.setItem("wedpass_token", token);
    localStorage.setItem(
      "wedpass_user",
      JSON.stringify({ id, name: name ?? "", email: email ?? "", avatar: avatar ?? undefined, provider: "google" })
    );

    router.replace("/host");
  }, [router]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-shell)]">
      <p className="text-sm text-[var(--color-ink-muted)]">Signing you in…</p>
    </div>
  );
}
