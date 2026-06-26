import Joi from "joi";

import { validate } from "@/lib/validation";

export interface EnvInterface {
  /** When true, API routes return mock data instead of proxying. */
  useMockApi: boolean;
  /** Base URL for proxying to the real backend. */
  apiBaseUrl: string;
  /** Simulated network latency in ms for mock responses. */
  mockDelayMs: number;
  /** Public app URL used for absolute fetch in server components. */
  appUrl: string;
  /** Mock httpOnly session cookie name. */
  sessionCookieName: string;
  /** Session max age in seconds for mock sessions. */
  sessionMaxAgeSeconds: number;
  /** Secret used to sign mock session tokens (server-only). */
  sessionSecret: string;
  /** Backend access JWT cookie name. */
  accessCookieName: string;
  /** Backend refresh token cookie name. */
  refreshCookieName: string;
  /** JWT secret shared with backend for edge access token verification. */
  jwtSecret: string;
}

const envSchema = Joi.object({
  NEXT_PUBLIC_USE_MOCK_API: Joi.string().valid("true", "false").default("true"),
  NEXT_PUBLIC_API_PROXY_TARGET: Joi.string().uri().allow("").default(""),
  NEXT_PUBLIC_MOCK_DELAY_MS: Joi.string().pattern(/^\d+$/).default("200"),
  NEXT_PUBLIC_APP_URL: Joi.string().uri().default("http://localhost:3000"),
  NEXT_PUBLIC_SESSION_COOKIE_NAME: Joi.string().default("sc_session"),
  NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS: Joi.string().pattern(/^\d+$/).default("86400"),
  NEXT_PUBLIC_SESSION_SECRET: Joi.string()
    .min(16)
    .default("traceability-poc-dev-secret"),
  NEXT_PUBLIC_ACCESS_COOKIE_NAME: Joi.string().default("sc_access"),
  NEXT_PUBLIC_REFRESH_COOKIE_NAME: Joi.string().default("sc_refresh"),
  NEXT_PUBLIC_JWT_SECRET: Joi.string().min(1).default("change-me-in-production"),
});

type ParseEnvInput = Record<string, string | undefined>;

type EnvSchemaOutput = {
  NEXT_PUBLIC_USE_MOCK_API: string;
  NEXT_PUBLIC_API_PROXY_TARGET: string;
  NEXT_PUBLIC_MOCK_DELAY_MS: string;
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_SESSION_COOKIE_NAME: string;
  NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS: string;
  NEXT_PUBLIC_SESSION_SECRET: string;
  NEXT_PUBLIC_ACCESS_COOKIE_NAME: string;
  NEXT_PUBLIC_REFRESH_COOKIE_NAME: string;
  NEXT_PUBLIC_JWT_SECRET: string;
};

function parseEnv(raw: ParseEnvInput): EnvInterface {
  const parsed = validate<EnvSchemaOutput>({
    schema: envSchema,
    data: raw,
    label: "environment variables",
  });

  return {
    useMockApi: parsed.NEXT_PUBLIC_USE_MOCK_API === "true",
    apiBaseUrl: parsed.NEXT_PUBLIC_API_PROXY_TARGET,
    mockDelayMs: Number(parsed.NEXT_PUBLIC_MOCK_DELAY_MS),
    appUrl: parsed.NEXT_PUBLIC_APP_URL,
    sessionCookieName: parsed.NEXT_PUBLIC_SESSION_COOKIE_NAME,
    sessionMaxAgeSeconds: Number(parsed.NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS),
    sessionSecret: parsed.NEXT_PUBLIC_SESSION_SECRET,
    accessCookieName: parsed.NEXT_PUBLIC_ACCESS_COOKIE_NAME,
    refreshCookieName: parsed.NEXT_PUBLIC_REFRESH_COOKIE_NAME,
    jwtSecret: parsed.NEXT_PUBLIC_JWT_SECRET,
  };
}

/** Validated environment config — the only module that reads process.env. */
export const env: EnvInterface = parseEnv({
  NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
  NEXT_PUBLIC_API_PROXY_TARGET: process.env.NEXT_PUBLIC_API_PROXY_TARGET,
  NEXT_PUBLIC_MOCK_DELAY_MS: process.env.NEXT_PUBLIC_MOCK_DELAY_MS,
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.URL ?? process.env.DEPLOY_PRIME_URL,
  NEXT_PUBLIC_SESSION_COOKIE_NAME: process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME,
  NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS: process.env.NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NEXT_PUBLIC_ACCESS_COOKIE_NAME: process.env.NEXT_PUBLIC_ACCESS_COOKIE_NAME,
  NEXT_PUBLIC_REFRESH_COOKIE_NAME: process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
});

// #region agent log
if (typeof process !== "undefined") {
  fetch("http://127.0.0.1:7635/ingest/f1cde6f2-f277-47a6-90de-e69cad7d975b", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "72dc51" },
    body: JSON.stringify({
      sessionId: "72dc51",
      hypothesisId: "A-B-D",
      location: "config/env.ts:module-load",
      message: "Resolved env for BFF proxy",
      data: {
        useMockApi: env.useMockApi,
        apiBaseUrlSet: Boolean(env.apiBaseUrl),
        apiBaseUrlHost: env.apiBaseUrl ? new URL(env.apiBaseUrl).host : null,
        rawUseMockApi: process.env.USE_MOCK_API ?? null,
        rawNextPublicUseMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API ?? null,
        rawApiProxyTarget: process.env.API_PROXY_TARGET ? "[set]" : null,
        rawNextPublicApiProxyTarget: process.env.NEXT_PUBLIC_API_PROXY_TARGET
          ? "[set]"
          : null,
        netlify: process.env.NETLIFY ?? null,
        context: process.env.CONTEXT ?? null,
        nodeEnv: process.env.NODE_ENV ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion
