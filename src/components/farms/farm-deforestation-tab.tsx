"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { FarmAssessmentHistoryTable } from "@/components/farms/farm-assessment-history-table";
import { FarmBoundarySection } from "@/components/farms/farm-boundary-section";
import { FarmLandCoverTimelineChart } from "@/components/farms/farm-land-cover-timeline-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ASSESSMENT_RISK_BADGE_VARIANT,
  ASSESSMENT_RISK_LABELS,
} from "@/config/farm-assessment-risk";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { runFarmAssessment } from "@/services/farm-assessments.service";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";
import type { FarmBoundaryInterface } from "@/types/farm-boundary.interface";
import type { FarmLandCoverTimelinePointInterface } from "@/types/farm-land-cover.interface";
import type { FarmInterface } from "@/types/farm.interface";

export interface FarmDeforestationTabProps {
  /** Farm being assessed. */
  farm: FarmInterface;
  /** Existing boundary, if mapped. */
  boundary: FarmBoundaryInterface | null;
  /** Assessments for this farm, newest first. */
  assessments: FarmAssessmentInterface[];
  /** Land-cover timeline points. */
  landCoverTimeline: FarmLandCoverTimelinePointInterface[];
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * FarmDeforestationTab
 *
 * Deforestation tab: boundary map, run assessment, land-cover chart, and history.
 */
export function FarmDeforestationTab({
  farm,
  boundary,
  assessments,
  landCoverTimeline,
}: FarmDeforestationTabProps): React.JSX.Element {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | undefined>(
    assessments[0]?.id,
  );

  const selectedAssessment = useMemo(
    () =>
      assessments.find((item) => item.id === selectedAssessmentId) ?? assessments[0],
    [assessments, selectedAssessmentId],
  );

  const canRun = boundary !== null;

  async function handleRunAssessment(): Promise<void> {
    if (!canRun) {
      showErrorToast("Draw and save a farm boundary before running an assessment.");
      return;
    }

    setIsRunning(true);

    try {
      const assessment = await runFarmAssessment(farm.id);
      setSelectedAssessmentId(assessment.id);
      showSuccessToast("Deforestation assessment completed.");
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to run assessment. Please try again.");
      }
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="gap-section flex flex-col">
      <FarmBoundarySection farm={farm} boundary={boundary} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              Deforestation assessment
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Run mock satellite analysis and review historical results.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!canRun || isRunning}
            onClick={(): void => void handleRunAssessment()}
          >
            {isRunning ? "Running…" : "Run assessment"}
          </Button>
        </div>

        {!canRun ? (
          <p className="text-muted-foreground text-xs">
            Map the farm boundary first — assessments require a saved polygon.
          </p>
        ) : null}

        {selectedAssessment ? (
          <Card>
            <CardContent className="gap-card flex flex-col pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground text-sm font-medium">
                  {selectedAssessment.id === assessments[0]?.id
                    ? "Latest result"
                    : "Selected assessment"}
                </span>
                <Badge
                  variant={ASSESSMENT_RISK_BADGE_VARIANT[selectedAssessment.riskLevel]}
                >
                  {ASSESSMENT_RISK_LABELS[selectedAssessment.riskLevel]}
                </Badge>
                {selectedAssessment.analysis.protectedAreaDetected ? (
                  <Badge variant="outline">Protected area detected</Badge>
                ) : null}
                <span className="text-muted-foreground text-xs">
                  {formatDateTime(selectedAssessment.assessedAt)}
                </span>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Deforestation
                  </dt>
                  <dd className="text-foreground text-sm font-medium tabular-nums">
                    {selectedAssessment.analysis.deforestationPercent}%
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Forest cover
                  </dt>
                  <dd className="text-foreground text-sm font-medium tabular-nums">
                    {selectedAssessment.analysis.forestCoverPercent}%
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Protected overlap
                  </dt>
                  <dd className="text-foreground text-sm font-medium tabular-nums">
                    {selectedAssessment.analysis.protectedAreaOverlapPercent}%
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Boundary area
                  </dt>
                  <dd className="text-foreground text-sm font-medium tabular-nums">
                    {selectedAssessment.boundaryAreaHectares.toLocaleString()} ha
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ) : null}
      </section>

      <FarmLandCoverTimelineChart
        points={landCoverTimeline}
        selectedAssessmentId={selectedAssessmentId}
      />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            Assessment history
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Select a row to highlight it on the land-cover chart.
          </p>
        </div>
        <FarmAssessmentHistoryTable
          assessments={assessments}
          selectedAssessmentId={selectedAssessmentId}
          onSelectAssessment={setSelectedAssessmentId}
        />
      </section>
    </div>
  );
}
