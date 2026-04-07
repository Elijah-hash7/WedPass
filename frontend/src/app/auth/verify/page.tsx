"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Clerk handles email verification inline during sign-up — this page is no longer needed.
export default function VerifyPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/auth/register"); }, [router]);
  return null;
}
