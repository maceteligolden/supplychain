"use client";

import { useState } from "react";

import { SupplyChainDetailView } from "@/components/supply-chains/supply-chain-detail-view";
import { SupplyChainWizardDialog } from "@/components/supply-chains/supply-chain-wizard-dialog";
import type { ActorInterface } from "@/types/actor.interface";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface SupplyChainDetailClientProps {
  supplyChain: SupplyChainInterface;
  commodity?: CommodityInterface;
  allocations: BatchAllocationInterface[];
  batches: BatchInterface[];
  farms: FarmInterface[];
  events: SupplyChainEventInterface[];
  actors: ActorInterface[];
  commodities: CommodityInterface[];
  batchesByFarmId: Record<string, BatchInterface[]>;
  allAllocations: BatchAllocationInterface[];
}

/**
 * SupplyChainDetailClient
 *
 * Client wrapper for supply chain detail — wires edit wizard to the detail view.
 */
export function SupplyChainDetailClient({
  supplyChain,
  commodity,
  allocations,
  batches,
  farms,
  events,
  actors,
  commodities,
  batchesByFarmId,
  allAllocations,
}: SupplyChainDetailClientProps): React.JSX.Element {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <>
      <SupplyChainDetailView
        supplyChain={supplyChain}
        commodity={commodity}
        allocations={allocations}
        batches={batches}
        farms={farms}
        events={events}
        actors={actors}
        onEdit={(): void => setWizardOpen(true)}
      />
      <SupplyChainWizardDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        commodities={commodities}
        farms={farms}
        batchesByFarmId={batchesByFarmId}
        allAllocations={allAllocations}
        supplyChain={supplyChain}
      />
    </>
  );
}
