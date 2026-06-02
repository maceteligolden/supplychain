import { FarmsView } from "@/components/farms/farms-view";
import { getCommodities } from "@/services/commodities.service";
import { getFarms } from "@/services/farms.service";

/**
 * Farms management page — lists and CRUD for traceability farms.
 */
export default async function FarmsPage(): Promise<React.JSX.Element> {
  const [{ farms }, { commodities }] = await Promise.all([
    getFarms(),
    getCommodities(),
  ]);

  return <FarmsView farms={farms} commodities={commodities} />;
}
