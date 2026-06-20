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
import { getFarmBoundaryByFarmId } from "@/mocks/data/farm-boundaries";
import { runFarmAssessment } from "@/mocks/data/farm-assessments";
import { getFarmById } from "@/mocks/data/farms";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type {
  BatchCreationStepInterface,
  CreateBatchOutput,
  GetBatchesOutput,
} from "@/types/batch.interface";

export async function GET(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/batches" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to list batches" });
    }
  }

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
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/batches" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to create batch" });
    }
  }

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
          commodityId: input.commodityId,
        });

        const steps: BatchCreationStepInterface[] = [
          {
            id: "create-batch",
            label: "Harvest batch recorded",
            status: "completed",
            detail: batch.batchNumber,
          },
        ];

        let assessment = null;
        const boundary = getFarmBoundaryByFarmId(input.farmId);

        if (boundary) {
          try {
            assessment = runFarmAssessment(input.farmId);
            steps.push({
              id: "run-assessment",
              label: "Deforestation assessment completed",
              status: "completed",
              detail: assessment.analysis
                ? `${assessment.analysis.deforestationPercent}% deforestation · ${assessment.riskLevel} risk`
                : "Assessment pending",
            });
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Assessment failed unexpectedly";
            steps.push({
              id: "run-assessment",
              label: "Deforestation assessment failed",
              status: "failed",
              detail: message,
            });
          }
        } else {
          steps.push({
            id: "run-assessment",
            label: "Deforestation assessment skipped",
            status: "skipped",
            detail: "Farm boundary not mapped yet",
          });
        }

        steps.push({
          id: "complete",
          label: "Batch workflow complete",
          status: "completed",
        });

        const output: CreateBatchOutput = {
          batch,
          assessment,
          steps,
        };

        return jsonResponse({ data: output, status: 201 });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to create batch" });
      }
    },
  });
}
