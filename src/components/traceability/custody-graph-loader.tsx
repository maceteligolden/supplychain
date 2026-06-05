"use client";

import dynamic from "next/dynamic";

import type { CustodyGraphProps } from "@/components/traceability/custody-graph";

const CustodyGraph = dynamic(
  () =>
    import("@/components/traceability/custody-graph").then(
      (module) => module.CustodyGraph,
    ),
  {
    ssr: false,
    loading: (): React.JSX.Element => (
      <div className="border-border bg-muted/20 text-muted-foreground flex h-96 items-center justify-center rounded-lg border text-sm">
        Loading chain-of-custody graph…
      </div>
    ),
  },
);

/**
 * CustodyGraphLoader
 *
 * SSR-safe dynamic wrapper for the React Flow custody graph.
 */
export function CustodyGraphLoader(props: CustodyGraphProps): React.JSX.Element {
  return <CustodyGraph {...props} />;
}
