"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Google OAuth is now handled by Clerk — this callback route is no longer needed.
export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, [router]);
  return null;
}
