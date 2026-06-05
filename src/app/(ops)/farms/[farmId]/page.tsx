import { notFound } from "next/navigation";

import { FarmDetailView } from "@/components/farms/farm-detail-view";
import { getBatchAllocationsByFarmId } from "@/services/batch-allocations.service";
import { getBatchesByFarmId } from "@/services/batches.service";
import { getCommodities } from "@/services/commodities.service";
import { getFarmAssessments } from "@/services/farm-assessments.service";
import { getFarmLandCoverTimeline } from "@/services/farm-land-cover.service";
import { getFarmBoundaryByFarmId } from "@/services/farm-boundaries.service";
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

  const [
    farm,
    { boundary },
    { assessments },
    { points: landCoverTimeline },
    { commodities },
    { batches },
    { allocations },
    { supplyChains },
  ] = await Promise.all([
    getFarmById(farmId),
    getFarmBoundaryByFarmId(farmId),
    getFarmAssessments(farmId),
    getFarmLandCoverTimeline(farmId),
    getCommodities(),
    getBatchesByFarmId(farmId),
    getBatchAllocationsByFarmId(farmId),
    getSupplyChains(),
  ]);

  if (!farm) {
    notFound();
  }

  const farmCommodities = commodities.filter((item) =>
    farm.commodityIds.includes(item.id),
  );

  return (
    <FarmDetailView
      farm={farm}
      commodities={farmCommodities}
      batches={batches}
      allocations={allocations}
      supplyChains={supplyChains}
      boundary={boundary}
      assessments={assessments}
      landCoverTimeline={landCoverTimeline}
    />
  );
}
