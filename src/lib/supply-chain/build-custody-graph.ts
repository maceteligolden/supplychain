import { SUPPLY_CHAIN_EVENT_TYPE_LABELS } from "@/config/supply-chain-event-types";
import { actorDetailPage, farmDetailPage } from "@/config/page-routes";
import { formatFarmLocation } from "@/lib/farm/format-location";
import {
  CUSTODY_ROW_GAP,
  estimateCustodyNodeHeight,
  toCustodyFlowPosition,
} from "@/lib/supply-chain/custody-graph-layout";
import { getEventTimelineStepStates } from "@/lib/supply-chain-event/validate-event-sequence";
import type { ActorInterface } from "@/types/actor.interface";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";
import type {
  TraceabilityGraphEdgeInterface,
  TraceabilityGraphInterface,
  TraceabilityGraphNodeInterface,
} from "@/types/traceability-graph.interface";

const COLUMN = {
  farm: 0,
  batch: 1,
  chain: 2,
  eventStart: 3,
} as const;

export type BuildCustodyGraphInput = {
  supplyChain: SupplyChainInterface;
  commodity?: CommodityInterface;
  allocations: BatchAllocationInterface[];
  batches: BatchInterface[];
  farms: FarmInterface[];
  events: SupplyChainEventInterface[];
  actors: ActorInterface[];
};

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Assembles a chain-of-custody graph from supply chain domain data. */
export function buildCustodyGraph(
  input: BuildCustodyGraphInput,
): TraceabilityGraphInterface {
  const actorById = new Map(input.actors.map((item) => [item.id, item]));
  const batchById = new Map(input.batches.map((item) => [item.id, item]));
  const farmById = new Map(input.farms.map((item) => [item.id, item]));

  const nodes: TraceabilityGraphNodeInterface[] = [];
  const edges: TraceabilityGraphEdgeInterface[] = [];

  const chainNodeId = `chain-${input.supplyChain.id}`;
  const chainLabel = input.supplyChain.name;
  const chainSubtitle = input.commodity?.name ?? "Unknown commodity";
  nodes.push({
    id: chainNodeId,
    type: "chain",
    label: chainLabel,
    subtitle: chainSubtitle,
    position: toCustodyFlowPosition(COLUMN.chain, 0),
    entityId: input.supplyChain.id,
  });

  const allocationRows = input.allocations
    .map((allocation) => {
      const batch = batchById.get(allocation.batchId);
      const farm = batch ? farmById.get(batch.farmId) : undefined;
      return { allocation, batch, farm };
    })
    .filter((row) => row.batch !== undefined);

  const farmNodes: TraceabilityGraphNodeInterface[] = [];
  const farmRowById = new Map<string, number>();
  let farmStackY = 0;

  for (const { farm } of allocationRows) {
    if (!farm || farmRowById.has(farm.id)) {
      continue;
    }

    const label = farm.name;
    const subtitle = formatFarmLocation(farm.location) || undefined;
    const height = estimateCustodyNodeHeight({ label, subtitle });
    farmRowById.set(farm.id, farmStackY);
    farmNodes.push({
      id: `farm-${farm.id}`,
      type: "farm",
      label,
      subtitle,
      position: toCustodyFlowPosition(COLUMN.farm, farmStackY),
      entityId: farm.id,
      href: farmDetailPage(farm.id),
    });
    farmStackY += height + CUSTODY_ROW_GAP;
  }

  nodes.push(...farmNodes);

  let batchStackY = 0;
  allocationRows.forEach(({ allocation, batch, farm }) => {
    if (!batch) {
      return;
    }

    const batchNodeId = `batch-${batch.id}`;
    const label = batch.batchNumber;
    const subtitle = `${allocation.quantity.toLocaleString()} ${batch.unit}`;
    const height = estimateCustodyNodeHeight({ label, subtitle });

    nodes.push({
      id: batchNodeId,
      type: "batch",
      label,
      subtitle,
      position: toCustodyFlowPosition(COLUMN.batch, batchStackY),
      entityId: batch.id,
    });
    batchStackY += height + CUSTODY_ROW_GAP;

    if (farm) {
      edges.push({
        id: `edge-farm-batch-${batch.id}`,
        source: `farm-${farm.id}`,
        target: batchNodeId,
        label: `${allocation.quantity.toLocaleString()} ${batch.unit}`,
      });
    }

    edges.push({
      id: `edge-batch-chain-${batch.id}`,
      source: batchNodeId,
      target: chainNodeId,
    });
  });

  const eventSteps = getEventTimelineStepStates(input.events);
  let previousEventNodeId: string | undefined;

  eventSteps.forEach((step, index) => {
    const eventNodeId = `event-${step.type}`;
    const actor = step.event ? actorById.get(step.event.actorId) : undefined;
    const subtitleParts: string[] = [];

    if (actor) {
      subtitleParts.push(actor.name);
    }

    if (step.event) {
      subtitleParts.push(formatEventDate(step.event.occurredAt));
    }

    const label = SUPPLY_CHAIN_EVENT_TYPE_LABELS[step.type];
    const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" · ") : undefined;

    nodes.push({
      id: eventNodeId,
      type: "event",
      label,
      subtitle,
      position: toCustodyFlowPosition(COLUMN.eventStart + index, 0),
      eventType: step.type,
      eventStatus: step.status,
      entityId: actor?.id,
      href: actor ? actorDetailPage(actor.id) : undefined,
    });

    if (index === 0) {
      edges.push({
        id: `edge-chain-event-${step.type}`,
        source: chainNodeId,
        target: eventNodeId,
      });
    } else if (previousEventNodeId) {
      edges.push({
        id: `edge-event-${previousEventNodeId}-${eventNodeId}`,
        source: previousEventNodeId,
        target: eventNodeId,
      });
    }

    previousEventNodeId = eventNodeId;
  });

  return {
    supplyChainId: input.supplyChain.id,
    supplyChainName: input.supplyChain.name,
    hasAllocations: allocationRows.length > 0,
    nodes,
    edges,
  };
}
