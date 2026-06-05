import { SUPPLY_CHAIN_EVENT_TYPE_LABELS } from "@/config/supply-chain-event-types";
import { actorDetailPage, farmDetailPage } from "@/config/page-routes";
import { formatFarmLocation } from "@/lib/farm/format-location";
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

const COLUMN_WIDTH = 220;
const ROW_HEIGHT = 120;

export type BuildCustodyGraphInput = {
  supplyChain: SupplyChainInterface;
  commodity?: CommodityInterface;
  allocations: BatchAllocationInterface[];
  batches: BatchInterface[];
  farms: FarmInterface[];
  events: SupplyChainEventInterface[];
  actors: ActorInterface[];
};

function toFlowPosition(column: number, row: number): { x: number; y: number } {
  return {
    x: column * COLUMN_WIDTH,
    y: row * ROW_HEIGHT,
  };
}

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
  nodes.push({
    id: chainNodeId,
    type: "chain",
    label: input.supplyChain.name,
    subtitle: input.commodity?.name ?? "Unknown commodity",
    position: toFlowPosition(COLUMN.chain, 0),
    entityId: input.supplyChain.id,
  });

  const allocationRows = input.allocations
    .map((allocation) => {
      const batch = batchById.get(allocation.batchId);
      const farm = batch ? farmById.get(batch.farmId) : undefined;
      return { allocation, batch, farm };
    })
    .filter((row) => row.batch !== undefined);

  const farmRowById = new Map<string, number>();
  let farmRow = 0;

  for (const { farm } of allocationRows) {
    if (!farm || farmRowById.has(farm.id)) {
      continue;
    }

    farmRowById.set(farm.id, farmRow);
    nodes.push({
      id: `farm-${farm.id}`,
      type: "farm",
      label: farm.name,
      subtitle: formatFarmLocation(farm.location) || undefined,
      position: toFlowPosition(COLUMN.farm, farmRow),
      entityId: farm.id,
      href: farmDetailPage(farm.id),
    });
    farmRow += 1;
  }

  allocationRows.forEach(({ allocation, batch, farm }, index) => {
    if (!batch) {
      return;
    }

    const batchNodeId = `batch-${batch.id}`;
    nodes.push({
      id: batchNodeId,
      type: "batch",
      label: batch.batchNumber,
      subtitle: `${allocation.quantity.toLocaleString()} ${batch.unit}`,
      position: toFlowPosition(COLUMN.batch, index),
      entityId: batch.id,
    });

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

    nodes.push({
      id: eventNodeId,
      type: "event",
      label: SUPPLY_CHAIN_EVENT_TYPE_LABELS[step.type],
      subtitle: subtitleParts.length > 0 ? subtitleParts.join(" · ") : undefined,
      position: toFlowPosition(COLUMN.eventStart + index, 0),
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
