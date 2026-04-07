"use client";

import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/nextjs";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "local" | "google";
}

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { getToken: clerkGetToken } = useClerkAuth();

  const user: User | null = clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName ?? clerkUser.firstName ?? "",
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        avatar: clerkUser.imageUrl,
        provider: "local",
      }
    : null;

  const logout = () => signOut({ redirectUrl: "/auth/login" });

  const getToken = async () => clerkGetToken();

  return {
    user,
    loading: !isLoaded,
    logout,
    getToken,
  };
}

// Kept for backward-compat imports — no-op wrapper since ClerkProvider is in layout
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};
