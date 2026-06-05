import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";

export type { AssessmentRiskLevel };

export interface FarmAssessmentAnalysisInterface {
  /** Estimated forest loss within boundary (%). */
  deforestationPercent: number;
  /** Remaining forest cover within boundary (%). */
  forestCoverPercent: number;
  /** Overlap with mock protected areas (%). */
  protectedAreaOverlapPercent: number;
  /** Whether any protected-area overlap was detected. */
  protectedAreaDetected: boolean;
}

export interface FarmAssessmentInterface {
  /** Unique assessment identifier. */
  id: string;
  /** Farm assessed. */
  farmId: string;
  /** Overall deforestation risk level. */
  riskLevel: AssessmentRiskLevel;
  /** Mock analysis metrics. */
  analysis: FarmAssessmentAnalysisInterface;
  /** ISO timestamp when the assessment was run. */
  assessedAt: string;
  /** Boundary area at time of assessment (hectares). */
  boundaryAreaHectares: number;
  /** ISO timestamp when the record was created. */
  createdAt: string;
}

export type GetFarmAssessmentsOutput = {
  assessments: FarmAssessmentInterface[];
  total: number;
};

export type GetFarmAssessmentOutput = FarmAssessmentInterface;

export type RunFarmAssessmentOutput = FarmAssessmentInterface;
