import { SupplyChainsView } from "@/components/supply-chains/supply-chains-view";
import { getSupplyChains } from "@/services/supply-chains.service";

/**
 * Supply chains management page — CRUD for traceability routes.
 */
export default async function SupplyChainsPage(): Promise<React.JSX.Element> {
  const { supplyChains } = await getSupplyChains();
  return <SupplyChainsView supplyChains={supplyChains} />;
}
