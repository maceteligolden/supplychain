import { maxAssessmentRiskLevel } from "@/config/supply-chain-risk";
import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";
import type { SupplyChainOverallRiskLevel } from "@/config/supply-chain-risk";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type {
  SupplyChainFarmRiskEntryInterface,
  SupplyChainRiskSummaryInterface,
} from "@/types/supply-chain-risk.interface";

export type BuildSupplyChainRiskSummaryInput = {
  supplyChainId: string;
  allocations: BatchAllocationInterface[];
  batches: BatchInterface[];
  farms: FarmInterface[];
  latestAssessmentByFarmId: Map<string, FarmAssessmentInterface | undefined>;
};

function buildFarmRiskEntries(
  input: BuildSupplyChainRiskSummaryInput,
): SupplyChainFarmRiskEntryInterface[] {
  const chainAllocations = input.allocations.filter(
    (item) => item.supplyChainId === input.supplyChainId,
  );

  const quantityByFarmId = new Map<string, { quantity: number; unit?: string }>();

  for (const allocation of chainAllocations) {
    const batch = input.batches.find((item) => item.id === allocation.batchId);
    if (!batch) {
      continue;
    }

    const existing = quantityByFarmId.get(batch.farmId);
    quantityByFarmId.set(batch.farmId, {
      quantity: (existing?.quantity ?? 0) + allocation.quantity,
      unit: batch.unit,
    });
  }

  return Array.from(quantityByFarmId.entries())
    .map(([farmId, totals]) => {
      const farm = input.farms.find((item) => item.id === farmId);
      const assessment = input.latestAssessmentByFarmId.get(farmId);

      return {
        farmId,
        farmName: farm?.name ?? "Unknown farm",
        riskLevel: assessment?.riskLevel ?? null,
        latestAssessedAt: assessment?.assessedAt,
        analysis: assessment?.analysis ?? null,
        allocatedQuantity: totals.quantity,
        unit: totals.unit,
      };
    })
    .sort((a, b) => a.farmName.localeCompare(b.farmName));
}

function deriveOverallRiskLevel(input: {
  farmRisks: SupplyChainFarmRiskEntryInterface[];
}): SupplyChainOverallRiskLevel {
  if (input.farmRisks.length === 0) {
    return "NO_FARMS";
  }

  const assessedLevels = input.farmRisks
    .map((entry) => entry.riskLevel)
    .filter((level): level is AssessmentRiskLevel => level !== null);

  if (assessedLevels.length === 0) {
    return "UNASSESSED";
  }

  return maxAssessmentRiskLevel(assessedLevels) ?? "UNASSESSED";
}

/** Builds deforestation risk summary for a supply chain from allocations and farm assessments. */
export function buildSupplyChainRiskSummary(
  input: BuildSupplyChainRiskSummaryInput,
): SupplyChainRiskSummaryInterface {
  const farmRisks = buildFarmRiskEntries(input);
  const assessedFarmsCount = farmRisks.filter(
    (entry) => entry.riskLevel !== null,
  ).length;
  const unassessedFarmsCount = farmRisks.length - assessedFarmsCount;

  return {
    supplyChainId: input.supplyChainId,
    overallRiskLevel: deriveOverallRiskLevel({ farmRisks }),
    linkedFarmsCount: farmRisks.length,
    assessedFarmsCount,
    unassessedFarmsCount,
    hasPartialAssessment: assessedFarmsCount > 0 && unassessedFarmsCount > 0,
    farmRisks,
  };
}
