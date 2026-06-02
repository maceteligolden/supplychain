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
} as const;
