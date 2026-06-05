import type { FarmOwnerInterface } from "@/types/farm.interface";

/** Returns true when owner contact fields are all empty (skipped wizard step). */
export function isFarmOwnerEmpty(owner: FarmOwnerInterface): boolean {
  return (
    !owner.firstName.trim() &&
    !owner.lastName.trim() &&
    !owner.phone.trim() &&
    !owner.email.trim()
  );
}

/** Formats farm owner for display, or a placeholder when not provided. */
export function formatFarmOwner(owner: FarmOwnerInterface): string {
  if (isFarmOwnerEmpty(owner)) {
    return "Not provided";
  }

  const name = [owner.firstName, owner.lastName].filter(Boolean).join(" ").trim();
  const parts = [name, owner.phone, owner.email].filter(
    (part) => part.trim().length > 0,
  );
  return parts.join(" · ");
}
