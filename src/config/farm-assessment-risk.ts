export const ASSESSMENT_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;

export type AssessmentRiskLevel = (typeof ASSESSMENT_RISK_LEVELS)[number];

export const ASSESSMENT_RISK_LABELS: Record<AssessmentRiskLevel, string> = {
  LOW: "Low risk",
  MEDIUM: "Medium risk",
  HIGH: "High risk",
};

/** Badge variant hint for assessment risk display. */
export const ASSESSMENT_RISK_BADGE_VARIANT: Record<
  AssessmentRiskLevel,
  "secondary" | "outline" | "destructive"
> = {
  LOW: "secondary",
  MEDIUM: "outline",
  HIGH: "destructive",
};
