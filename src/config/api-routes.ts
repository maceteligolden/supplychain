/**
 * Single source of truth for all API path constants.
 * Services and route handlers must reference this file only — never hardcode URLs.
 */
export const API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
    refresh: "/api/auth/refresh",
  },
  dashboard: {
    summary: "/api/dashboard/summary",
  },
  commodities: {
    list: "/api/commodities",
    detail: (id: string): string => `/api/commodities/${id}`,
  },
  actors: {
    list: "/api/actors",
    detail: (id: string): string => `/api/actors/${id}`,
    involvement: (id: string): string => `/api/actors/${id}/involvement`,
  },
  farms: {
    list: "/api/farms",
    detail: (id: string): string => `/api/farms/${id}`,
    boundary: (id: string): string => `/api/farms/${id}/boundary`,
    assessments: (id: string): string => `/api/farms/${id}/assessments`,
    assessmentDetail: (id: string, assessmentId: string): string =>
      `/api/farms/${id}/assessments/${assessmentId}`,
    landCoverTimeline: (id: string): string => `/api/farms/${id}/land-cover-timeline`,
  },
  supplyChains: {
    list: "/api/supply-chains",
    detail: (id: string): string => `/api/supply-chains/${id}`,
    allocations: (id: string): string => `/api/supply-chains/${id}/allocations`,
    report: (id: string): string => `/api/supply-chains/${id}/report`,
    riskSummary: (id: string): string => `/api/supply-chains/${id}/risk-summary`,
    events: (id: string): string => `/api/supply-chains/${id}/events`,
    eventDetail: (id: string, eventId: string): string =>
      `/api/supply-chains/${id}/events/${eventId}`,
  },
  batches: {
    list: (farmId: string): string => `/api/batches?farmId=${farmId}`,
    detail: (id: string): string => `/api/batches/${id}`,
  },
  batchAllocations: {
    listByFarm: (farmId: string): string => `/api/batch-allocations?farmId=${farmId}`,
    listBySupplyChain: (supplyChainId: string): string =>
      `/api/batch-allocations?supplyChainId=${supplyChainId}`,
    detail: (id: string): string => `/api/batch-allocations/${id}`,
  },
} as const;
