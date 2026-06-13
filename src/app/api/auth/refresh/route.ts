import { errorResponse, proxyRequest } from "@/lib/api/route-handler";
import { env } from "@/config/env";

export async function POST(request: Request): Promise<Response> {
  if (env.useMockApi) {
    return new Response(JSON.stringify({ user: null }), {
      status: 501,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    return await proxyRequest({ request, targetPath: "/api/v1/auth/refresh" });
  } catch (error) {
    return errorResponse({ error, fallbackMessage: "Session refresh failed" });
  }
}
