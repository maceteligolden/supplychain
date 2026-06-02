import { getActorById } from "@/mocks/data/actors";
import { getAllSupplyChainEvents } from "@/mocks/data/supply-chain-events";
import { getSupplyChainById } from "@/mocks/data/supply-chains";
import type { ActorInvolvementInterface } from "@/types/actor-involvement.interface";

/** Returns actor profile plus supply chain involvement derived from events. */
export function getActorInvolvement(actorId: string): ActorInvolvementInterface | null {
  const actor = getActorById(actorId);
  if (!actor) {
    return null;
  }

  const actorEvents = getAllSupplyChainEvents()
    .filter((event) => event.actorId === actorId)
    .sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

  const supplyChainIds = new Set<string>();
  const events = actorEvents.flatMap((event) => {
    const supplyChain = getSupplyChainById(event.supplyChainId);
    if (!supplyChain) {
      return [];
    }

    supplyChainIds.add(supplyChain.id);
    return [{ event, supplyChain }];
  });

  const supplyChains = Array.from(supplyChainIds)
    .map((id) => getSupplyChainById(id))
    .filter((chain): chain is NonNullable<typeof chain> => Boolean(chain));

  return {
    actor,
    events,
    supplyChains,
    stats: {
      eventCount: events.length,
      supplyChainCount: supplyChains.length,
    },
  };
}
