import { runMockFarmAssessment } from "@/lib/farm/run-mock-assessment";
import { getFarmBoundaryByFarmId } from "@/mocks/data/farm-boundaries";
import { getFarmById, updateFarm } from "@/mocks/data/farms";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";

const ASHANTI_FARM_ID = "farm_ashanti_cocoa_001";

function buildSeedAssessments(): FarmAssessmentInterface[] {
  const farm = getFarmById(ASHANTI_FARM_ID);
  const boundary = getFarmBoundaryByFarmId(ASHANTI_FARM_ID);

  if (!farm || !boundary) {
    return [];
  }

  const latest: FarmAssessmentInterface = {
    ...runMockFarmAssessment({
      farm,
      boundary,
      assessmentId: "assessment_ashanti_seed_003",
      assessedAt: "2025-02-10T09:00:00.000Z",
    }),
    riskLevel: "MEDIUM",
    analysis: {
      deforestationPercent: 22,
      forestCoverPercent: 78,
      protectedAreaOverlapPercent: 8,
      protectedAreaDetected: true,
    },
  };

  const mid: FarmAssessmentInterface = {
    ...runMockFarmAssessment({
      farm,
      boundary,
      assessmentId: "assessment_ashanti_seed_002",
      assessedAt: "2024-11-15T14:30:00.000Z",
    }),
    riskLevel: "MEDIUM",
    analysis: {
      deforestationPercent: 18,
      forestCoverPercent: 82,
      protectedAreaOverlapPercent: 6,
      protectedAreaDetected: true,
    },
  };

  const earliest: FarmAssessmentInterface = {
    ...runMockFarmAssessment({
      farm,
      boundary,
      assessmentId: "assessment_ashanti_seed_001",
      assessedAt: "2024-08-01T10:00:00.000Z",
    }),
    riskLevel: "LOW",
    analysis: {
      deforestationPercent: 10,
      forestCoverPercent: 90,
      protectedAreaOverlapPercent: 2,
      protectedAreaDetected: false,
    },
  };

  return [latest, mid, earliest];
}

const SEED_ASSESSMENTS: FarmAssessmentInterface[] = buildSeedAssessments();

/** In-memory mutable mock store — swap for MongoDB in production. */
let assessments: FarmAssessmentInterface[] = [...SEED_ASSESSMENTS];

function generateId(): string {
  return `assessment_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function sortNewestFirst(items: FarmAssessmentInterface[]): FarmAssessmentInterface[] {
  return [...items].sort(
    (a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime(),
  );
}

export function getFarmAssessmentsByFarmId(farmId: string): FarmAssessmentInterface[] {
  return sortNewestFirst(assessments.filter((item) => item.farmId === farmId));
}

export function getFarmAssessmentById(
  farmId: string,
  assessmentId: string,
): FarmAssessmentInterface | undefined {
  return assessments.find((item) => item.farmId === farmId && item.id === assessmentId);
}

export function getLatestFarmAssessment(
  farmId: string,
): FarmAssessmentInterface | undefined {
  return getFarmAssessmentsByFarmId(farmId)[0];
}

export function runFarmAssessment(farmId: string): FarmAssessmentInterface {
  const farm = getFarmById(farmId);
  if (!farm) {
    throw new Error("Farm not found");
  }

  const boundary = getFarmBoundaryByFarmId(farmId);
  if (!boundary) {
    throw new Error("Farm boundary is required before running an assessment");
  }

  const assessedAt = new Date().toISOString();
  const assessment = runMockFarmAssessment({
    farm,
    boundary,
    assessmentId: generateId(),
    assessedAt,
  });

  assessments = [assessment, ...assessments];

  if (
    farm.status === "DRAFT" ||
    farm.status === "MAPPED" ||
    farm.status === "READY_FOR_ASSESSMENT"
  ) {
    updateFarm(farmId, { status: "ASSESSED" });
  }

  return assessment;
}

/** Reset store to seed data — useful for tests only. */
export function resetFarmAssessmentsMockStore(): void {
  assessments = [...SEED_ASSESSMENTS];
}
