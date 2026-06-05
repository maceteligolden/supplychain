import { env } from "@/config/env";
import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import type {
  GetFarmAssessmentOutput,
  GetFarmAssessmentsOutput,
  RunFarmAssessmentOutput,
} from "@/types/farm-assessment.interface";

async function getServerCookieHeader(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") {
    return {};
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const session = cookieStore.get(env.sessionCookieName);

  if (!session) {
    return {};
  }

  return { Cookie: `${env.sessionCookieName}=${session.value}` };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  return getServerCookieHeader();
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
