import { createAppError } from "@/lib/errors";
import {
  createSupplyChainSchema,
  type CreateSupplyChainSchemaInput,
} from "@/lib/validation/schemas/supply-chain.schema";
import { validate } from "@/lib/validation";
import {
  createSupplyChain,
  getAllSupplyChains,
  isSupplyChainCodeTaken,
} from "@/mocks/data/supply-chains";
import { errorResponse, jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type {
  GetSupplyChainOutput,
  GetSupplyChainsOutput,
} from "@/types/supply-chain.interface";

export async function GET(): Promise<Response> {
  return withMockDelay({
    handler: (): Response => {
      const items = getAllSupplyChains();
      const output: GetSupplyChainsOutput = {
        supplyChains: items,
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
        const input = validate<CreateSupplyChainSchemaInput>({
          schema: createSupplyChainSchema,
          data: body,
          label: "supply chain",
        });

        if (isSupplyChainCodeTaken(input.code)) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Supply chain code already exists",
            statusCode: 400,
            details: { issues: [{ path: "code", message: "Code must be unique" }] },
          });
        }

        const supplyChain = createSupplyChain({
          name: input.name,
          code: input.code,
          description: input.description || undefined,
          status: input.status as GetSupplyChainOutput["status"],
        });

        return jsonResponse({ data: supplyChain, status: 201 });
      } catch (error) {
        return errorResponse({
          error,
          fallbackMessage: "Failed to create supply chain",
        });
      }
    },
  });
}
