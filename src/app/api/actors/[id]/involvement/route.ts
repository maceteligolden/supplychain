import { getActorInvolvement } from "@/lib/actor/build-involvement";
import { createAppError } from "@/lib/errors";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type { GetActorInvolvementOutput } from "@/types/actor-involvement.interface";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  if (!env.useMockApi) {
    try {
      const { id } = await context.params;
      return await proxyRequest({
        request,
        targetPath: `/api/v1/actors/${id}/involvement`,
      });
    } catch (error) {
      return errorResponse({
        error,
        fallbackMessage: "Failed to load actor involvement",
      });
    }
  }

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
