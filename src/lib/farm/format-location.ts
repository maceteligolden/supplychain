import type { FarmLocationInterface } from "@/types/farm.interface";

/**
 * Formats a farm location for compact list display.
 * Example: "Kumasi, Ashanti, Ghana"
 */
export function formatFarmLocation(location: FarmLocationInterface): string {
  return [location.city, location.region, location.country].filter(Boolean).join(", ");
}
