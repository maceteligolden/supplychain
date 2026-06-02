import { notFound } from "next/navigation";

import { SupplyChainDetailClient } from "@/components/supply-chains/supply-chain-detail-client";
import {
  getBatchAllocationsByFarmId,
  getBatchAllocationsBySupplyChainId,
} from "@/services/batch-allocations.service";
import { getBatchesByFarmId } from "@/services/batches.service";
import { getCommodities } from "@/services/commodities.service";
import { getFarms } from "@/services/farms.service";
import { getActors } from "@/services/actors.service";
import { getSupplyChainEvents } from "@/services/supply-chain-events.service";
import { getSupplyChainById } from "@/services/supply-chains.service";
import type { BatchInterface } from "@/types/batch.interface";

type SupplyChainDetailPageProps = {
  params: Promise<{ supplyChainId: string }>;
};

/**
 * Supply chain detail page — metadata, allocations, and event tracking.
 */
export default async function SupplyChainDetailPage({
  params,
}: SupplyChainDetailPageProps): Promise<React.JSX.Element> {
  const { supplyChainId } = await params;

  const [
    supplyChain,
    { commodities },
    { farms },
    { allocations },
    { events },
    { actors },
  ] = await Promise.all([
    getSupplyChainById(supplyChainId),
    getCommodities(),
    getFarms(),
    getBatchAllocationsBySupplyChainId(supplyChainId),
    getSupplyChainEvents(supplyChainId),
    getActors(),
  ]);

  if (!supplyChain) {
    notFound();
  }

  const batchesByFarmIdEntries = await Promise.all(
    farms.map(async (farm) => {
      const { batches } = await getBatchesByFarmId(farm.id);
      return [farm.id, batches] as const;
    }),
  );
  const batchesByFarmId = Object.fromEntries(batchesByFarmIdEntries) as Record<
    string,
    BatchInterface[]
  >;

  const allFarmAllocations = await Promise.all(
    farms.map((farm) => getBatchAllocationsByFarmId(farm.id)),
  );
  const allAllocations = allFarmAllocations.flatMap((result) => result.allocations);

  const batchIds = new Set(allocations.map((item) => item.batchId));
  const batches = Object.values(batchesByFarmId)
    .flat()
    .filter((batch) => batchIds.has(batch.id));

  const farmIds = new Set(batches.map((batch) => batch.farmId));
  const linkedFarms = farms.filter((farm) => farmIds.has(farm.id));

  const commodity = commodities.find(
    (item) => item.id === (supplyChain.commodityId ?? linkedFarms[0]?.commodityId),
  );

  return (
    <SupplyChainDetailClient
      supplyChain={supplyChain}
      commodity={commodity}
      allocations={allocations}
      batches={batches}
      farms={linkedFarms.length > 0 ? linkedFarms : farms}
      events={events}
      actors={actors}
      commodities={commodities}
      batchesByFarmId={batchesByFarmId}
      allAllocations={allAllocations}
    />
  );
}
