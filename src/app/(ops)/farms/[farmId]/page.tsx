import { notFound } from "next/navigation";

import { FarmDetailView } from "@/components/farms/farm-detail-view";
import { getBatchAllocationsByFarmId } from "@/services/batch-allocations.service";
import { getBatchesByFarmId } from "@/services/batches.service";
import { getCommodities } from "@/services/commodities.service";
import { getFarmById } from "@/services/farms.service";
import { getSupplyChains } from "@/services/supply-chains.service";

type FarmDetailPageProps = {
  params: Promise<{ farmId: string }>;
};

/**
 * Farm detail page — metadata, batch stats, and batch/allocation management.
 */
export default async function FarmDetailPage({
  params,
}: FarmDetailPageProps): Promise<React.JSX.Element> {
  const { farmId } = await params;

  const [farm, { commodities }, { batches }, { allocations }, { supplyChains }] =
    await Promise.all([
      getFarmById(farmId),
      getCommodities(),
      getBatchesByFarmId(farmId),
      getBatchAllocationsByFarmId(farmId),
      getSupplyChains(),
    ]);

  if (!farm) {
    notFound();
  }

  const commodityName =
    commodities.find((item) => item.id === farm.commodityId)?.name ?? "Unknown";

  return (
    <FarmDetailView
      farm={farm}
      commodityName={commodityName}
      batches={batches}
      allocations={allocations}
      supplyChains={supplyChains}
    />
  );
}
