import type {
  CreateSupplyChainInput,
  SupplyChainInterface,
  UpdateSupplyChainInput,
} from "@/types/supply-chain.interface";

const SEED_SUPPLY_CHAINS: SupplyChainInterface[] = [
  {
    id: "supply_chain_gh_cocoa_001",
    name: "Ghana Cocoa Export Chain",
    code: "GH_COCOA_EXPORT",
    description: "Farm to export port — Ghana cocoa traceability route",
    status: "ACTIVE",
    createdAt: "2025-01-15T08:00:00.000Z",
    updatedAt: "2025-01-15T08:00:00.000Z",
  },
  {
    id: "supply_chain_sd_gum_001",
    name: "Sudan Gum Arabic Export Chain",
    code: "SD_GUM_EXPORT",
    description: "Farm to export port — Sudan gum arabic traceability route",
    status: "ACTIVE",
    createdAt: "2025-01-15T08:00:00.000Z",
    updatedAt: "2025-01-15T08:00:00.000Z",
  },
];

/** In-memory mutable mock store — swap for MongoDB in production. */
let supplyChains: SupplyChainInterface[] = [...SEED_SUPPLY_CHAINS];

function generateId(): string {
  return `supply_chain_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllSupplyChains(): SupplyChainInterface[] {
  return [...supplyChains];
}

export function getSupplyChainById(id: string): SupplyChainInterface | undefined {
  return supplyChains.find((item) => item.id === id);
}

export function isSupplyChainCodeTaken(code: string, excludeId?: string): boolean {
  return supplyChains.some(
    (item) => item.code === code.toUpperCase() && item.id !== excludeId,
  );
}

export function createSupplyChain(input: CreateSupplyChainInput): SupplyChainInterface {
  const now = new Date().toISOString();
  const code = input.code.toUpperCase();

  const chain: SupplyChainInterface = {
    id: generateId(),
    name: input.name.trim(),
    code,
    description: input.description?.trim() || undefined,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };

  supplyChains = [...supplyChains, chain];
  return chain;
}

export function updateSupplyChain(
  id: string,
  input: UpdateSupplyChainInput,
): SupplyChainInterface | undefined {
  const index = supplyChains.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  const existing = supplyChains[index];
  if (!existing) {
    return undefined;
  }

  const updated: SupplyChainInterface = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    code: input.code ? input.code.toUpperCase() : existing.code,
    description:
      input.description !== undefined
        ? input.description.trim() || undefined
        : existing.description,
    status: input.status ?? existing.status,
    updatedAt: new Date().toISOString(),
  };

  supplyChains = supplyChains.map((item) => (item.id === id ? updated : item));
  return updated;
}

export function deleteSupplyChain(id: string): boolean {
  const before = supplyChains.length;
  supplyChains = supplyChains.filter((item) => item.id !== id);
  return supplyChains.length < before;
}

/** Reset store to seed data — useful for tests only. */
export function resetSupplyChainsMockStore(): void {
  supplyChains = [...SEED_SUPPLY_CHAINS];
}
