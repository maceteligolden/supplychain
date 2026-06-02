import { buildDashboardSummary } from "@/lib/dashboard/build-summary";
import { getAllActors } from "@/mocks/data/actors";
import { getAllBatches } from "@/mocks/data/batches";
import { getAllCommodities } from "@/mocks/data/commodities";
import { getAllFarms } from "@/mocks/data/farms";
import { getAllSupplyChainEvents } from "@/mocks/data/supply-chain-events";
import { getAllSupplyChains } from "@/mocks/data/supply-chains";
import type { DashboardSummaryInterface } from "@/types/dashboard.interface";

/** Computes dashboard summary from current mock store state. */
export function buildDashboardSummaryFromMocks(): DashboardSummaryInterface {
  return buildDashboardSummary({
    farmsCount: getAllFarms().length,
    batchesCount: getAllBatches().length,
    supplyChains: getAllSupplyChains(),
    events: getAllSupplyChainEvents(),
    commodities: getAllCommodities(),
    actors: getAllActors(),
  });
}
