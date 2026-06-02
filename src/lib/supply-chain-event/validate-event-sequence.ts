import {
  getSupplyChainEventTypeOrder,
  SUPPLY_CHAIN_EVENT_TYPES,
  type SupplyChainEventType,
} from "@/config/supply-chain-event-types";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";

export type ValidateEventSequenceResult =
  | { valid: true }
  | { valid: false; message: string };

/**
 * Validates that a new event type follows forward-only ordering rules.
 * Skips are allowed; duplicates and backwards steps are rejected.
 */
export function validateEventSequence(
  existingEvents: SupplyChainEventInterface[],
  nextType: SupplyChainEventType,
): ValidateEventSequenceResult {
  if (existingEvents.some((event) => event.type === nextType)) {
    return {
      valid: false,
      message: `An event of type ${nextType} already exists for this supply chain`,
    };
  }

  const nextOrder = getSupplyChainEventTypeOrder(nextType);
  if (nextOrder === -1) {
    return { valid: false, message: "Invalid event type" };
  }

  const maxExistingOrder = existingEvents.reduce((max, event) => {
    const order = getSupplyChainEventTypeOrder(event.type);
    return order > max ? order : max;
  }, -1);

  if (nextOrder <= maxExistingOrder) {
    return {
      valid: false,
      message: `Event type ${nextType} cannot be added after later lifecycle steps`,
    };
  }

  return { valid: true };
}

/** Returns event types that may be added next for a supply chain. */
export function getAllowedNextEventTypes(
  existingEvents: SupplyChainEventInterface[],
): SupplyChainEventType[] {
  const existingTypes = new Set(existingEvents.map((event) => event.type));
  const maxExistingOrder = existingEvents.reduce((max, event) => {
    const order = getSupplyChainEventTypeOrder(event.type);
    return order > max ? order : max;
  }, -1);

  return SUPPLY_CHAIN_EVENT_TYPES.filter(
    (type) =>
      !existingTypes.has(type) && getSupplyChainEventTypeOrder(type) > maxExistingOrder,
  );
}

/** Derives timeline step states for ecommerce-style visualization. */
export function getEventTimelineStepStates(
  existingEvents: SupplyChainEventInterface[],
): {
  type: SupplyChainEventType;
  status: "completed" | "skipped" | "upcoming" | "next";
  event?: SupplyChainEventInterface;
}[] {
  const eventsByType = new Map(existingEvents.map((event) => [event.type, event]));
  const recordedOrders = existingEvents.map((event) =>
    getSupplyChainEventTypeOrder(event.type),
  );
  const minRecorded = recordedOrders.length > 0 ? Math.min(...recordedOrders) : -1;
  const maxRecorded = recordedOrders.length > 0 ? Math.max(...recordedOrders) : -1;
  const allowedNext = getAllowedNextEventTypes(existingEvents);
  const nextType = allowedNext[0];

  return SUPPLY_CHAIN_EVENT_TYPES.map((type) => {
    const event = eventsByType.get(type);
    if (event) {
      return { type, status: "completed" as const, event };
    }

    const order = getSupplyChainEventTypeOrder(type);
    if (nextType === type) {
      return { type, status: "next" as const };
    }

    if (recordedOrders.length > 0 && order > minRecorded && order < maxRecorded) {
      return { type, status: "skipped" as const };
    }

    return { type, status: "upcoming" as const };
  });
}
