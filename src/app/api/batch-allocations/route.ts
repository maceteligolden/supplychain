import { createAppError } from "@/lib/errors";
import {
  createBatchAllocationSchema,
  type CreateBatchAllocationSchemaInput,
} from "@/lib/validation/schemas/batch-allocation.schema";
import { validate } from "@/lib/validation";
import {
  createBatchAllocation,
  getBatchAllocationsByFarmId,
  getBatchAllocationsBySupplyChainId,
} from "@/mocks/data/batch-allocations";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type { GetBatchAllocationsOutput } from "@/types/batch-allocation.interface";

export async function GET(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/batch-allocations" });
    } catch (error) {
      return errorResponse({
        error,
        fallbackMessage: "Failed to list batch allocations",
      });
    }
  }

  return withMockDelay({
    handler: (): Response => {
      const { searchParams } = new URL(request.url);
      const farmId = searchParams.get("farmId");
      const supplyChainId = searchParams.get("supplyChainId");

      if (!farmId && !supplyChainId) {
        return errorResponse({
          error: createAppError({
            code: "VALIDATION_ERROR",
            message: "farmId or supplyChainId query parameter is required",
            statusCode: 400,
          }),
          fallbackMessage: "Failed to list batch allocations",
        });
      }

      if (farmId && supplyChainId) {
        return errorResponse({
          error: createAppError({
            code: "VALIDATION_ERROR",
            message: "Provide either farmId or supplyChainId, not both",
            statusCode: 400,
          }),
          fallbackMessage: "Failed to list batch allocations",
        });
      }

      const items = farmId
        ? getBatchAllocationsByFarmId(farmId)
        : getBatchAllocationsBySupplyChainId(supplyChainId as string);
      const output: GetBatchAllocationsOutput = {
        allocations: items,
        total: items.length,
      };
      return jsonResponse({ data: output });
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/batch-allocations" });
    } catch (error) {
      return errorResponse({
        error,
        fallbackMessage: "Failed to create batch allocation",
      });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const body: unknown = await request.json();
        const input = validate<CreateBatchAllocationSchemaInput>({
          schema: createBatchAllocationSchema,
          data: body,
          label: "batch allocation",
        });

        const allocation = createBatchAllocation({
          batchId: input.batchId,
          supplyChainId: input.supplyChainId,
          quantity: input.quantity,
          allocatedAt: input.allocatedAt,
        });

        return jsonResponse({ data: allocation, status: 201 });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create batch allocation";
        return errorResponse({
          error: createAppError({
            code: "VALIDATION_ERROR",
            message,
            statusCode: 400,
          }),
          fallbackMessage: "Failed to create batch allocation",
        });
      }
    },
  });
}
