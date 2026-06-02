import { createAppError } from "@/lib/errors";
import {
  updateFarmSchema,
  type UpdateFarmSchemaInput,
} from "@/lib/validation/schemas/farm.schema";
import { validate } from "@/lib/validation";
import {
  deleteFarm,
  getFarmById,
  isCommodityLinked,
  isFarmCodeTaken,
  updateFarm,
} from "@/mocks/data/farms";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { DeleteFarmOutput } from "@/types/farm.interface";

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

        return jsonResponse({ data: farm });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to get farm" });
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
        const existing = getFarmById(id);

        if (!existing) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Farm not found",
            statusCode: 404,
          });
        }

        const body: unknown = await request.json();
        const input = validate<UpdateFarmSchemaInput>({
          schema: updateFarmSchema,
          data: body,
          label: "farm update",
        });

        if (input.code && isFarmCodeTaken(input.code, id)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Farm code already exists",
            statusCode: 400,
            details: { issues: [{ path: "code", message: "Code must be unique" }] },
          });
        }

        if (input.commodityId && !isCommodityLinked(input.commodityId)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Selected commodity does not exist",
            statusCode: 400,
            details: {
              issues: [{ path: "commodityId", message: "Commodity must exist" }],
            },
          });
        }

        const updated = updateFarm(id, {
          name: input.name,
          code: input.code,
          commodityId: input.commodityId,
          location: input.location,
        });

        if (!updated) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Farm not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: updated });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to update farm" });
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
        // POC: allow delete freely. Later phases may block if farm has linked batches.
        const deleted = deleteFarm(id);

        if (!deleted) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Farm not found",
            statusCode: 404,
          });
        }

        const output: DeleteFarmOutput = { success: true, id };
        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to delete farm" });
      }
    },
  });
}
