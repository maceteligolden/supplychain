import { createAppError } from "@/lib/errors";
import {
  updateCommoditySchema,
  type UpdateCommoditySchemaInput,
} from "@/lib/validation/schemas/commodity.schema";
import { validate } from "@/lib/validation";
import {
  deleteCommodity,
  getCommodityById,
  isCodeTaken,
  updateCommodity,
} from "@/mocks/data/commodities";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type {
  DeleteCommodityOutput,
  GetCommodityOutput,
} from "@/types/commodity.interface";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  if (!env.useMockApi) {
    try {
      const { id } = await context.params;
      return await proxyRequest({
        request,
        targetPath: `/api/v1/commodities/${id}`,
      });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to get commodity" });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const commodity = getCommodityById(id);

        if (!commodity) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Commodity not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: commodity });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to get commodity" });
      }
    },
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (!env.useMockApi) {
    try {
      const { id } = await context.params;
      return await proxyRequest({
        request,
        targetPath: `/api/v1/commodities/${id}`,
      });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to update commodity" });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const existing = getCommodityById(id);

        if (!existing) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Commodity not found",
            statusCode: 404,
          });
        }

        const body: unknown = await request.json();
        const input = validate<UpdateCommoditySchemaInput>({
          schema: updateCommoditySchema,
          data: body,
          label: "commodity update",
        });

        if (input.code && isCodeTaken(input.code, id)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Commodity code already exists",
            statusCode: 400,
            details: { issues: [{ path: "code", message: "Code must be unique" }] },
          });
        }

        const updated = updateCommodity(id, {
          name: input.name,
          code: input.code,
          unit: input.unit as GetCommodityOutput["unit"] | undefined,
          imageFileName: input.imageFileName || undefined,
        });

        if (!updated) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Commodity not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: updated });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to update commodity" });
      }
    },
  });
}

export async function DELETE(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (!env.useMockApi) {
    try {
      const { id } = await context.params;
      return await proxyRequest({
        request,
        targetPath: `/api/v1/commodities/${id}`,
      });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to delete commodity" });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const deleted = deleteCommodity(id);

        if (!deleted) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Commodity not found",
            statusCode: 404,
          });
        }

        const output: DeleteCommodityOutput = { success: true, id };
        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to delete commodity" });
      }
    },
  });
}
