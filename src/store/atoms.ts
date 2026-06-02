import { atom } from "jotai";

export interface AppMetaInterface {
  /** Display name shown in the shell header. */
  appName: string;
  /** Short tagline for marketing surfaces. */
  tagline: string;
}

/** Global read-only app metadata used across layout and hero sections. */
export const appMetaAtom = atom<AppMetaInterface>({
  appName: "SupplyChain",
  tagline: "Track inventory, shipments, and fulfillment in one place.",
});

/** Whether the mobile navigation drawer is open. */
export const mobileNavOpenAtom = atom<boolean>(false);
