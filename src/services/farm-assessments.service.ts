import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import { getAuthHeaders } from "@/services/auth-headers";
import type {
  GetFarmAssessmentOutput,
  GetFarmAssessmentsOutput,
  RunFarmAssessmentOutput,
} from "@/types/farm-assessment.interface";

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

/** Runs a new mock deforestation assessment for a farm. */
export async function runFarmAssessment(
  farmId: string,
): Promise<RunFarmAssessmentOutput> {
  return fetchJson<RunFarmAssessmentOutput>({
    url: API_ROUTES.farms.assessments(farmId),
    options: {
      method: "POST",
      headers: await getAuthHeaders(),
    },
  });
}
