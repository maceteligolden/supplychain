import { API_ROUTES } from "@/config/api-routes";
import { getAuthHeaders } from "@/services/auth-headers";
import { fetchJson } from "@/services/api-client";
import type { GetActorInvolvementOutput } from "@/types/actor-involvement.interface";
import type {
  CreateActorInput,
  DeleteActorOutput,
  GetActorOutput,
  GetActorsOutput,
  UpdateActorInput,
} from "@/types/actor.interface";

/** Returns all actors from the mock API. */
export async function getActors(): Promise<GetActorsOutput> {
  return fetchJson<GetActorsOutput>({
    url: API_ROUTES.actors.list,
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Returns a single actor by id. */
export async function getActorById(id: string): Promise<GetActorOutput> {
  return fetchJson<GetActorOutput>({
    url: API_ROUTES.actors.detail(id),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Returns actor profile and supply chain involvement. */
export async function getActorInvolvement(
  id: string,
): Promise<GetActorInvolvementOutput> {
  return fetchJson<GetActorInvolvementOutput>({
    url: API_ROUTES.actors.involvement(id),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Creates a new actor via the mock API. */
export async function createActor(input: CreateActorInput): Promise<GetActorOutput> {
  return fetchJson<GetActorOutput>({
    url: API_ROUTES.actors.list,
    options: {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Updates an existing actor via the mock API. */
export async function updateActor(
  id: string,
  input: UpdateActorInput,
): Promise<GetActorOutput> {
  return fetchJson<GetActorOutput>({
    url: API_ROUTES.actors.detail(id),
    options: {
      method: "PATCH",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Deletes an actor via the mock API. */
export async function deleteActor(id: string): Promise<DeleteActorOutput> {
  return fetchJson<DeleteActorOutput>({
    url: API_ROUTES.actors.detail(id),
    options: {
      method: "DELETE",
      headers: await getAuthHeaders(),
    },
  });
}
