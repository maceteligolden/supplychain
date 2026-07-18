import {
  createActorSchema,
  type CreateActorSchemaInput,
} from "@/lib/validation/schemas/actor.schema";
import { validate } from "@/lib/validation";
import { createActor, getAllActors } from "@/mocks/data/actors";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type { GetActorOutput, GetActorsOutput } from "@/types/actor.interface";

export async function GET(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/actors" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to list actors" });
    }
  }

  return withMockDelay({
    handler: (): Response => {
      const items = getAllActors();
      const output: GetActorsOutput = {
        actors: items,
        total: items.length,
      };
      return jsonResponse({ data: output });
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/actors" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to create actor" });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const body: unknown = await request.json();
        const input = validate<CreateActorSchemaInput>({
          schema: createActorSchema,
          data: body,
          label: "actor",
        });

        const actor = createActor({
          name: input.name,
          type: input.type as GetActorOutput["type"],
          address: {
            line1: input.address.line1 || undefined,
            city: input.address.city,
            region: input.address.region,
            country: input.address.country,
          },
          status: input.status as GetActorOutput["status"],
        });

        return jsonResponse({ data: actor, status: 201 });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to create actor" });
      }
    },
  });
}
