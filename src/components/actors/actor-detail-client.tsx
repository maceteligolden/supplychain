"use client";

import { useState } from "react";

import { ActorDetailView } from "@/components/actors/actor-detail-view";
import { ActorFormDialog } from "@/components/actors/actor-form-dialog";
import type { ActorInvolvementInterface } from "@/types/actor-involvement.interface";

export interface ActorDetailClientProps {
  /** Actor involvement data for the detail view. */
  involvement: ActorInvolvementInterface;
}

/**
 * ActorDetailClient
 *
 * Client wrapper for actor detail — wires edit dialog to the detail view.
 */
export function ActorDetailClient({
  involvement,
}: ActorDetailClientProps): React.JSX.Element {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <ActorDetailView
        involvement={involvement}
        onEdit={(): void => setEditOpen(true)}
      />
      <ActorFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        actor={involvement.actor}
      />
    </>
  );
}
