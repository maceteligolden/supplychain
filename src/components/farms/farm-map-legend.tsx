"use client";

import type { FarmMapLegendItemInterface } from "@/types/farm-map-context.interface";

export interface FarmMapLegendProps {
  legend: FarmMapLegendItemInterface[];
}

/** Legend panel: category, color swatch, percent, and hectares. */
export function FarmMapLegend({ legend }: FarmMapLegendProps): React.JSX.Element {
  if (legend.length === 0) {
    return <></>;
  }

  return (
    <div className="bg-muted/40 border-border max-w-sm rounded-lg border p-3">
      <p className="text-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
        Land cover within boundary
      </p>
      <ul className="flex flex-col gap-1.5">
        {legend.map((item) => (
          <li key={item.category} className="flex items-center gap-2 text-xs">
            <span
              className="h-3 w-3 shrink-0 rounded-sm border border-black/10"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span className="text-foreground min-w-0 flex-1 truncate">
              {item.category}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {item.percent}% · {item.hectares.toLocaleString()} ha
            </span>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-2 text-[11px] leading-snug">
        Loss/gain are change pixels from GFW (often sparse). Plot fill + canopy density
        cover the rest; %/ha are assessment totals, not a full pixel mesh.
      </p>
    </div>
  );
}
