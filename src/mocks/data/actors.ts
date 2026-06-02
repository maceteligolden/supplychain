import type {
  ActorInterface,
  CreateActorInput,
  UpdateActorInput,
} from "@/types/actor.interface";

const SEED_ACTORS: ActorInterface[] = [
  {
    id: "actor_kumasi_collection_001",
    name: "Kumasi Collection Centre",
    code: "KUMASI_COLLECTION_CENTRE",
    type: "COLLECTION_CENTRE",
    address: {
      line1: "Plot 12, Industrial Area",
      city: "Kumasi",
      region: "Ashanti",
      country: "Ghana",
    },
    status: "ACTIVE",
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-01-10T08:00:00.000Z",
  },
  {
    id: "actor_accra_processor_001",
    name: "Accra Cocoa Processing Ltd",
    code: "ACCRA_COCOA_PROCESSING_LTD",
    type: "PROCESSOR",
    address: {
      line1: "Tema Industrial Zone",
      city: "Accra",
      region: "Greater Accra",
      country: "Ghana",
    },
    status: "ACTIVE",
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-01-10T08:00:00.000Z",
  },
  {
    id: "actor_tema_export_001",
    name: "Tema Export Terminal",
    code: "TEMA_EXPORT_TERMINAL",
    type: "EXPORTER",
    address: {
      line1: "Harbour Road",
      city: "Tema",
      region: "Greater Accra",
      country: "Ghana",
    },
    status: "ACTIVE",
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-01-10T08:00:00.000Z",
  },
];

/** In-memory mutable mock store — swap for MongoDB in production. */
let actors: ActorInterface[] = [...SEED_ACTORS];

function generateId(): string {
  return `actor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllActors(): ActorInterface[] {
  return [...actors];
}

export function getActorById(id: string): ActorInterface | undefined {
  return actors.find((item) => item.id === id);
}

export function isActorCodeTaken(code: string, excludeId?: string): boolean {
  return actors.some(
    (item) => item.code === code.toUpperCase() && item.id !== excludeId,
  );
}

export function createActor(input: CreateActorInput): ActorInterface {
  const now = new Date().toISOString();
  const actor: ActorInterface = {
    id: generateId(),
    name: input.name.trim(),
    code: input.code.toUpperCase(),
    type: input.type,
    address: {
      line1: input.address.line1?.trim() || undefined,
      city: input.address.city.trim(),
      region: input.address.region.trim(),
      country: input.address.country.trim(),
    },
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };

  actors = [...actors, actor];
  return actor;
}

export function updateActor(
  id: string,
  input: UpdateActorInput,
): ActorInterface | undefined {
  const index = actors.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  const existing = actors[index];
  if (!existing) {
    return undefined;
  }

  const address = input.address
    ? {
        line1: input.address.line1?.trim() ?? existing.address.line1,
        city: input.address.city?.trim() ?? existing.address.city,
        region: input.address.region?.trim() ?? existing.address.region,
        country: input.address.country?.trim() ?? existing.address.country,
      }
    : existing.address;

  const updated: ActorInterface = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    code: input.code ? input.code.toUpperCase() : existing.code,
    type: input.type ?? existing.type,
    address,
    status: input.status ?? existing.status,
    updatedAt: new Date().toISOString(),
  };

  actors = actors.map((item) => (item.id === id ? updated : item));
  return updated;
}

export function deleteActor(id: string): boolean {
  const before = actors.length;
  actors = actors.filter((item) => item.id !== id);
  return actors.length < before;
}

/** Reset store to seed data — useful for tests only. */
export function resetActorsMockStore(): void {
  actors = [...SEED_ACTORS];
}
