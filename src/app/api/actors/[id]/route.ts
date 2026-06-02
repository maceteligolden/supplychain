import { createAppError } from "@/lib/errors";
import {
  updateActorSchema,
  type UpdateActorSchemaInput,
} from "@/lib/validation/schemas/actor.schema";
import { validate } from "@/lib/validation";
import { isActorReferencedByEvent } from "@/mocks/data/supply-chain-events";
import {
  deleteActor,
  getActorById,
  isActorCodeTaken,
  updateActor,
} from "@/mocks/data/actors";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { DeleteActorOutput, GetActorOutput } from "@/types/actor.interface";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const actor = getActorById(id);

        if (!actor) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Actor not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: actor });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to get actor" });
      }
    },
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const existing = getActorById(id);

        if (!existing) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Actor not found",
            statusCode: 404,
          });
        }

        const body: unknown = await request.json();
        const input = validate<UpdateActorSchemaInput>({
          schema: updateActorSchema,
          data: body,
          label: "actor update",
        });

        if (input.code && isActorCodeTaken(input.code, id)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Actor code already exists",
            statusCode: 400,
            details: { issues: [{ path: "code", message: "Code must be unique" }] },
          });
        }

        const updated = updateActor(id, {
          name: input.name,
          code: input.code,
          type: input.type as GetActorOutput["type"] | undefined,
          address: input.address
            ? {
                line1: input.address.line1,
                city: input.address.city,
                region: input.address.region,
                country: input.address.country,
              }
            : undefined,
          status: input.status as GetActorOutput["status"] | undefined,
        });

        if (!updated) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Actor not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: updated });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to update actor" });
      }
    },
  });
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;

        if (isActorReferencedByEvent(id)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Cannot delete actor referenced by supply chain events",
            statusCode: 400,
          });
        }

        const deleted = deleteActor(id);

        if (!deleted) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Actor not found",
            statusCode: 404,
          });
        }

        const output: DeleteActorOutput = { success: true, id };
        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to delete actor" });
      }
    },
  });
}
