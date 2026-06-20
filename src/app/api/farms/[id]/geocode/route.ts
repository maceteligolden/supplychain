import { errorResponse, proxyRequest } from "@/lib/api/route-handler";
import { env } from "@/config/env";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  if (!env.useMockApi) {
    try {
      const { id } = await context.params;
      return await proxyRequest({
        request,
        targetPath: `/api/v1/farms/${id}/geocode`,
      });
    } catch (error) {
      return errorResponse({
        error,
        fallbackMessage: "Failed to geocode farm address",
      });
    }
  }

  return errorResponse({
    error: new Error("Geocode is only available when using the real API"),
    fallbackMessage: "Geocode is only available when using the real API",
  });
}
