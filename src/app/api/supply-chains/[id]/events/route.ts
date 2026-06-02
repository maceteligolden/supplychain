import { createAppError } from "@/lib/errors";
import {
  createSupplyChainEventSchema,
  type CreateSupplyChainEventSchemaInput,
} from "@/lib/validation/schemas/supply-chain-event.schema";
import { validate } from "@/lib/validation";
import {
  createSupplyChainEvent,
  getSupplyChainEventsByChainId,
} from "@/mocks/data/supply-chain-events";
import { getSupplyChainById } from "@/mocks/data/supply-chains";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { GetSupplyChainEventsOutput } from "@/types/supply-chain-event.interface";
import type { SupplyChainEventType } from "@/config/supply-chain-event-types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const supplyChain = getSupplyChainById(id);

        if (!supplyChain) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Supply chain not found",
            statusCode: 404,
          });
        }

        const items = getSupplyChainEventsByChainId(id);
        const output: GetSupplyChainEventsOutput = {
          events: items,
          total: items.length,
        };

        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to list supply chain events",
        });
      }
    },
  });
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const supplyChain = getSupplyChainById(id);

        if (!supplyChain) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Supply chain not found",
            statusCode: 404,
          });
        }

        const body: unknown = await request.json();
        const input = validate<CreateSupplyChainEventSchemaInput>({
          schema: createSupplyChainEventSchema,
          data: body,
          label: "supply chain event",
        });

        const event = createSupplyChainEvent(id, {
          type: input.type as SupplyChainEventType,
          occurredAt: input.occurredAt,
          actorId: input.actorId,
          notes: input.notes || undefined,
        });

        return jsonResponse({ data: event, status: 201 });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create supply chain event";
        return errorResponse({
          error: createAppError({
            code: "VALIDATION_ERROR",
            message,
            statusCode: 400,
          }),
          fallbackMessage: "Failed to create supply chain event",
        });
      }
    },
  });
}
