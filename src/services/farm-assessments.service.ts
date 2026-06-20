import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import { getAuthHeaders } from "@/services/auth-headers";
import type {
  FarmAssessmentInterface,
  FarmAssessmentStatus,
  GetFarmAssessmentOutput,
  GetFarmAssessmentsOutput,
  RunFarmAssessmentOutput,
} from "@/types/farm-assessment.interface";
import type { GetFarmAssessmentMapContextOutput } from "@/types/farm-map-context.interface";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

const TERMINAL_STATUSES: FarmAssessmentStatus[] = ["COMPLETE", "FAILED"];

function isPendingStatus(status: FarmAssessmentStatus | undefined): boolean {
  return status === "PENDING" || status === "RUNNING";
}

/** Returns all assessments for a farm, newest first. */
export async function getFarmAssessments(
  farmId: string,
): Promise<GetFarmAssessmentsOutput> {
  return fetchJson<GetFarmAssessmentsOutput>({
    url: API_ROUTES.farms.assessments(farmId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Returns a single assessment by id. */
export async function getFarmAssessmentById(
  farmId: string,
  assessmentId: string,
): Promise<GetFarmAssessmentOutput> {
  return fetchJson<GetFarmAssessmentOutput>({
    url: API_ROUTES.farms.assessmentDetail(farmId, assessmentId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Returns map overlay context for a completed assessment. */
export async function getFarmAssessmentMapContext(
  farmId: string,
  assessmentId: string,
): Promise<GetFarmAssessmentMapContextOutput> {
  return fetchJson<GetFarmAssessmentMapContextOutput>({
    url: API_ROUTES.farms.assessmentMapContext(farmId, assessmentId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Polls until assessment reaches COMPLETE or FAILED. */
export async function pollAssessmentUntilComplete(
  farmId: string,
  assessmentId: string,
): Promise<FarmAssessmentInterface> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const assessment = await getFarmAssessmentById(farmId, assessmentId);

    if (!assessment.status || TERMINAL_STATUSES.includes(assessment.status)) {
      return assessment;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  return getFarmAssessmentById(farmId, assessmentId);
}

/** Runs a deforestation assessment; polls when the backend accepts async processing. */
export async function runFarmAssessment(
  farmId: string,
): Promise<RunFarmAssessmentOutput> {
  const assessment = await fetchJson<RunFarmAssessmentOutput>({
    url: API_ROUTES.farms.assessments(farmId),
    options: {
      method: "POST",
      headers: await getAuthHeaders(),
    },
  });

  if (isPendingStatus(assessment.status)) {
    return pollAssessmentUntilComplete(farmId, assessment.id);
  }

  return assessment;
}
