import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";
import type { FarmAssessmentAnalysisInterface } from "@/types/farm-assessment.interface";
import type { SupplyChainOverallRiskLevel } from "@/config/supply-chain-risk";

export type { SupplyChainOverallRiskLevel };

export interface SupplyChainFarmRiskEntryInterface {
  /** Farm identifier. */
  farmId: string;
  /** Farm display name. */
  farmName: string;
  /** Latest assessment risk, or null when not assessed. */
  riskLevel: AssessmentRiskLevel | null;
  /** ISO timestamp of latest assessment. */
  latestAssessedAt?: string;
  /** Latest assessment metrics when assessed. */
  analysis?: FarmAssessmentAnalysisInterface | null;
  /** Total quantity allocated from this farm on the chain. */
  allocatedQuantity: number;
  /** Unit for allocated quantity (from batch). */
  unit?: string;
}

export interface SupplyChainRiskSummaryInterface {
  /** Supply chain identifier. */
  supplyChainId: string;
  /** Aggregated risk from linked farm assessments. */
  overallRiskLevel: SupplyChainOverallRiskLevel;
  /** Farms with batches allocated to this chain. */
  linkedFarmsCount: number;
  /** Linked farms with at least one assessment. */
  assessedFarmsCount: number;
  /** Linked farms without an assessment. */
  unassessedFarmsCount: number;
  /** True when some but not all linked farms are assessed. */
  hasPartialAssessment: boolean;
  /** Per-farm risk breakdown. */
  farmRisks: SupplyChainFarmRiskEntryInterface[];
}

export type GetSupplyChainRiskSummaryOutput = SupplyChainRiskSummaryInterface;
