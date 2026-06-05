import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";
import {
  ASSESSMENT_RISK_BADGE_VARIANT,
  ASSESSMENT_RISK_LABELS,
} from "@/config/farm-assessment-risk";

export type SupplyChainOverallRiskLevel =
  | AssessmentRiskLevel
  | "UNASSESSED"
  | "NO_FARMS";

export const SUPPLY_CHAIN_OVERALL_RISK_LABELS: Record<
  SupplyChainOverallRiskLevel,
  string
> = {
  LOW: ASSESSMENT_RISK_LABELS.LOW,
  MEDIUM: ASSESSMENT_RISK_LABELS.MEDIUM,
  HIGH: ASSESSMENT_RISK_LABELS.HIGH,
  UNASSESSED: "Unassessed",
  NO_FARMS: "No farms linked",
};

export const SUPPLY_CHAIN_OVERALL_RISK_BADGE_VARIANT: Record<
  SupplyChainOverallRiskLevel,
  "secondary" | "outline" | "destructive"
> = {
  LOW: ASSESSMENT_RISK_BADGE_VARIANT.LOW,
  MEDIUM: ASSESSMENT_RISK_BADGE_VARIANT.MEDIUM,
  HIGH: ASSESSMENT_RISK_BADGE_VARIANT.HIGH,
  UNASSESSED: "outline",
  NO_FARMS: "outline",
};

const RISK_ORDER: Record<AssessmentRiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

/** Returns the higher-severity assessment risk level. */
export function maxAssessmentRiskLevel(
  levels: AssessmentRiskLevel[],
): AssessmentRiskLevel | null {
  if (levels.length === 0) {
    return null;
  }

  return levels.reduce((current, level) =>
    RISK_ORDER[level] > RISK_ORDER[current] ? level : current,
  );
}
