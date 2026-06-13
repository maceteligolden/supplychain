"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { normalizeError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";

export interface ErrorBoundaryProps {
  /** Fallback UI when an error is caught; receives the normalized error message. */
  fallback?: (message: string) => ReactNode;
  /** Tree of components protected by this boundary. */
  children: ReactNode;
}

interface ErrorBoundaryStateInterface {
  hasError: boolean;
  message: string;
}

/**
 * ErrorBoundary
 *
 * Catches render errors in child components, logs them via the shared logger,
 * and renders a minimal recovery UI. Use around client feature islands that
 * should not crash the entire page shell.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryStateInterface
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryStateInterface {
    const normalized = normalizeError({ error });
    return { hasError: true, message: normalized.message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    logger.error("Uncaught render error", {
      namespace: "error-boundary",
      meta: { error, componentStack: info.componentStack },
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, message: "" });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.message);
      }

      return (
        <div className="gap-card border-border bg-muted p-page rounded-card flex flex-col items-center border text-center">
          <h2 className="text-foreground text-lg font-semibold">
            Something went wrong
          </h2>
          <p className="text-muted-foreground max-w-prose text-sm">
            {this.state.message}
          </p>
          <Button variant="outline" onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
