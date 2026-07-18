"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { FarmAssessmentHistoryTable } from "@/components/farms/farm-assessment-history-table";
import { FarmAssessmentProvenance } from "@/components/farms/farm-assessment-provenance";
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
import { METRIC_VALUE_CLASSES } from "@/lib/farm/map-theme";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { runFarmAssessment } from "@/services/farm-assessments.service";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";
import type { FarmBoundaryInterface } from "@/types/farm-boundary.interface";
import type { FarmLandCoverTimelinePointInterface } from "@/types/farm-land-cover.interface";
import type { FarmInterface } from "@/types/farm.interface";

export interface FarmDeforestationTabProps {
  farm: FarmInterface;
  boundary: FarmBoundaryInterface | null;
  assessments: FarmAssessmentInterface[];
  landCoverTimeline: FarmLandCoverTimelinePointInterface[];
}

function formatDateTime(iso: string | null): string {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isAssessmentComplete(
  assessment: FarmAssessmentInterface,
): assessment is FarmAssessmentInterface & {
  riskLevel: NonNullable<FarmAssessmentInterface["riskLevel"]>;
  analysis: NonNullable<FarmAssessmentInterface["analysis"]>;
  assessedAt: string;
  boundaryAreaHectares: number;
} {
  return (
    assessment.status !== "PENDING" &&
    assessment.status !== "RUNNING" &&
    assessment.status !== "FAILED" &&
    assessment.riskLevel !== null &&
    assessment.analysis !== null &&
    assessment.assessedAt !== null &&
    assessment.boundaryAreaHectares !== null
  );
}

/** Deforestation tab: unified map, assessment metrics, timeline, and history. */
export function FarmDeforestationTab({
  farm,
  boundary,
  assessments,
  landCoverTimeline,
}: FarmDeforestationTabProps): React.JSX.Element {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | undefined>(
    assessments.find(isAssessmentComplete)?.id ?? assessments[0]?.id,
  );

  const lastGoodAssessment = useMemo(
    () => assessments.find(isAssessmentComplete) ?? null,
    [assessments],
  );

  const selectedAssessment = useMemo(
    () =>
      assessments.find((item) => item.id === selectedAssessmentId) ?? assessments[0],
    [assessments, selectedAssessmentId],
  );

  const canRun = boundary !== null;
  const selectedComplete =
    selectedAssessment && isAssessmentComplete(selectedAssessment)
      ? selectedAssessment
      : lastGoodAssessment;

  async function handleRunAssessment(): Promise<void> {
    if (!canRun) {
      showErrorToast("Save a farm boundary before running an assessment.");
      return;
    }

    const previousGoodId = lastGoodAssessment?.id;
    setIsRunning(true);

    try {
      const assessment = await runFarmAssessment(farm.id);

      if (assessment.status === "FAILED") {
        showErrorToast(
          assessment.errorMessage ??
            "Assessment failed after retries. Showing the last successful result.",
        );
        if (previousGoodId) {
          setSelectedAssessmentId(previousGoodId);
        }
      } else {
        setSelectedAssessmentId(assessment.id);
        showSuccessToast("Deforestation assessment completed.");
      }

      router.refresh();
    } catch (err) {
      if (previousGoodId) {
        setSelectedAssessmentId(previousGoodId);
      }
      if (isAppError(err)) {
        showErrorToast(
          `${err.message} Showing the last successful assessment when available.`,
        );
      } else {
        showErrorToast(
          "Failed to run assessment after retries. Showing the last successful result when available.",
        );
      }
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="gap-section flex flex-col">
      <FarmBoundarySection
        farm={farm}
        boundary={boundary}
        selectedAssessmentId={selectedComplete?.id ?? null}
        selectedRiskLevel={selectedComplete?.riskLevel ?? null}
        showAssessmentLayers={selectedComplete !== null}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              Deforestation assessment
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Run WHISP and GFW analysis against the saved boundary. Results appear on
              the map above and in the chart below. Supports due diligence — not a legal
              EUDR certificate.
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
          <p className="text-muted-foreground bg-accent/40 rounded-lg px-3 py-2 text-xs">
            Open the full-screen map, locate the farm in Nigeria, and save a boundary
            before running an assessment.
          </p>
        ) : null}

        {isRunning ? (
          <p className="text-muted-foreground text-xs">
            Assessment in progress — retries up to 3 times. External providers may take
            up to a minute.
          </p>
        ) : null}

        {selectedAssessment &&
        !isAssessmentComplete(selectedAssessment) &&
        !selectedComplete ? (
          <Card className="border-border/80 bg-surface-secondary/30">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">
                {selectedAssessment.status === "FAILED"
                  ? (selectedAssessment.errorMessage ?? "Assessment failed.")
                  : "Assessment pending — results will appear when processing completes."}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {selectedComplete ? (
          <Card className="border-border/80 bg-surface-secondary/30 shadow-sm">
            <CardContent className="gap-card flex flex-col pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground text-sm font-medium">
                  {selectedComplete.id === lastGoodAssessment?.id
                    ? "Latest result"
                    : "Selected assessment"}
                </span>
                <Badge
                  variant={ASSESSMENT_RISK_BADGE_VARIANT[selectedComplete.riskLevel]}
                >
                  {ASSESSMENT_RISK_LABELS[selectedComplete.riskLevel]}
                </Badge>
                <FarmAssessmentProvenance source={selectedComplete.source} />
                <span className="text-muted-foreground text-xs">
                  {formatDateTime(selectedComplete.assessedAt)}
                </span>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-background/60 flex flex-col gap-1 rounded-lg border p-3">
                  <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Deforestation
                  </dt>
                  <dd
                    className={`text-lg font-semibold tabular-nums ${METRIC_VALUE_CLASSES.deforestation}`}
                  >
                    {selectedComplete.analysis.deforestationPercent}%
                  </dd>
                </div>
                <div className="bg-background/60 flex flex-col gap-1 rounded-lg border p-3">
                  <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Afforestation
                  </dt>
                  <dd
                    className={`text-lg font-semibold tabular-nums ${METRIC_VALUE_CLASSES.afforestation}`}
                  >
                    {selectedComplete.analysis.afforestationPercent}%
                  </dd>
                </div>
                <div className="bg-background/60 flex flex-col gap-1 rounded-lg border p-3">
                  <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Stable cover
                  </dt>
                  <dd
                    className={`text-lg font-semibold tabular-nums ${METRIC_VALUE_CLASSES.stability}`}
                  >
                    {selectedComplete.analysis.stabilityPercent}%
                  </dd>
                </div>
                <div className="bg-background/60 flex flex-col gap-1 rounded-lg border p-3">
                  <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Forest cover
                  </dt>
                  <dd
                    className={`text-lg font-semibold tabular-nums ${METRIC_VALUE_CLASSES.forestCover}`}
                  >
                    {selectedComplete.analysis.forestCoverPercent}%
                  </dd>
                </div>
                {selectedComplete.analysis.whispRiskPcrop &&
                selectedComplete.source !== "FALLBACK" ? (
                  <div className="bg-background/60 flex flex-col gap-1 rounded-lg border p-3">
                    <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      WHISP cocoa risk
                    </dt>
                    <dd
                      className={`text-lg font-semibold tabular-nums ${METRIC_VALUE_CLASSES.whisp}`}
                    >
                      {selectedComplete.analysis.whispRiskPcrop}
                    </dd>
                  </div>
                ) : null}
                <div className="bg-background/60 flex flex-col gap-1 rounded-lg border p-3">
                  <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Boundary area
                  </dt>
                  <dd className="text-foreground text-lg font-semibold tabular-nums">
                    {selectedComplete.boundaryAreaHectares.toLocaleString()} ha
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ) : null}
      </section>

      <FarmLandCoverTimelineChart
        points={landCoverTimeline}
        selectedAssessmentId={selectedComplete?.id ?? selectedAssessmentId}
      />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            Assessment history
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Select a row to update the map overlays and land-cover chart highlight.
          </p>
        </div>
        <FarmAssessmentHistoryTable
          assessments={assessments}
          selectedAssessmentId={selectedComplete?.id ?? selectedAssessmentId}
          onSelectAssessment={setSelectedAssessmentId}
        />
      </section>
    </div>
  );
}
