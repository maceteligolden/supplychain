import { createAppError } from "@/lib/errors";
import {
  createBatchSchema,
  type CreateBatchSchemaInput,
} from "@/lib/validation/schemas/batch.schema";
import { validate } from "@/lib/validation";
import {
  createBatch,
  getBatchesByFarmId,
  isBatchNumberTaken,
} from "@/mocks/data/batches";
import { getFarmById } from "@/mocks/data/farms";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { GetBatchesOutput } from "@/types/batch.interface";

export async function GET(request: Request): Promise<Response> {
  return withMockDelay({
    handler: (): Response => {
      const { searchParams } = new URL(request.url);
      const farmId = searchParams.get("farmId");

      if (!farmId) {
        return errorResponse({
          error: createAppError({
            code: "VALIDATION_ERROR",
            message: "farmId query parameter is required",
            statusCode: 400,
          }),
          fallbackMessage: "Failed to list batches",
        });
      }

      const items = getBatchesByFarmId(farmId);
      const output: GetBatchesOutput = {
        batches: items,
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
        const input = validate<CreateBatchSchemaInput>({
          schema: createBatchSchema,
          data: body,
          label: "batch",
        });

        if (!getFarmById(input.farmId)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Farm not found",
            statusCode: 400,
            details: { issues: [{ path: "farmId", message: "Farm must exist" }] },
          });
        }

        if (input.batchNumber && isBatchNumberTaken(input.batchNumber)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Batch number already exists",
            statusCode: 400,
            details: {
              issues: [{ path: "batchNumber", message: "Batch number must be unique" }],
            },
          });
        }

        const batch = createBatch({
          farmId: input.farmId,
          harvestDate: input.harvestDate,
          quantity: input.quantity,
          batchNumber: input.batchNumber,
        });

        return jsonResponse({ data: batch, status: 201 });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to create batch" });
      }
    },
  });
}
