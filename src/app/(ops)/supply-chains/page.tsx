import { SupplyChainsView } from "@/components/supply-chains/supply-chains-view";
import { getBatchAllocationsByFarmId } from "@/services/batch-allocations.service";
import { getBatchesByFarmId } from "@/services/batches.service";
import { getCommodities } from "@/services/commodities.service";
import { getFarms } from "@/services/farms.service";
import { getSupplyChains } from "@/services/supply-chains.service";
import type { BatchInterface } from "@/types/batch.interface";

/**
 * Supply chains management page — list with wizard-based create/edit.
 */
export default async function SupplyChainsPage(): Promise<React.JSX.Element> {
  const [{ supplyChains }, { commodities }, { farms }] = await Promise.all([
    getSupplyChains(),
    getCommodities(),
    getFarms(),
  ]);

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

  return (
    <SupplyChainsView
      supplyChains={supplyChains}
      commodities={commodities}
      farms={farms}
      batchesByFarmId={batchesByFarmId}
      allAllocations={allAllocations}
    />
  );
}
