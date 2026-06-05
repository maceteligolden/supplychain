import type { FarmOwnerInterface } from "@/types/farm.interface";

/** Default empty owner when the wizard owner step is skipped. */
export function createEmptyFarmOwner(): FarmOwnerInterface {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  };
}
