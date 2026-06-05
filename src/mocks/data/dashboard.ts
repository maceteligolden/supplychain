import { buildDashboardSummary } from "@/lib/dashboard/build-summary";
import { getAllActors } from "@/mocks/data/actors";
import { getAllBatches } from "@/mocks/data/batches";
import { getAllBatchAllocations } from "@/mocks/data/batch-allocations";
import { getAllCommodities } from "@/mocks/data/commodities";
import { getLatestFarmAssessment } from "@/mocks/data/farm-assessments";
import { getAllFarms } from "@/mocks/data/farms";
import { getAllSupplyChainEvents } from "@/mocks/data/supply-chain-events";
import { getAllSupplyChains } from "@/mocks/data/supply-chains";
import type { DashboardSummaryInterface } from "@/types/dashboard.interface";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";

/** Computes dashboard summary from current mock store state. */
export function buildDashboardSummaryFromMocks(): DashboardSummaryInterface {
  const farms = getAllFarms();
  const latestAssessmentByFarmId = new Map<string, FarmAssessmentInterface | undefined>(
    farms.map((farm) => [farm.id, getLatestFarmAssessment(farm.id)]),
  );

  return buildDashboardSummary({
    farmsCount: farms.length,
    batchesCount: getAllBatches().length,
    supplyChains: getAllSupplyChains(),
    events: getAllSupplyChainEvents(),
    commodities: getAllCommodities(),
    actors: getAllActors(),
    allocations: getAllBatchAllocations(),
    batches: getAllBatches(),
    farms,
    latestAssessmentByFarmId,
  });
}
