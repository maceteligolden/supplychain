import { createAppError } from "@/lib/errors";
import {
  updateBatchAllocationSchema,
  type UpdateBatchAllocationSchemaInput,
} from "@/lib/validation/schemas/batch-allocation.schema";
import { validate } from "@/lib/validation";
import {
  deleteBatchAllocation,
  getBatchAllocationById,
  updateBatchAllocation,
} from "@/mocks/data/batch-allocations";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { DeleteBatchAllocationOutput } from "@/types/batch-allocation.interface";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const existing = getBatchAllocationById(id);

        if (!existing) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Batch allocation not found",
            statusCode: 404,
          });
        }

        const body: unknown = await request.json();
        const input = validate<UpdateBatchAllocationSchemaInput>({
          schema: updateBatchAllocationSchema,
          data: body,
          label: "batch allocation update",
        });

        const updated = updateBatchAllocation(id, input);

        if (!updated) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Batch allocation not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: updated });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update batch allocation";
        if (error instanceof Error && message.includes("exceeds")) {
          return errorResponse({
            error: createAppError({
              code: "VALIDATION_ERROR",
              message,
              statusCode: 400,
            }),
            fallbackMessage: "Failed to update batch allocation",
          });
        }
        return errorResponse({
          error,
          fallbackMessage: "Failed to update batch allocation",
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
        const deleted = deleteBatchAllocation(id);

        if (!deleted) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Batch allocation not found",
            statusCode: 404,
          });
        }

        const output: DeleteBatchAllocationOutput = { success: true, id };
        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to delete batch allocation",
        });
      }
    },
  });
}
