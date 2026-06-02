"use client";

import Link from "next/link";

import { ActorActionsMenu } from "@/components/actors/actor-actions-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ACTOR_STATUS_LABELS, ACTOR_TYPE_LABELS } from "@/config/actor-types";
import { actorDetailPage } from "@/config/page-routes";
import { formatActorAddress } from "@/lib/actor/format-address";
import type { ActorInterface } from "@/types/actor.interface";

export interface ActorTableProps {
  actors: ActorInterface[];
  onEdit: (actor: ActorInterface) => void;
  onDelete: (actor: ActorInterface) => void;
  emptyMessage?: string;
}

/**
 * ActorTable
 *
 * Data table listing actors with name, type, address, status, and actions.
 */
export function ActorTable({
  actors,
  onEdit,
  onDelete,
  emptyMessage = "No actors yet. Add your first actor to get started.",
}: ActorTableProps): React.JSX.Element {
  if (actors.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actors.map((actor) => (
          <TableRow key={actor.id}>
            <TableCell className="font-medium">
              <Link href={actorDetailPage(actor.id)} className="hover:underline">
                {actor.name}
              </Link>
            </TableCell>
            <TableCell>{ACTOR_TYPE_LABELS[actor.type]}</TableCell>
            <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
              {formatActorAddress(actor)}
            </TableCell>
            <TableCell>
              <Badge variant={actor.status === "ACTIVE" ? "secondary" : "outline"}>
                {ACTOR_STATUS_LABELS[actor.status]}
              </Badge>
            </TableCell>
            <TableCell>
              <ActorActionsMenu actor={actor} onEdit={onEdit} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
