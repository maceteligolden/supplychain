import { atom } from "jotai";

export interface AppMetaInterface {
  /** Display name shown in the shell header. */
  appName: string;
  /** Short tagline for marketing surfaces. */
  tagline: string;
}

/** Global read-only app metadata used across layout and auth pages. */
export const appMetaAtom = atom<AppMetaInterface>({
  appName: "Traceability Platform",
  tagline: "Farm-to-export supply chain traceability",
});

/** Whether the mobile navigation drawer is open. */
export const mobileNavOpenAtom = atom<boolean>(false);

/** Whether the desktop sidebar is collapsed to icon-only mode. */
export const sidebarCollapsedAtom = atom<boolean>(false);
