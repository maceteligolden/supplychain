"use client";

import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ActorInterface } from "@/types/actor.interface";

export interface ActorActionsMenuProps {
  /** Actor the actions apply to. */
  actor: ActorInterface;
  /** Called when the user chooses to edit. */
  onEdit: (actor: ActorInterface) => void;
  /** Called when the user chooses to delete. */
  onDelete: (actor: ActorInterface) => void;
  triggerVariant?: "ghost" | "outline";
}

/**
 * ActorActionsMenu
 *
 * Row/card action menu for edit and delete on an actor.
 */
export function ActorActionsMenu({
  actor,
  onEdit,
  onDelete,
  triggerVariant = "ghost",
}: ActorActionsMenuProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={triggerVariant} size="icon-sm">
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">Open menu for {actor.name}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(): void => onEdit(actor)}>
            <PencilIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={(): void => onDelete(actor)}>
            <Trash2Icon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
