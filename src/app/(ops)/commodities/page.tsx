import { CommoditiesView } from "@/components/commodities/commodities-view";
import { getCommodities } from "@/services/commodities.service";

/**
 * Commodities management page — lists and CRUD for traceable commodities.
 */
export default async function CommoditiesPage(): Promise<React.JSX.Element> {
  const { commodities } = await getCommodities();
  return <CommoditiesView commodities={commodities} />;
}
