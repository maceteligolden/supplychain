import type { FarmLocationInterface } from "@/types/farm.interface";

/** Default empty location when the wizard location step is skipped. */
export function createEmptyFarmLocation(): FarmLocationInterface {
  return {
    country: "",
    region: "",
    city: "",
  };
}
