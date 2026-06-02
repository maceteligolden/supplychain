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
import type { BatchInterface } from "@/types/batch.interface";

export interface BatchActionsMenuProps {
  batch: BatchInterface;
  onEdit: (batch: BatchInterface) => void;
  onDelete: (batch: BatchInterface) => void;
  triggerVariant?: "ghost" | "outline";
}

/**
 * BatchActionsMenu
 *
 * Row action menu for edit and delete on a harvest batch.
 */
export function BatchActionsMenu({
  batch,
  onEdit,
  onDelete,
  triggerVariant = "ghost",
}: BatchActionsMenuProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={triggerVariant} size="icon-sm">
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">Open menu for {batch.batchNumber}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(): void => onEdit(batch)}>
            <PencilIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={(): void => onDelete(batch)}>
            <Trash2Icon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
