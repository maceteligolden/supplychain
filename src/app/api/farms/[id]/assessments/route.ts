import { createAppError } from "@/lib/errors";
import {
  getFarmAssessmentsByFarmId,
  runFarmAssessment,
} from "@/mocks/data/farm-assessments";
import { getFarmBoundaryByFarmId } from "@/mocks/data/farm-boundaries";
import { getFarmById } from "@/mocks/data/farms";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { GetFarmAssessmentsOutput } from "@/types/farm-assessment.interface";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const farm = getFarmById(id);

        if (!farm) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Farm not found",
            statusCode: 404,
          });
        }

        const items = getFarmAssessmentsByFarmId(id);
        const output: GetFarmAssessmentsOutput = {
          assessments: items,
          total: items.length,
        };

        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to list farm assessments",
        });
      }
    },
  });
}

export async function POST(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const farm = getFarmById(id);

        if (!farm) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Farm not found",
            statusCode: 404,
          });
        }

        if (!getFarmBoundaryByFarmId(id)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Farm boundary is required before running an assessment",
            statusCode: 400,
            details: {
              issues: [
                {
                  path: "boundary",
                  message: "Draw and save a farm boundary first",
                },
              ],
            },
          });
        }

        const assessment = runFarmAssessment(id);

        return jsonResponse({ data: assessment, status: 201 });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to run farm assessment",
        });
      }
    },
  });
}
