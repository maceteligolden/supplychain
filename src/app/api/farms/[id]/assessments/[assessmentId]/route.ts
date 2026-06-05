import { createAppError } from "@/lib/errors";
import { getFarmAssessmentById } from "@/mocks/data/farm-assessments";
import { getFarmById } from "@/mocks/data/farms";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";

type RouteContext = {
  params: Promise<{ id: string; assessmentId: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
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

        if (!assessment) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Assessment not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: assessment });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to get farm assessment",
        });
      }
    },
  });
}
