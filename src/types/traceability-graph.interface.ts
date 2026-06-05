import type { SupplyChainEventType } from "@/config/supply-chain-event-types";

export type TraceabilityGraphNodeType = "farm" | "batch" | "chain" | "event";

export type TraceabilityGraphEventStatus =
  | "completed"
  | "skipped"
  | "upcoming"
  | "next";

export interface TraceabilityGraphPositionInterface {
  /** Horizontal column index for layout. */
  x: number;
  /** Vertical row index within a column. */
  y: number;
}

export interface TraceabilityGraphNodeInterface {
  /** Unique node id within the graph. */
  id: string;
  /** Node category for styling and behaviour. */
  type: TraceabilityGraphNodeType;
  /** Primary display label. */
  label: string;
  /** Secondary line (location, quantity, actor, date). */
  subtitle?: string;
  /** Layout position hint. */
  position: TraceabilityGraphPositionInterface;
  /** Lifecycle step type — event nodes only. */
  eventType?: SupplyChainEventType;
  /** Timeline status — event nodes only. */
  eventStatus?: TraceabilityGraphEventStatus;
  /** Linked entity id for navigation. */
  entityId?: string;
  /** Optional detail page href. */
  href?: string;
}

export interface TraceabilityGraphEdgeInterface {
  /** Unique edge id. */
  id: string;
  /** Source node id. */
  source: string;
  /** Target node id. */
  target: string;
  /** Optional edge label (e.g. quantity). */
  label?: string;
}

export interface TraceabilityGraphInterface {
  /** Supply chain this graph represents. */
  supplyChainId: string;
  /** Supply chain display name. */
  supplyChainName: string;
  /** True when no batches are allocated to this chain. */
  hasAllocations: boolean;
  /** Graph nodes. */
  nodes: TraceabilityGraphNodeInterface[];
  /** Directed edges between nodes. */
  edges: TraceabilityGraphEdgeInterface[];
}
