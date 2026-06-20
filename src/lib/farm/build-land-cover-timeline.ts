import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";
import type { FarmLandCoverTimelinePointInterface } from "@/types/farm-land-cover.interface";

const BASELINE_YEARS = [2020, 2021, 2022, 2023, 2024] as const;

function hashFarmId(farmId: string): number {
  let hash = 0;
  for (let index = 0; index < farmId.length; index += 1) {
    hash = (hash * 31 + farmId.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function buildMockBaselinePoints(
  farmId: string,
): FarmLandCoverTimelinePointInterface[] {
  const hash = hashFarmId(farmId);
  const startForestCover = 72 + (hash % 18);

  return BASELINE_YEARS.map((year, index) => {
    const forestCoverPercent = Math.max(
      35,
      startForestCover - index * (2 + (hash % 3)),
    );
    const deforestationPercent = 100 - forestCoverPercent;

    return {
      observedAt: `${year}-01-01T00:00:00.000Z`,
      forestCoverPercent,
      deforestationPercent,
      source: "BASELINE",
    };
  });
}

/** Builds a merged land-cover timeline from mock baselines and assessment runs. */
export function buildLandCoverTimeline(input: {
  farmId: string;
  assessments: FarmAssessmentInterface[];
}): FarmLandCoverTimelinePointInterface[] {
  const baseline = buildMockBaselinePoints(input.farmId);

  const assessmentPoints: FarmLandCoverTimelinePointInterface[] = input.assessments
    .filter(
      (assessment) =>
        assessment.assessedAt !== null &&
        assessment.analysis !== null &&
        assessment.status !== "PENDING" &&
        assessment.status !== "RUNNING",
    )
    .map((assessment) => ({
      observedAt: assessment.assessedAt as string,
      forestCoverPercent: assessment.analysis!.forestCoverPercent,
      deforestationPercent: assessment.analysis!.deforestationPercent,
      source: "ASSESSMENT" as const,
      assessmentId: assessment.id,
    }))
    .sort(
      (a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime(),
    );

  const merged = [...baseline, ...assessmentPoints].sort(
    (a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime(),
  );

  return merged;
}
