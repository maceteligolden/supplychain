import type { SupplyChainEventType } from "@/config/supply-chain-event-types";

export type { SupplyChainEventType };

export interface SupplyChainEventInterface {
  /** Unique event identifier. */
  id: string;
  /** Supply chain this event belongs to. */
  supplyChainId: string;
  /** Lifecycle step type. */
  type: SupplyChainEventType;
  /** ISO timestamp when the event occurred (immutable after create). */
  occurredAt: string;
  /** Actor organisation associated with this event. */
  actorId: string;
  /** Optional notes (editable after create). */
  notes?: string;
  /** ISO timestamp when the record was created. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

export type CreateSupplyChainEventInput = {
  type: SupplyChainEventType;
  occurredAt: string;
  actorId: string;
  notes?: string;
};

export type UpdateSupplyChainEventInput = {
  notes?: string;
  actorId?: string;
};

export type GetSupplyChainEventsOutput = {
  events: SupplyChainEventInterface[];
  total: number;
};

export type GetSupplyChainEventOutput = SupplyChainEventInterface;
