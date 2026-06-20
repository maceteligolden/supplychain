import { createAppError } from "@/lib/errors";
import {
  syncSupplyChainAllocationsSchema,
  type SyncSupplyChainAllocationsSchemaInput,
} from "@/lib/validation/schemas/supply-chain-allocation.schema";
import { validate } from "@/lib/validation";
import { syncSupplyChainAllocations } from "@/mocks/data/batch-allocations";
import { getSupplyChainById } from "@/mocks/data/supply-chains";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type { SyncSupplyChainAllocationsOutput } from "@/types/supply-chain.interface";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  if (!env.useMockApi) {
    try {
      const { id } = await context.params;
      return await proxyRequest({
        request,
        targetPath: `/api/v1/supply-chains/${id}/allocations`,
      });
    } catch (error) {
      return errorResponse({
        error,
        fallbackMessage: "Failed to sync supply chain allocations",
      });
    }
  }

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
        const input = validate<SyncSupplyChainAllocationsSchemaInput>({
          schema: syncSupplyChainAllocationsSchema,
          data: body,
          label: "supply chain allocations",
        });

        const allocations = syncSupplyChainAllocations(id, input.allocations);
        const output: SyncSupplyChainAllocationsOutput = {
          allocations,
          total: allocations.length,
        };

        return jsonResponse({ data: output });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to sync allocations";
        return errorResponse({
          error: createAppError({
            code: "VALIDATION_ERROR",
            message,
            statusCode: 400,
          }),
          fallbackMessage: "Failed to sync supply chain allocations",
        });
      }
    },
  });
}
