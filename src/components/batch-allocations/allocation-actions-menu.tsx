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
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";

export interface AllocationActionsMenuProps {
  allocation: BatchAllocationInterface;
  onEdit: (allocation: BatchAllocationInterface) => void;
  onDelete: (allocation: BatchAllocationInterface) => void;
}

/**
 * AllocationActionsMenu
 *
 * Row action menu for edit and delete on a batch allocation.
 */
export function AllocationActionsMenu({
  allocation,
  onEdit,
  onDelete,
}: AllocationActionsMenuProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">Open allocation menu</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(): void => onEdit(allocation)}>
            <PencilIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={(): void => onDelete(allocation)}
          >
            <Trash2Icon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
