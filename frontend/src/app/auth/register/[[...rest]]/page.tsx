"use client";

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--color-shell)] px-6 py-12">
      <SignUp
        path="/auth/register"
        routing="path"
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "bg-white/70 backdrop-blur-md shadow-xl border border-[#e8d5b7] rounded-2xl",
            headerTitle: "font-serif text-[var(--color-ink-strong)]",
            formButtonPrimary: "bg-[#09090b] hover:bg-black/90 rounded-2xl font-semibold",
            formFieldInput: "border border-[#e8d5b7] rounded-2xl bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-[#b8860b]",
            footerActionLink: "text-[#b8860b] hover:underline font-medium",
          },
        }}
      />
    </div>
  );
}
