import { createAppError } from "@/lib/errors";
import {
  updateSupplyChainSchema,
  type UpdateSupplyChainSchemaInput,
} from "@/lib/validation/schemas/supply-chain.schema";
import { validate } from "@/lib/validation";
import { isSupplyChainReferencedByAllocation } from "@/mocks/data/batch-allocations";
import {
  deleteSupplyChain,
  getSupplyChainById,
  isSupplyChainCodeTaken,
  updateSupplyChain,
} from "@/mocks/data/supply-chains";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type {
  DeleteSupplyChainOutput,
  GetSupplyChainOutput,
} from "@/types/supply-chain.interface";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const supplyChain = getSupplyChainById(id);

        if (!supplyChain) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Supply chain not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: supplyChain });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to get supply chain" });
      }
    },
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;
        const existing = getSupplyChainById(id);

        if (!existing) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Supply chain not found",
            statusCode: 404,
          });
        }

        const body: unknown = await request.json();
        const input = validate<UpdateSupplyChainSchemaInput>({
          schema: updateSupplyChainSchema,
          data: body,
          label: "supply chain update",
        });

        if (input.code && isSupplyChainCodeTaken(input.code, id)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Supply chain code already exists",
            statusCode: 400,
            details: { issues: [{ path: "code", message: "Code must be unique" }] },
          });
        }

        const updated = updateSupplyChain(id, {
          name: input.name,
          code: input.code,
          description: input.description,
          status: input.status as GetSupplyChainOutput["status"] | undefined,
        });

        if (!updated) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Supply chain not found",
            statusCode: 404,
          });
        }

        return jsonResponse({ data: updated });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to update supply chain",
        });
      }
    },
  });
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const { id } = await context.params;

        if (isSupplyChainReferencedByAllocation(id)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Cannot delete supply chain with existing batch allocations",
            statusCode: 400,
          });
        }

        const deleted = deleteSupplyChain(id);

        if (!deleted) {
          throw createAppError({
            code: "NOT_FOUND",
            message: "Supply chain not found",
            statusCode: 404,
          });
        }

        const output: DeleteSupplyChainOutput = { success: true, id };
        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to delete supply chain",
        });
      }
    },
  });
}
