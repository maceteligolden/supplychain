import { createAppError } from "@/lib/errors";
import {
  createActorSchema,
  type CreateActorSchemaInput,
} from "@/lib/validation/schemas/actor.schema";
import { validate } from "@/lib/validation";
import { createActor, getAllActors, isActorCodeTaken } from "@/mocks/data/actors";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { GetActorOutput, GetActorsOutput } from "@/types/actor.interface";

export async function GET(): Promise<Response> {
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
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const body: unknown = await request.json();
        const input = validate<CreateActorSchemaInput>({
          schema: createActorSchema,
          data: body,
          label: "actor",
        });

        if (isActorCodeTaken(input.code)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Actor code already exists",
            statusCode: 400,
            details: { issues: [{ path: "code", message: "Code must be unique" }] },
          });
        }

        const actor = createActor({
          name: input.name,
          code: input.code,
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
