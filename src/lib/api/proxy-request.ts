import { env } from "@/config/env";
import { createAppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

type ProxyRequestInput = {
  request: Request;
  targetPath: string;
};

type BackendSuccessBodyInterface = {
  success: true;
  data: unknown;
  message?: string;
};

type BackendErrorBodyInterface = {
  success: false;
  message: string;
  details?: unknown;
};

function mapBackendError(statusCode: number, body: BackendErrorBodyInterface): never {
  throw createAppError({
    code:
      statusCode === 401
        ? "UNAUTHORIZED"
        : statusCode === 404
          ? "NOT_FOUND"
          : "INTERNAL_ERROR",
    message: body.message,
    statusCode,
    details:
      body.details && typeof body.details === "object"
        ? (body.details as Record<string, unknown>)
        : undefined,
  });
}

function collectSetCookieHeaders(backendResponse: Response): string[] {
  if (typeof backendResponse.headers.getSetCookie === "function") {
    return backendResponse.headers.getSetCookie();
  }

  const singleCookie = backendResponse.headers.get("set-cookie");
  return singleCookie ? [singleCookie] : [];
}

function buildProxyHeaders(request: Request): Headers {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  return headers;
}

async function readProxyRequestBody(request: Request): Promise<BodyInit | undefined> {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    return request.arrayBuffer();
  }

  return request.text();
}

/**
 * Builds the backend URL, forwarding query params from the incoming request.
 */
function buildTargetUrl(request: Request, targetPath: string): string {
  const incomingSearch = new URL(request.url).search;

  if (!incomingSearch || targetPath.includes("?")) {
    return `${env.apiBaseUrl}${targetPath}`;
  }

  return `${env.apiBaseUrl}${targetPath}${incomingSearch}`;
}

/**
 * Proxies a Next.js API request to the real backend and forwards cookies.
 */
export async function proxyRequest(input: ProxyRequestInput): Promise<Response> {
  // #region agent log
  fetch("http://127.0.0.1:7635/ingest/f1cde6f2-f277-47a6-90de-e69cad7d975b", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "72dc51" },
    body: JSON.stringify({
      sessionId: "72dc51",
      hypothesisId: "D-E",
      location: "lib/api/proxy-request.ts:entry",
      message: "proxyRequest invoked",
      data: {
        targetPath: input.targetPath,
        method: input.request.method,
        apiBaseUrlSet: Boolean(env.apiBaseUrl),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!env.apiBaseUrl) {
    logger.warn("API proxy target is not configured", {
      namespace: "api",
      meta: { targetPath: input.targetPath },
    });
    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "Real backend proxy is not configured",
      statusCode: 501,
    });
  }

  const targetUrl = buildTargetUrl(input.request, input.targetPath);
  const requestBody = await readProxyRequestBody(input.request);

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, {
      method: input.request.method,
      headers: buildProxyHeaders(input.request),
      body: requestBody,
    });
  } catch (fetchError) {
    // #region agent log
    let targetHost = "invalid-url";
    try {
      targetHost = new URL(targetUrl).host;
    } catch {
      // keep invalid-url
    }
    fetch("http://127.0.0.1:7635/ingest/f1cde6f2-f277-47a6-90de-e69cad7d975b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "72dc51" },
      body: JSON.stringify({
        sessionId: "72dc51",
        hypothesisId: "E",
        location: "lib/api/proxy-request.ts:fetch-error",
        message: "Backend fetch failed",
        data: {
          targetHost,
          error: fetchError instanceof Error ? fetchError.message : "unknown",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw fetchError;
  }

  // #region agent log
  fetch("http://127.0.0.1:7635/ingest/f1cde6f2-f277-47a6-90de-e69cad7d975b", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "72dc51" },
    body: JSON.stringify({
      sessionId: "72dc51",
      hypothesisId: "E",
      location: "lib/api/proxy-request.ts:fetch-ok",
      message: "Backend fetch completed",
      data: {
        targetHost: new URL(targetUrl).host,
        status: backendResponse.status,
        ok: backendResponse.ok,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const rawBody = await backendResponse.text();
  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json");

  for (const setCookieHeader of collectSetCookieHeaders(backendResponse)) {
    responseHeaders.append("Set-Cookie", setCookieHeader);
  }

  if (!backendResponse.ok) {
    let errorBody: BackendErrorBodyInterface | null = null;
    try {
      errorBody = JSON.parse(rawBody) as BackendErrorBodyInterface;
    } catch {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "Backend request failed",
        statusCode: backendResponse.status,
      });
    }

    if (errorBody.success === false) {
      mapBackendError(backendResponse.status, errorBody);
    }

    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "Backend request failed",
      statusCode: backendResponse.status,
    });
  }

  let responseData: unknown = rawBody ? JSON.parse(rawBody) : null;

  if (
    responseData &&
    typeof responseData === "object" &&
    "success" in responseData &&
    (responseData as BackendSuccessBodyInterface).success === true
  ) {
    responseData = (responseData as BackendSuccessBodyInterface).data;
  }

  return new Response(JSON.stringify(responseData), {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}
