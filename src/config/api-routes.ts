/**
 * Single source of truth for all API path constants.
 * Services and route handlers must reference this file only — never hardcode URLs.
 */
export const API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
  },
  dashboard: {
    summary: "/api/dashboard/summary",
  },
  commodities: {
    list: "/api/commodities",
    detail: (id: string): string => `/api/commodities/${id}`,
  },
  farms: {
    list: "/api/farms",
    detail: (id: string): string => `/api/farms/${id}`,
  },
  supplyChains: {
    list: "/api/supply-chains",
    detail: (id: string): string => `/api/supply-chains/${id}`,
  },
  batches: {
    list: (farmId: string): string => `/api/batches?farmId=${farmId}`,
    detail: (id: string): string => `/api/batches/${id}`,
  },
  batchAllocations: {
    list: (farmId: string): string => `/api/batch-allocations?farmId=${farmId}`,
    detail: (id: string): string => `/api/batch-allocations/${id}`,
  },
} as const;
