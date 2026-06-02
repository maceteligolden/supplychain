import { getActorById } from "@/mocks/data/actors";
import { validateEventSequence } from "@/lib/supply-chain-event/validate-event-sequence";
import { getSupplyChainById } from "@/mocks/data/supply-chains";
import type {
  CreateSupplyChainEventInput,
  SupplyChainEventInterface,
  UpdateSupplyChainEventInput,
} from "@/types/supply-chain-event.interface";

const SEED_EVENTS: SupplyChainEventInterface[] = [
  {
    id: "event_gh_harvest_001",
    supplyChainId: "supply_chain_gh_cocoa_001",
    type: "HARVEST",
    occurredAt: "2025-02-02T10:00:00.000Z",
    actorId: "actor_kumasi_collection_001",
    notes: "Initial harvest recorded for cocoa export chain.",
    createdAt: "2025-02-02T10:00:00.000Z",
    updatedAt: "2025-02-02T10:00:00.000Z",
  },
  {
    id: "event_gh_collection_001",
    supplyChainId: "supply_chain_gh_cocoa_001",
    type: "COLLECTION",
    occurredAt: "2025-02-05T14:30:00.000Z",
    actorId: "actor_kumasi_collection_001",
    notes: "Batches aggregated for export processing.",
    createdAt: "2025-02-05T14:30:00.000Z",
    updatedAt: "2025-02-05T14:30:00.000Z",
  },
];

/** In-memory mutable mock store — swap for MongoDB in production. */
let events: SupplyChainEventInterface[] = [...SEED_EVENTS];

function generateId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function validateActorForEvent(actorId: string): void {
  const actor = getActorById(actorId);
  if (!actor) {
    throw new Error("Actor not found");
  }
  if (actor.status !== "ACTIVE") {
    throw new Error("Actor is not active");
  }
}

export function getAllSupplyChainEvents(): SupplyChainEventInterface[] {
  return [...events];
}

export function getSupplyChainEventsByChainId(
  supplyChainId: string,
): SupplyChainEventInterface[] {
  return events
    .filter((item) => item.supplyChainId === supplyChainId)
    .sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
    );
}

export function getSupplyChainEventById(
  id: string,
): SupplyChainEventInterface | undefined {
  return events.find((item) => item.id === id);
}

export function isActorReferencedByEvent(actorId: string): boolean {
  return events.some((item) => item.actorId === actorId);
}

export function createSupplyChainEvent(
  supplyChainId: string,
  input: CreateSupplyChainEventInput,
): SupplyChainEventInterface {
  const supplyChain = getSupplyChainById(supplyChainId);
  if (!supplyChain) {
    throw new Error("Supply chain not found");
  }

  validateActorForEvent(input.actorId);

  const existing = getSupplyChainEventsByChainId(supplyChainId);
  const validation = validateEventSequence(existing, input.type);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const now = new Date().toISOString();
  const event: SupplyChainEventInterface = {
    id: generateId(),
    supplyChainId,
    type: input.type,
    occurredAt: input.occurredAt,
    actorId: input.actorId,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  events = [...events, event];
  return event;
}

export function updateSupplyChainEvent(
  id: string,
  input: UpdateSupplyChainEventInput,
): SupplyChainEventInterface | undefined {
  const index = events.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  const existing = events[index];
  if (!existing) {
    return undefined;
  }

  if (input.actorId) {
    validateActorForEvent(input.actorId);
  }

  const updated: SupplyChainEventInterface = {
    ...existing,
    notes: input.notes !== undefined ? input.notes.trim() || undefined : existing.notes,
    actorId: input.actorId ?? existing.actorId,
    updatedAt: new Date().toISOString(),
  };

  events = events.map((item) => (item.id === id ? updated : item));
  return updated;
}

/** Reset store to seed data — useful for tests only. */
export function resetSupplyChainEventsMockStore(): void {
  events = [...SEED_EVENTS];
}
