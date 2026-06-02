import { createAppError } from "@/lib/errors";
import {
  updateSupplyChainEventSchema,
  type UpdateSupplyChainEventSchemaInput,
} from "@/lib/validation/schemas/supply-chain-event.schema";
import { validate } from "@/lib/validation";
import {
  getSupplyChainEventById,
  updateSupplyChainEvent,
} from "@/mocks/data/supply-chain-events";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";

type RouteContext = {
  params: Promise<{ id: string; eventId: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id, eventId } = await context.params;
        const existing = getSupplyChainEventById(eventId);

        if (!existing || existing.supplyChainId !== id) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Supply chain event not found",
            statusCode: 404,
          });
        }

        const body: unknown = await request.json();

        if (
          body !== null &&
          typeof body === "object" &&
          ("type" in body || "occurredAt" in body)
        ) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Event type and occurredAt cannot be modified",
            statusCode: 400,
          });
        }

        const input = validate<UpdateSupplyChainEventSchemaInput>({
          schema: updateSupplyChainEventSchema,
          data: body,
          label: "supply chain event update",
        });

        const updated = updateSupplyChainEvent(eventId, {
          notes: input.notes,
          actorId: input.actorId,
        });

        if (!updated) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Supply chain event not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: updated });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to update supply chain event",
        });
      }
    },
  });
}
