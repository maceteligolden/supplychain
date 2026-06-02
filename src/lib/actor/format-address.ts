import type { ActorInterface } from "@/types/actor.interface";

/**
 * Formats an actor address for display in lists and event timelines.
 */
export function formatActorAddress(actor: ActorInterface): string {
  const parts = [
    actor.address.line1,
    actor.address.city,
    actor.address.region,
    actor.address.country,
  ].filter(Boolean);

  return parts.join(", ");
}
