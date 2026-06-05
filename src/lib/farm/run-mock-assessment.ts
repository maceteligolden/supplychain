import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";
import type { FarmBoundaryInterface } from "@/types/farm-boundary.interface";
import type {
  FarmAssessmentAnalysisInterface,
  FarmAssessmentInterface,
} from "@/types/farm-assessment.interface";
import type { FarmInterface } from "@/types/farm.interface";

function hashFarmId(farmId: string): number {
  let hash = 0;
  for (let index = 0; index < farmId.length; index += 1) {
    hash = (hash * 31 + farmId.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function centroidLatitude(boundary: FarmBoundaryInterface): number {
  const total = boundary.coordinates.reduce((sum, coord) => sum + coord.latitude, 0);
  return total / boundary.coordinates.length;
}

function deriveRiskLevel(
  analysis: FarmAssessmentAnalysisInterface,
): AssessmentRiskLevel {
  if (
    analysis.protectedAreaOverlapPercent >= 15 ||
    analysis.deforestationPercent >= 35
  ) {
    return "HIGH";
  }

  if (
    analysis.protectedAreaDetected ||
    analysis.deforestationPercent >= 12 ||
    analysis.protectedAreaOverlapPercent >= 5
  ) {
    return "MEDIUM";
  }

  return "LOW";
}

function buildMockAnalysis(
  farm: FarmInterface,
  boundary: FarmBoundaryInterface,
): FarmAssessmentAnalysisInterface {
  const hash = hashFarmId(farm.id);
  const lat = centroidLatitude(boundary);

  const deforestationBase = (hash % 40) + (farm.code.length % 10);
  const deforestationPercent = Math.min(
    55,
    Math.round((deforestationBase % 28) + (lat > 10 ? 4 : 0)),
  );
  const forestCoverPercent = Math.max(0, 100 - deforestationPercent);

  const protectedAreaOverlapPercent = Math.min(
    40,
    Math.round(((hash >> 3) % 20) + (lat > 6 && lat < 7 ? 8 : 0)),
  );
  const protectedAreaDetected = protectedAreaOverlapPercent >= 3;

  return {
    deforestationPercent,
    forestCoverPercent,
    protectedAreaOverlapPercent,
    protectedAreaDetected,
  };
}

/** Runs a deterministic mock deforestation + protected-area assessment. */
export function runMockFarmAssessment(input: {
  farm: FarmInterface;
  boundary: FarmBoundaryInterface;
  assessmentId: string;
  assessedAt: string;
}): FarmAssessmentInterface {
  const analysis = buildMockAnalysis(input.farm, input.boundary);
  const riskLevel = deriveRiskLevel(analysis);

  return {
    id: input.assessmentId,
    farmId: input.farm.id,
    riskLevel,
    analysis,
    assessedAt: input.assessedAt,
    boundaryAreaHectares: input.boundary.areaHectares,
    createdAt: input.assessedAt,
  };
}
