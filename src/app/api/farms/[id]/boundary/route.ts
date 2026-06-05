import { createAppError } from "@/lib/errors";
import { validate } from "@/lib/validation";
import {
  upsertFarmBoundarySchema,
  type UpsertFarmBoundarySchemaInput,
} from "@/lib/validation/schemas/farm-boundary.schema";
import {
  deleteFarmBoundary,
  getFarmBoundaryByFarmId,
  upsertFarmBoundary,
} from "@/mocks/data/farm-boundaries";
import { getFarmById } from "@/mocks/data/farms";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type {
  DeleteFarmBoundaryOutput,
  GetFarmBoundaryOutput,
} from "@/types/farm-boundary.interface";

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

        const boundary = getFarmBoundaryByFarmId(id) ?? null;
        const output: GetFarmBoundaryOutput = { boundary };

        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to get farm boundary" });
      }
    },
  });
}

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
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

        const body: unknown = await request.json();
        const input = validate<UpsertFarmBoundarySchemaInput>({
          schema: upsertFarmBoundarySchema,
          data: body,
          label: "farm boundary",
        });

        const boundary = upsertFarmBoundary(id, input.coordinates);

        return jsonResponse({ data: boundary });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to save farm boundary",
        });
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
        const farm = getFarmById(id);

        if (!farm) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Farm not found",
            statusCode: 404,
          });
        }

        const removed = deleteFarmBoundary(id);

        if (!removed) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Farm boundary not found",
            statusCode: 404,
          });
        }

        const output: DeleteFarmBoundaryOutput = {
          success: true,
          farmId: id,
        };

        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to delete farm boundary",
        });
      }
    },
  });
}
