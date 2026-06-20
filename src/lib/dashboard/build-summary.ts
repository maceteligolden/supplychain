import { buildSupplyChainRiskSummary } from "@/lib/supply-chain/build-risk-summary";
import {
  ONGOING_CHAIN_DISPLAY_LIMIT,
  RECENT_ACTIVITY_DISPLAY_LIMIT,
} from "@/lib/dashboard/constants";
import {
  getSupplyChainEventTypeOrder,
  SUPPLY_CHAIN_EVENT_TYPES,
  SUPPLY_CHAIN_EVENT_TYPE_LABELS,
  type SupplyChainEventType,
} from "@/config/supply-chain-event-types";
import type { SupplyChainOverallRiskLevel } from "@/config/supply-chain-risk";
import type {
  DashboardChartPointInterface,
  DashboardKpiInterface,
  DashboardRecentActivityInterface,
  DashboardSummaryInterface,
  OngoingSupplyChainInterface,
} from "@/types/dashboard.interface";
import type { ActorInterface } from "@/types/actor.interface";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

const ONGOING_CHAIN_LIMIT = ONGOING_CHAIN_DISPLAY_LIMIT;
const RECENT_ACTIVITY_LIMIT = RECENT_ACTIVITY_DISPLAY_LIMIT;

export type BuildDashboardSummaryInput = {
  farmsCount: number;
  batchesCount: number;
  supplyChains: SupplyChainInterface[];
  events: SupplyChainEventInterface[];
  commodities: CommodityInterface[];
  actors: ActorInterface[];
  allocations: BatchAllocationInterface[];
  batches: BatchInterface[];
  farms: FarmInterface[];
  latestAssessmentByFarmId: Map<string, FarmAssessmentInterface | undefined>;
};

function getChainOverallRiskLevel(
  input: BuildDashboardSummaryInput,
  supplyChainId: string,
): SupplyChainOverallRiskLevel {
  return buildSupplyChainRiskSummary({
    supplyChainId,
    allocations: input.allocations,
    batches: input.batches,
    farms: input.farms,
    latestAssessmentByFarmId: input.latestAssessmentByFarmId,
  }).overallRiskLevel;
}

function countAtRiskChains(input: BuildDashboardSummaryInput): number {
  return input.supplyChains.filter((chain) => {
    const risk = getChainOverallRiskLevel(input, chain.id);
    return risk === "HIGH" || risk === "MEDIUM";
  }).length;
}

function getFurthestEventType(
  chainEvents: SupplyChainEventInterface[],
): SupplyChainEventType | null {
  if (chainEvents.length === 0) {
    return null;
  }

  return chainEvents.reduce<SupplyChainEventType | null>((furthest, event) => {
    if (!furthest) {
      return event.type;
    }

    const order = getSupplyChainEventTypeOrder(event.type);
    const furthestOrder = getSupplyChainEventTypeOrder(furthest);
    return order > furthestOrder ? event.type : furthest;
  }, null);
}

function getProgressLabel(furthestType: SupplyChainEventType | null): string {
  if (!furthestType) {
    return "Not started";
  }

  return `At ${SUPPLY_CHAIN_EVENT_TYPE_LABELS[furthestType].replace(" at farm", "").replace(" / aggregated", "")}`;
}

function isChainOngoing(
  chain: SupplyChainInterface,
  chainEvents: SupplyChainEventInterface[],
): boolean {
  if (chain.status !== "ACTIVE") {
    return false;
  }

  const furthest = getFurthestEventType(chainEvents);
  return furthest !== "DELIVERED";
}

function buildKpis(input: BuildDashboardSummaryInput): DashboardKpiInterface[] {
  const activeSupplyChainsCount = input.supplyChains.filter(
    (chain) => chain.status === "ACTIVE",
  ).length;

  return [
    {
      id: "kpi-farms",
      label: "Farms",
      value: input.farmsCount,
      description: "Registered farms",
    },
    {
      id: "kpi-batches",
      label: "Batches",
      value: input.batchesCount,
      description: "Harvest batches",
    },
    {
      id: "kpi-active-chains",
      label: "Active supply chains",
      value: activeSupplyChainsCount,
      description: "Journeys in progress",
    },
    {
      id: "kpi-events",
      label: "Events",
      value: input.events.length,
      description: "Recorded lifecycle events",
    },
    {
      id: "kpi-at-risk-chains",
      label: "At-risk chains",
      value: countAtRiskChains(input),
      description: "Chains with medium or high farm risk",
    },
  ];
}

function buildOngoingSupplyChains(
  input: BuildDashboardSummaryInput,
): OngoingSupplyChainInterface[] {
  const commodityById = new Map(input.commodities.map((item) => [item.id, item.name]));

  return input.supplyChains
    .filter((chain) => {
      const chainEvents = input.events.filter(
        (event) => event.supplyChainId === chain.id,
      );
      return isChainOngoing(chain, chainEvents);
    })
    .map((chain) => {
      const chainEvents = input.events.filter(
        (event) => event.supplyChainId === chain.id,
      );
      const furthest = getFurthestEventType(chainEvents);
      const commodityName =
        commodityById.get(chain.commodityId ?? "") ?? "Unknown commodity";

      return {
        supplyChainId: chain.id,
        name: chain.name,
        commodityName,
        progressLabel: getProgressLabel(furthest),
        eventsRecordedCount: chainEvents.length,
        overallRiskLevel: getChainOverallRiskLevel(input, chain.id),
      };
    })
    .slice(0, ONGOING_CHAIN_LIMIT);
}

function buildEventsByType(
  events: SupplyChainEventInterface[],
): DashboardChartPointInterface[] {
  const counts = new Map<SupplyChainEventType, number>();

  for (const type of SUPPLY_CHAIN_EVENT_TYPES) {
    counts.set(type, 0);
  }

  for (const event of events) {
    counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
  }

  return SUPPLY_CHAIN_EVENT_TYPES.map((type) => ({
    label: SUPPLY_CHAIN_EVENT_TYPE_LABELS[type],
    value: counts.get(type) ?? 0,
  }));
}

function buildChainProgress(
  input: BuildDashboardSummaryInput,
): DashboardChartPointInterface[] {
  const buckets = new Map<string, number>();

  for (const chain of input.supplyChains.filter((item) => item.status === "ACTIVE")) {
    const chainEvents = input.events.filter(
      (event) => event.supplyChainId === chain.id,
    );
    const furthest = getFurthestEventType(chainEvents);
    const label = furthest ? SUPPLY_CHAIN_EVENT_TYPE_LABELS[furthest] : "Not started";
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
}

function buildRecentActivity(
  input: BuildDashboardSummaryInput,
): DashboardRecentActivityInterface[] {
  const chainById = new Map(input.supplyChains.map((item) => [item.id, item]));
  const actorById = new Map(input.actors.map((item) => [item.id, item]));

  return [...input.events]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map((event) => {
      const chain = chainById.get(event.supplyChainId);
      const actor = actorById.get(event.actorId);
      const eventLabel = SUPPLY_CHAIN_EVENT_TYPE_LABELS[event.type];
      const chainName = chain?.name ?? "Unknown chain";
      const actorName = actor?.name ?? "Unknown actor";

      return {
        id: event.id,
        description: `${eventLabel} on ${chainName} at ${actorName}`,
        occurredAt: event.occurredAt,
        supplyChainId: event.supplyChainId,
      };
    });
}

/** Builds the dashboard summary from traceability domain data. */
export function buildDashboardSummary(
  input: BuildDashboardSummaryInput,
): DashboardSummaryInterface {
  return {
    kpis: buildKpis(input),
    ongoingSupplyChains: buildOngoingSupplyChains(input),
    eventsByType: buildEventsByType(input.events),
    chainProgress: buildChainProgress(input),
    recentActivity: buildRecentActivity(input),
  };
}
