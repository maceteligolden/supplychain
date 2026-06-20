"use client";

import dynamic from "next/dynamic";

import type { FarmUnifiedMapProps } from "@/components/farms/farm-unified-map";

const FarmUnifiedMap = dynamic(
  () =>
    import("@/components/farms/farm-unified-map").then(
      (module) => module.FarmUnifiedMap,
    ),
  {
    ssr: false,
    loading: (): React.JSX.Element => (
      <div className="bg-muted/30 text-muted-foreground flex h-full min-h-[28rem] items-center justify-center rounded-xl text-sm">
        Loading map…
      </div>
    ),
  },
);

/** SSR-safe dynamic wrapper for the unified farm map. */
export function FarmUnifiedMapLoader(props: FarmUnifiedMapProps): React.JSX.Element {
  return <FarmUnifiedMap {...props} />;
}

export type { FarmUnifiedBasemap } from "@/components/farms/farm-unified-map";
