import { createAppError } from "@/lib/errors";
import { buildLandCoverTimeline } from "@/lib/farm/build-land-cover-timeline";
import { getFarmAssessmentsByFarmId } from "@/mocks/data/farm-assessments";
import { getFarmById } from "@/mocks/data/farms";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { GetFarmLandCoverTimelineOutput } from "@/types/farm-land-cover.interface";

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

        const assessments = getFarmAssessmentsByFarmId(id);
        const points = buildLandCoverTimeline({ farmId: id, assessments });
        const output: GetFarmLandCoverTimelineOutput = { points };

        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to get land-cover timeline",
        });
      }
    },
  });
}
