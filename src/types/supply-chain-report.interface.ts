import type { SupplyChainStats } from "@/lib/supply-chain/supply-chain-stats";

export interface SupplyChainReportAllocationInterface {
  /** Farm display name. */
  farmName: string;
  /** Batch number. */
  batchNumber: string;
  /** Allocated quantity. */
  quantity: number;
  /** Unit of measure. */
  unit: string;
}

export interface SupplyChainReportEventInterface {
  /** Lifecycle step type label. */
  typeLabel: string;
  /** ISO timestamp when the event occurred. */
  occurredAt: string;
  /** Actor organisation name. */
  actorName: string;
  /** Formatted actor address. */
  actorAddress: string;
  /** Optional event notes. */
  notes?: string;
}

export interface SupplyChainReportInterface {
  /** Supply chain display name. */
  name: string;
  /** Unique supply chain code. */
  code: string;
  /** Supply chain status label. */
  statusLabel: string;
  /** Linked commodity name. */
  commodityName: string;
  /** Optional chain description. */
  description?: string;
  /** ISO timestamp when the report was generated. */
  generatedAt: string;
  /** Summary statistics. */
  stats: SupplyChainStats;
  /** Batch allocations on this chain. */
  allocations: SupplyChainReportAllocationInterface[];
  /** Lifecycle events in chronological order. */
  events: SupplyChainReportEventInterface[];
}

export type GetSupplyChainReportOutput = SupplyChainReportInterface;
