import { API_ROUTES } from "@/config/api-routes";
import { getAuthHeaders } from "@/services/auth-headers";
import { fetchJson } from "@/services/api-client";
import type {
  CreateSupplyChainEventInput,
  GetSupplyChainEventOutput,
  GetSupplyChainEventsOutput,
  UpdateSupplyChainEventInput,
} from "@/types/supply-chain-event.interface";

/** Returns all events for a supply chain. */
export async function getSupplyChainEvents(
  supplyChainId: string,
): Promise<GetSupplyChainEventsOutput> {
  return fetchJson<GetSupplyChainEventsOutput>({
    url: API_ROUTES.supplyChains.events(supplyChainId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Creates a supply chain lifecycle event. */
export async function createSupplyChainEvent(
  supplyChainId: string,
  input: CreateSupplyChainEventInput,
): Promise<GetSupplyChainEventOutput> {
  return fetchJson<GetSupplyChainEventOutput>({
    url: API_ROUTES.supplyChains.events(supplyChainId),
    options: {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Updates editable fields (notes, actorId) on an existing event. */
export async function updateSupplyChainEvent(
  supplyChainId: string,
  eventId: string,
  input: UpdateSupplyChainEventInput,
): Promise<GetSupplyChainEventOutput> {
  return fetchJson<GetSupplyChainEventOutput>({
    url: API_ROUTES.supplyChains.eventDetail(supplyChainId, eventId),
    options: {
      method: "PATCH",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}
