import { ActorsView } from "@/components/actors/actors-view";
import { getActors } from "@/services/actors.service";

/**
 * Actors management page — CRUD for supply chain participants.
 */
export default async function ActorsPage(): Promise<React.JSX.Element> {
  const { actors } = await getActors();
  return <ActorsView actors={actors} />;
}
