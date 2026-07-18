"use client";

import { Badge } from "@/components/ui/badge";
import type { FarmAssessmentSource } from "@/types/farm-assessment.interface";

export interface FarmAssessmentProvenanceProps {
  source?: FarmAssessmentSource | null;
}

/** Shows whether assessment metrics came from live providers or demo fallback. */
export function FarmAssessmentProvenance({
  source,
}: FarmAssessmentProvenanceProps): React.JSX.Element {
  const isLive = source === "WHISP_GFW_WDPA" || source === "GFW_WDPA";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={isLive ? "success" : "secondary"}>
        {isLive ? "Live (WHISP + GFW)" : "Demo fallback"}
      </Badge>
      {!isLive ? (
        <span className="text-muted-foreground text-xs">
          Not EUDR evidence — configure provider API keys for live analysis.
        </span>
      ) : null}
    </div>
  );
}
