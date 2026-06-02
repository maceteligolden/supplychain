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
import type { CommodityInterface } from "@/types/commodity.interface";

export interface CommodityActionsMenuProps {
  /** Commodity the actions apply to. */
  commodity: CommodityInterface;
  /** Called when the user chooses to edit. */
  onEdit: (commodity: CommodityInterface) => void;
  /** Called when the user chooses to delete. */
  onDelete: (commodity: CommodityInterface) => void;
  /** Button variant for the trigger — ghost for table rows, outline for cards. */
  triggerVariant?: "ghost" | "outline";
}

/**
 * CommodityActionsMenu
 *
 * Row/card action menu for edit and delete on a commodity.
 */
export function CommodityActionsMenu({
  commodity,
  onEdit,
  onDelete,
  triggerVariant = "ghost",
}: CommodityActionsMenuProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={triggerVariant} size="icon-sm">
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">Open menu for {commodity.name}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(): void => onEdit(commodity)}>
            <PencilIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={(): void => onDelete(commodity)}
          >
            <Trash2Icon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
