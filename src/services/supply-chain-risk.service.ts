import { API_ROUTES } from "@/config/api-routes";
import { getAuthHeaders } from "@/services/auth-headers";
import { fetchJson } from "@/services/api-client";
import type { GetSupplyChainRiskSummaryOutput } from "@/types/supply-chain-risk.interface";

/** Returns deforestation risk summary for a supply chain. */
export async function getSupplyChainRiskSummary(
  supplyChainId: string,
): Promise<GetSupplyChainRiskSummaryOutput> {
  return fetchJson<GetSupplyChainRiskSummaryOutput>({
    url: API_ROUTES.supplyChains.riskSummary(supplyChainId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}
