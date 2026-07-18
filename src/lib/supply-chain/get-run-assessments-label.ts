import type { SupplyChainRiskSummaryInterface } from "@/types/supply-chain-risk.interface";

/** Button label for chain-level run/rerun assessments. */
export function getRunAssessmentsLabel(
  riskSummary: SupplyChainRiskSummaryInterface,
): string {
  const { linkedFarmsCount, assessedFarmsCount, unassessedFarmsCount } = riskSummary;

  if (linkedFarmsCount === 0 || assessedFarmsCount === 0) {
    return "Run assessments";
  }
  if (unassessedFarmsCount > 0) {
    return "Run/rerun all";
  }
  return "Rerun assessments";
}
