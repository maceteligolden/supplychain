import { buildSupplyChainRiskSummary } from "@/lib/supply-chain/build-risk-summary";
import { createAppError } from "@/lib/errors";
import { getAllBatches } from "@/mocks/data/batches";
import { getAllBatchAllocations } from "@/mocks/data/batch-allocations";
import { getLatestFarmAssessment } from "@/mocks/data/farm-assessments";
import { getAllFarms } from "@/mocks/data/farms";
import { getSupplyChainById } from "@/mocks/data/supply-chains";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";
import type { GetSupplyChainRiskSummaryOutput } from "@/types/supply-chain-risk.interface";

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

        const farms = getAllFarms();
        const latestAssessmentByFarmId = new Map<
          string,
          FarmAssessmentInterface | undefined
        >(farms.map((farm) => [farm.id, getLatestFarmAssessment(farm.id)]));

        const summary = buildSupplyChainRiskSummary({
          supplyChainId: id,
          allocations: getAllBatchAllocations(),
          batches: getAllBatches(),
          farms,
          latestAssessmentByFarmId,
        });

        const output: GetSupplyChainRiskSummaryOutput = summary;

        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to get supply chain risk summary",
        });
      }
    },
  });
}
