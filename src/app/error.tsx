"use client";

import { useEffect } from "react";

import { normalizeError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";

export interface GlobalErrorProps {
  /** Next.js error object with optional digest for server errors. */
  error: Error & { digest?: string };
  /** Resets the error boundary and retries rendering. */
  reset: () => void;
}

/**
 * Global error page for the App Router. Logs the failure and offers a retry
 * action without exposing internal stack traces to end users.
 */
export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps): React.JSX.Element {
  useEffect((): void => {
    const normalized = normalizeError({ error });
    logger.error("Global app error", {
      namespace: "app",
      meta: { digest: error.digest, code: normalized.code },
    });
  }, [error]);

  return (
    <div className="p-page flex min-h-[50vh] items-center justify-center">
      <div className="max-w-content gap-card flex flex-col items-center text-center">
        <h1 className="text-foreground text-2xl font-bold">Application error</h1>
        <p className="text-muted-foreground">
          We could not complete your request. Please try again.
        </p>
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  );
}
