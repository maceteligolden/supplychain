"use client";

import { Provider } from "jotai";
import type { ReactNode } from "react";

export interface JotaiProviderProps {
  /** Child components that can consume Jotai atoms. */
  children: ReactNode;
}

/**
 * Wraps the application with Jotai's Provider so atoms are scoped per request
 * on the client. Server components should not read/write atoms directly.
 */
export function JotaiProvider({ children }: JotaiProviderProps): ReactNode {
  return <Provider>{children}</Provider>;
}
