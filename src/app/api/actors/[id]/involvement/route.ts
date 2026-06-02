import { getActorInvolvement } from "@/lib/actor/build-involvement";
import { createAppError } from "@/lib/errors";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { GetActorInvolvementOutput } from "@/types/actor-involvement.interface";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const involvement = getActorInvolvement(id);

        if (!involvement) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Actor not found",
            statusCode: 404,
          });
        }

        const output: GetActorInvolvementOutput = involvement;
        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to load actor involvement",
        });
      }
    },
  });
}
