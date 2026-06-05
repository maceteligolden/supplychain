"use client";

import dynamic from "next/dynamic";

import type { FarmBoundaryMapProps } from "@/components/farms/farm-boundary-map";

const FarmBoundaryMap = dynamic(
  () =>
    import("@/components/farms/farm-boundary-map").then(
      (module) => module.FarmBoundaryMap,
    ),
  {
    ssr: false,
    loading: (): React.JSX.Element => (
      <div className="border-border bg-muted/20 text-muted-foreground flex h-96 items-center justify-center rounded-lg border text-sm">
        Loading map…
      </div>
    ),
  },
);

/**
 * FarmBoundaryMapLoader
 *
 * SSR-safe dynamic wrapper for the Leaflet farm boundary map.
 */
export function FarmBoundaryMapLoader(props: FarmBoundaryMapProps): React.JSX.Element {
  return <FarmBoundaryMap {...props} />;
}
