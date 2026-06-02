import type { ActorInterface } from "@/types/actor.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface ActorInvolvementEventInterface {
  /** Lifecycle event recorded for a supply chain. */
  event: SupplyChainEventInterface;
  /** Supply chain this event belongs to. */
  supplyChain: SupplyChainInterface;
}

export interface ActorInvolvementStatsInterface {
  /** Total events recorded with this actor. */
  eventCount: number;
  /** Distinct supply chains this actor appears on. */
  supplyChainCount: number;
}

export interface ActorInvolvementInterface {
  /** Actor profile. */
  actor: ActorInterface;
  /** Events involving this actor, newest first. */
  events: ActorInvolvementEventInterface[];
  /** Unique supply chains where this actor has recorded events. */
  supplyChains: SupplyChainInterface[];
  /** Summary counts for stat cards. */
  stats: ActorInvolvementStatsInterface;
}

export type GetActorInvolvementOutput = ActorInvolvementInterface;
