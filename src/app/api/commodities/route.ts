import {
  createCommoditySchema,
  type CreateCommoditySchemaInput,
} from "@/lib/validation/schemas/commodity.schema";
import { validate } from "@/lib/validation";
import { createCommodity, getAllCommodities } from "@/mocks/data/commodities";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type {
  GetCommoditiesOutput,
  GetCommodityOutput,
} from "@/types/commodity.interface";

export async function GET(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/commodities" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to list commodities" });
    }
  }

  return withMockDelay({
    handler: (): Response => {
      const items = getAllCommodities();
      const output: GetCommoditiesOutput = {
        commodities: items,
        total: items.length,
      };
      return jsonResponse({ data: output });
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/commodities" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to create commodity" });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const body: unknown = await request.json();
        const input = validate<CreateCommoditySchemaInput>({
          schema: createCommoditySchema,
          data: body,
          label: "commodity",
        });

        const commodity = createCommodity({
          name: input.name,
          unit: input.unit as GetCommodityOutput["unit"],
          imageFileName: input.imageFileName || undefined,
        });

        return jsonResponse({ data: commodity, status: 201 });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to create commodity" });
      }
    },
  });
}
