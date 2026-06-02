import { createAppError } from "@/lib/errors";
import {
  createFarmSchema,
  type CreateFarmSchemaInput,
} from "@/lib/validation/schemas/farm.schema";
import { validate } from "@/lib/validation";
import {
  createFarm,
  getAllFarms,
  isCommodityLinked,
  isFarmCodeTaken,
} from "@/mocks/data/farms";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { GetFarmsOutput } from "@/types/farm.interface";

export async function GET(): Promise<Response> {
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

        if (!isCommodityLinked(input.commodityId)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Selected commodity does not exist",
            statusCode: 400,
            details: {
              issues: [{ path: "commodityId", message: "Commodity must exist" }],
            },
          });
        }

        const farm = createFarm({
          name: input.name,
          code: input.code,
          commodityId: input.commodityId,
          location: input.location,
        });

        return jsonResponse({ data: farm, status: 201 });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to create farm" });
      }
    },
  });
}
