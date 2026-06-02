/**
 * Single source of truth for all page/navigation paths.
 * Sidebar links, Next.js Link hrefs, and redirects must reference this file only.
 */
export const PAGE_ROUTES = {
  login: "/login",
  dashboard: "/",
  commodities: "/commodities",
  farms: "/farms",
  actors: "/actors",
  batches: "/batches",
  supplyChains: "/supply-chains",
  events: "/events",
  traceability: "/traceability",
  reports: "/reports",
} as const;

export type PageRouteKey = keyof typeof PAGE_ROUTES;

/** Routes enabled in the sidebar during the current POC phase. */
export const ACTIVE_NAV_ROUTES: PageRouteKey[] = ["dashboard"];
