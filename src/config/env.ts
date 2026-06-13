import Joi from "joi";

import { validate } from "@/lib/validation";

export interface EnvInterface {
  /** When true, API routes return mock data instead of proxying. */
  useMockApi: boolean;
  /** Base URL for proxying to the real backend (server-side). */
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
  API_PROXY_TARGET: Joi.string().uri().allow("").default(""),
  MOCK_DELAY_MS: Joi.string().pattern(/^\d+$/).default("200"),
  NEXT_PUBLIC_APP_URL: Joi.string().uri().default("http://localhost:3000"),
  SESSION_COOKIE_NAME: Joi.string().default("sc_session"),
  SESSION_MAX_AGE_SECONDS: Joi.string().pattern(/^\d+$/).default("86400"),
  SESSION_SECRET: Joi.string().min(16).default("traceability-poc-dev-secret"),
  ACCESS_COOKIE_NAME: Joi.string().default("sc_access"),
  REFRESH_COOKIE_NAME: Joi.string().default("sc_refresh"),
  JWT_SECRET: Joi.string().min(1).default("change-me-in-production"),
});

type ParseEnvInput = Record<string, string | undefined>;

type EnvSchemaOutput = {
  NEXT_PUBLIC_USE_MOCK_API: string;
  API_PROXY_TARGET: string;
  MOCK_DELAY_MS: string;
  NEXT_PUBLIC_APP_URL: string;
  SESSION_COOKIE_NAME: string;
  SESSION_MAX_AGE_SECONDS: string;
  SESSION_SECRET: string;
  ACCESS_COOKIE_NAME: string;
  REFRESH_COOKIE_NAME: string;
  JWT_SECRET: string;
};

function parseEnv(raw: ParseEnvInput): EnvInterface {
  const parsed = validate<EnvSchemaOutput>({
    schema: envSchema,
    data: raw,
    label: "environment variables",
  });

  return {
    useMockApi: parsed.NEXT_PUBLIC_USE_MOCK_API === "true",
    apiBaseUrl: parsed.API_PROXY_TARGET,
    mockDelayMs: Number(parsed.MOCK_DELAY_MS),
    appUrl: parsed.NEXT_PUBLIC_APP_URL,
    sessionCookieName: parsed.SESSION_COOKIE_NAME,
    sessionMaxAgeSeconds: Number(parsed.SESSION_MAX_AGE_SECONDS),
    sessionSecret: parsed.SESSION_SECRET,
    accessCookieName: parsed.ACCESS_COOKIE_NAME,
    refreshCookieName: parsed.REFRESH_COOKIE_NAME,
    jwtSecret: parsed.JWT_SECRET,
  };
}

/** Validated environment config — the only module that reads process.env. */
export const env: EnvInterface = parseEnv({
  NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
  API_PROXY_TARGET: process.env.API_PROXY_TARGET,
  MOCK_DELAY_MS: process.env.MOCK_DELAY_MS,
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.URL ?? process.env.DEPLOY_PRIME_URL,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS: process.env.SESSION_MAX_AGE_SECONDS,
  SESSION_SECRET: process.env.SESSION_SECRET,
  ACCESS_COOKIE_NAME: process.env.ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
});
