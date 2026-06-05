import { ASSESSMENT_RISK_LABELS } from "@/config/farm-assessment-risk";
import { SUPPLY_CHAIN_EVENT_TYPE_LABELS } from "@/config/supply-chain-event-types";
import { SUPPLY_CHAIN_OVERALL_RISK_LABELS } from "@/config/supply-chain-risk";
import { SUPPLY_CHAIN_STATUS_LABELS } from "@/config/supply-chain-status";
import { formatActorAddress } from "@/lib/actor/format-address";
import { buildSupplyChainRiskSummary } from "@/lib/supply-chain/build-risk-summary";
import { getSupplyChainStats } from "@/lib/supply-chain/supply-chain-stats";
import type { ActorInterface } from "@/types/actor.interface";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { SupplyChainReportInterface } from "@/types/supply-chain-report.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export type BuildSupplyChainReportInput = {
  supplyChain: SupplyChainInterface;
  commodity?: CommodityInterface;
  allocations: BatchAllocationInterface[];
  batches: BatchInterface[];
  farms: FarmInterface[];
  events: SupplyChainEventInterface[];
  actors: ActorInterface[];
  latestAssessmentByFarmId: Map<string, FarmAssessmentInterface | undefined>;
  generatedAt?: string;
};

/** Assembles a traceability report DTO from supply chain domain data. */
export function buildSupplyChainReport(
  input: BuildSupplyChainReportInput,
): SupplyChainReportInterface {
  const actorById = new Map(input.actors.map((item) => [item.id, item]));
  const batchById = new Map(input.batches.map((item) => [item.id, item]));
  const farmById = new Map(input.farms.map((item) => [item.id, item]));

  const stats = getSupplyChainStats({
    allocations: input.allocations,
    batches: input.batches,
    farms: input.farms,
    events: input.events,
  });

  const riskSummary = buildSupplyChainRiskSummary({
    supplyChainId: input.supplyChain.id,
    allocations: input.allocations,
    batches: input.batches,
    farms: input.farms,
    latestAssessmentByFarmId: input.latestAssessmentByFarmId,
  });

  const allocations = input.allocations.map((allocation) => {
    const batch = batchById.get(allocation.batchId);
    const farm = batch ? farmById.get(batch.farmId) : undefined;

    return {
      farmName: farm?.name ?? "Unknown farm",
      batchNumber: batch?.batchNumber ?? allocation.batchId,
      quantity: allocation.quantity,
      unit: batch?.unit ?? "",
    };
  });

  const events = [...input.events]
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
    .map((event) => {
      const actor = actorById.get(event.actorId);

      return {
        typeLabel: SUPPLY_CHAIN_EVENT_TYPE_LABELS[event.type],
        occurredAt: event.occurredAt,
        actorName: actor?.name ?? "Unknown actor",
        actorAddress: actor ? formatActorAddress(actor) : "",
        notes: event.notes,
      };
    });

  return {
    name: input.supplyChain.name,
    code: input.supplyChain.code,
    statusLabel: SUPPLY_CHAIN_STATUS_LABELS[input.supplyChain.status],
    commodityName: input.commodity?.name ?? "Unknown commodity",
    description: input.supplyChain.description,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    stats,
    allocations,
    events,
    deforestation: {
      overallRiskLabel: SUPPLY_CHAIN_OVERALL_RISK_LABELS[riskSummary.overallRiskLevel],
      farms: riskSummary.farmRisks.map((entry) => ({
        farmName: entry.farmName,
        riskLabel: entry.riskLevel
          ? ASSESSMENT_RISK_LABELS[entry.riskLevel]
          : "Not assessed",
        deforestationPercent: entry.analysis?.deforestationPercent ?? null,
        forestCoverPercent: entry.analysis?.forestCoverPercent ?? null,
        protectedAreaOverlapPercent:
          entry.analysis?.protectedAreaOverlapPercent ?? null,
        lastAssessedAt: entry.latestAssessedAt,
      })),
    },
  };
}
