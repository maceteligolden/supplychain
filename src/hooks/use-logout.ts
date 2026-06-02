"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PAGE_ROUTES } from "@/config/page-routes";
import { isAppError } from "@/lib/errors";
import { logout } from "@/services/auth.service";

type UseLogoutOutput = {
  /** Whether a logout request is in progress. */
  isLoggingOut: boolean;
  /** Error message from the last failed logout attempt. */
  error: string | null;
  /** Clears the session and redirects to the login page. */
  performLogout: () => void;
};

/**
 * Client hook wrapping the auth logout service with loading and error state.
 */
export function useLogout(): UseLogoutOutput {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);
    setError(null);

    try {
      await logout();
      router.push(PAGE_ROUTES.login);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        setError(err.message);
      } else {
        setError("Failed to sign out. Please try again.");
      }
    } finally {
      setIsLoggingOut(false);
    }
  }

  function performLogout(): void {
    void handleLogout();
  }

  return { isLoggingOut, error, performLogout };
}
