import { buildSupplyChainReport } from "@/lib/supply-chain/build-report";
import { createAppError } from "@/lib/errors";
import { getAllActors } from "@/mocks/data/actors";
import { getBatchById } from "@/mocks/data/batches";
import { getBatchAllocationsBySupplyChainId } from "@/mocks/data/batch-allocations";
import { getCommodityById } from "@/mocks/data/commodities";
import { getLatestFarmAssessment } from "@/mocks/data/farm-assessments";
import { getFarmById } from "@/mocks/data/farms";
import { getSupplyChainEventsByChainId } from "@/mocks/data/supply-chain-events";
import { getSupplyChainById } from "@/mocks/data/supply-chains";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { BatchInterface } from "@/types/batch.interface";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { GetSupplyChainReportOutput } from "@/types/supply-chain-report.interface";

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

        const allocations = getBatchAllocationsBySupplyChainId(id);
        const events = getSupplyChainEventsByChainId(id);
        const actors = getAllActors();

        const batches: BatchInterface[] = [];
        const farms: FarmInterface[] = [];
        const farmIds = new Set<string>();

        for (const allocation of allocations) {
          const batch = getBatchById(allocation.batchId);
          if (batch && !batches.some((item) => item.id === batch.id)) {
            batches.push(batch);
          }

          if (batch && !farmIds.has(batch.farmId)) {
            const farm = getFarmById(batch.farmId);
            if (farm) {
              farms.push(farm);
              farmIds.add(farm.id);
            }
          }
        }

        const commodity =
          getCommodityById(supplyChain.commodityId ?? "") ??
          (farms[0] ? getCommodityById(farms[0].commodityIds[0] ?? "") : undefined);

        const latestAssessmentByFarmId = new Map<
          string,
          FarmAssessmentInterface | undefined
        >(
          farms.map((linkedFarm) => [
            linkedFarm.id,
            getLatestFarmAssessment(linkedFarm.id),
          ]),
        );

        const output: GetSupplyChainReportOutput = buildSupplyChainReport({
          supplyChain,
          commodity,
          allocations,
          batches,
          farms,
          events,
          actors,
          latestAssessmentByFarmId,
        });

        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to generate report" });
      }
    },
  });
}
