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
import type { FarmInterface } from "@/types/farm.interface";

export interface FarmActionsMenuProps {
  /** Farm the actions apply to. */
  farm: FarmInterface;
  /** Called when the user chooses to edit. */
  onEdit: (farm: FarmInterface) => void;
  /** Called when the user chooses to delete. */
  onDelete: (farm: FarmInterface) => void;
  /** Button variant for the trigger — ghost for table rows, outline for cards. */
  triggerVariant?: "ghost" | "outline";
}

/**
 * FarmActionsMenu
 *
 * Row/card action menu for edit and delete on a farm.
 */
export function FarmActionsMenu({
  farm,
  onEdit,
  onDelete,
  triggerVariant = "ghost",
}: FarmActionsMenuProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={triggerVariant} size="icon-sm">
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">Open menu for {farm.name}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(): void => onEdit(farm)}>
            <PencilIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={(): void => onDelete(farm)}>
            <Trash2Icon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
