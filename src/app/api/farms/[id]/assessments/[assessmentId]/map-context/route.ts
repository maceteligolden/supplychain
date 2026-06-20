import { createAppError } from "@/lib/errors";
import { buildAssessmentMapContext } from "@/lib/farm/build-assessment-map-context";
import { getFarmAssessmentById } from "@/mocks/data/farm-assessments";
import { getFarmBoundaryByFarmId } from "@/mocks/data/farm-boundaries";
import { getFarmById } from "@/mocks/data/farms";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";

type RouteContext = {
  params: Promise<{ id: string; assessmentId: string }>;
};

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  if (!env.useMockApi) {
    try {
      const { id, assessmentId } = await context.params;
      return await proxyRequest({
        request,
        targetPath: `/api/v1/farms/${id}/assessments/${assessmentId}/map-context`,
      });
    } catch (error) {
      return errorResponse({
        error,
        fallbackMessage: "Failed to get assessment map context",
      });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id, assessmentId } = await context.params;
        const farm = getFarmById(id);

        if (!farm) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Farm not found",
            statusCode: 404,
          });
        }

        const assessment = getFarmAssessmentById(id, assessmentId);

        if (!assessment?.analysis) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Assessment not found",
            statusCode: 404,
          });
        }

        const boundary = getFarmBoundaryByFarmId(id);

        if (!boundary) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Farm boundary is required to render the assessment map",
            statusCode: 400,
          });
        }

        const mapContext = buildAssessmentMapContext({
          boundary,
          analysis: assessment.analysis,
          boundaryAreaHectares:
            assessment.boundaryAreaHectares ?? boundary.areaHectares,
        });

        return jsonResponse({ data: mapContext });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to get assessment map context",
        });
      }
    },
  });
}
