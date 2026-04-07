"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { BottomNav } from "@/components/BottomNav";
import { SplashScreen } from "@/components/SplashScreen";
import { TopBar } from "@/components/TopBar";

function isPublicRoute(pathname: string) {
  return pathname.startsWith("/auth") || pathname.startsWith("/invite") || pathname.startsWith("/usher");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [splashDone, setSplashDone] = useState(false);

  const publicRoute = isPublicRoute(pathname);
  const shouldGateRoute = !publicRoute;

  useEffect(() => {
    if (!splashDone || !isLoaded) {
      return;
    }

    if (shouldGateRoute && !isSignedIn) {
      router.replace("/auth/login");
      return;
    }

    if (pathname.startsWith("/auth") && isSignedIn) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, pathname, router, shouldGateRoute, splashDone]);

  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  if (shouldGateRoute && !isLoaded) {
    return null;
  }

  if (shouldGateRoute && !isSignedIn) {
    return null;
  }

  return (
    <>
      <TopBar />
      {children}
      <BottomNav />
    </>
  );
}
