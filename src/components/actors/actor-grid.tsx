"use client";

import { ActorActionsMenu } from "@/components/actors/actor-actions-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ACTOR_STATUS_LABELS, ACTOR_TYPE_LABELS } from "@/config/actor-types";
import { formatActorAddress } from "@/lib/actor/format-address";
import type { ActorInterface } from "@/types/actor.interface";

export interface ActorGridProps {
  actors: ActorInterface[];
  onEdit: (actor: ActorInterface) => void;
  onDelete: (actor: ActorInterface) => void;
  emptyMessage?: string;
}

/**
 * ActorGrid
 *
 * Card grid layout for actors.
 */
export function ActorGrid({
  actors,
  onEdit,
  onDelete,
  emptyMessage = "No actors yet. Add your first actor to get started.",
}: ActorGridProps): React.JSX.Element {
  if (actors.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {actors.map((actor) => (
        <Card key={actor.id} size="sm">
          <CardHeader>
            <CardTitle className="truncate">{actor.name}</CardTitle>
            <CardAction>
              <ActorActionsMenu
                actor={actor}
                onEdit={onEdit}
                onDelete={onDelete}
                triggerVariant="outline"
              />
            </CardAction>
          </CardHeader>
          <CardContent className="gap-card flex flex-col">
            <Badge variant="outline">{ACTOR_TYPE_LABELS[actor.type]}</Badge>
            <Badge variant={actor.status === "ACTIVE" ? "secondary" : "outline"}>
              {ACTOR_STATUS_LABELS[actor.status]}
            </Badge>
            <p className="text-muted-foreground text-sm">{formatActorAddress(actor)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
