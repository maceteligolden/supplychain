import { createAppError } from "@/lib/errors";
import {
  createFarmSchema,
  type CreateFarmSchemaInput,
} from "@/lib/validation/schemas/farm.schema";
import { validate } from "@/lib/validation";
import {
  areCommoditiesLinked,
  createFarm,
  getAllFarms,
  isFarmCodeTaken,
} from "@/mocks/data/farms";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type { GetFarmsOutput } from "@/types/farm.interface";

export async function GET(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/farms" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to list farms" });
    }
  }

  return withMockDelay({
    handler: (): Response => {
      const items = getAllFarms();
      const output: GetFarmsOutput = {
        farms: items,
        total: items.length,
      };
      return jsonResponse({ data: output });
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/farms" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to create farm" });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const body: unknown = await request.json();
        const input = validate<CreateFarmSchemaInput>({
          schema: createFarmSchema,
          data: body,
          label: "farm",
        });

        if (isFarmCodeTaken(input.code)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Farm code already exists",
            statusCode: 400,
            details: { issues: [{ path: "code", message: "Code must be unique" }] },
          });
        }

        if (!areCommoditiesLinked(input.commodityIds)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "One or more selected commodities do not exist",
            statusCode: 400,
            details: {
              issues: [{ path: "commodityIds", message: "All commodities must exist" }],
            },
          });
        }

        const farm = createFarm({
          name: input.name,
          code: input.code,
          status: input.status ?? "DRAFT",
          owner: input.owner,
          commodityIds: input.commodityIds,
          location: input.location,
          annualProductionEstimateKg: input.annualProductionEstimateKg,
          areaHectares: input.areaHectares,
          declarationAccepted: input.declarationAccepted,
        });

        return jsonResponse({ data: farm, status: 201 });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to create farm" });
      }
    },
  });
}
