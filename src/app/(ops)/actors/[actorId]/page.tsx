import { notFound } from "next/navigation";

import { ActorDetailClient } from "@/components/actors/actor-detail-client";
import type { GetActorInvolvementOutput } from "@/types/actor-involvement.interface";
import { getActorInvolvement } from "@/services/actors.service";

type ActorDetailPageProps = {
  params: Promise<{ actorId: string }>;
};

/**
 * Actor detail page — profile, supply chain involvement, and event history.
 */
export default async function ActorDetailPage({
  params,
}: ActorDetailPageProps): Promise<React.JSX.Element> {
  const { actorId } = await params;

  let involvement: GetActorInvolvementOutput;
  try {
    involvement = await getActorInvolvement(actorId);
  } catch {
    notFound();
  }

  return <ActorDetailClient involvement={involvement} />;
}
