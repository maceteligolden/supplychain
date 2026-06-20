import { createAppError } from "@/lib/errors";
import {
  updateBatchSchema,
  type UpdateBatchSchemaInput,
} from "@/lib/validation/schemas/batch.schema";
import { validate } from "@/lib/validation";
import { getTotalAllocatedForBatch } from "@/mocks/data/batch-allocations";
import { deleteBatch, getBatchById, updateBatch } from "@/mocks/data/batches";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type { DeleteBatchOutput } from "@/types/batch.interface";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  if (!env.useMockApi) {
    try {
      const { id } = await context.params;
      return await proxyRequest({
        request,
        targetPath: `/api/v1/batches/${id}`,
      });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to get batch" });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const batch = getBatchById(id);

        if (!batch) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Batch not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: batch });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to get batch" });
      }
    },
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (!env.useMockApi) {
    try {
      const { id } = await context.params;
      return await proxyRequest({
        request,
        targetPath: `/api/v1/batches/${id}`,
      });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to update batch" });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const existing = getBatchById(id);

        if (!existing) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Batch not found",
            statusCode: 404,
          });
        }

        const body: unknown = await request.json();
        const input = validate<UpdateBatchSchemaInput>({
          schema: updateBatchSchema,
          data: body,
          label: "batch update",
        });

        const allocatedTotal = getTotalAllocatedForBatch(id);
        const nextQuantity = input.quantity ?? existing.quantity;

        if (nextQuantity < allocatedTotal) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Batch quantity cannot be less than allocated total",
            statusCode: 400,
          });
        }

        const updated = updateBatch(id, input, allocatedTotal);

        if (!updated) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Batch not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: updated });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to update batch" });
      }
    },
  });
}

export async function DELETE(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (!env.useMockApi) {
    try {
      const { id } = await context.params;
      return await proxyRequest({
        request,
        targetPath: `/api/v1/batches/${id}`,
      });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to delete batch" });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;

        if (getTotalAllocatedForBatch(id) > 0) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Cannot delete batch with existing allocations",
            statusCode: 400,
          });
        }

        const deleted = deleteBatch(id);

        if (!deleted) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Batch not found",
            statusCode: 404,
          });
        }

        const output: DeleteBatchOutput = { success: true, id };
        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to delete batch" });
      }
    },
  });
}
