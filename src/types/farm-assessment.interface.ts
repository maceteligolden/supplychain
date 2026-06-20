import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";

export type { AssessmentRiskLevel };

export interface FarmAssessmentAnalysisInterface {
  /** Estimated forest loss within boundary (%). */
  deforestationPercent: number;
  /** Estimated forest gain within boundary (%). */
  afforestationPercent: number;
  /** Stable land cover within boundary (%). */
  stabilityPercent: number;
  /** Remaining forest cover within boundary (%). */
  forestCoverPercent: number;
  /** Overlap with protected areas (%). */
  protectedAreaOverlapPercent: number;
  /** Whether any protected-area overlap was detected. */
  protectedAreaDetected: boolean;
  /** WHISP perennial crop (cocoa) EUDR risk label. */
  whispRiskPcrop?: string | null;
}

export type FarmAssessmentStatus = "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";

export interface FarmAssessmentInterface {
  /** Unique assessment identifier. */
  id: string;
  /** Farm assessed. */
  farmId: string;
  /** Overall deforestation risk level. */
  riskLevel: AssessmentRiskLevel | null;
  /** Analysis metrics when complete. */
  analysis: FarmAssessmentAnalysisInterface | null;
  /** ISO timestamp when the assessment was run. */
  assessedAt: string | null;
  /** Boundary area at time of assessment (hectares). */
  boundaryAreaHectares: number | null;
  /** Processing status for async assessments. */
  status?: FarmAssessmentStatus;
  /** Error message when status is FAILED. */
  errorMessage?: string;
  /** ISO timestamp when the record was created. */
  createdAt: string;
  /** ISO timestamp when the record was last updated. */
  updatedAt?: string;
}

export type GetFarmAssessmentsOutput = {
  assessments: FarmAssessmentInterface[];
  total: number;
};

export type GetFarmAssessmentOutput = FarmAssessmentInterface;

export type RunFarmAssessmentOutput = FarmAssessmentInterface;
