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
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface SupplyChainActionsMenuProps {
  /** Supply chain the actions apply to. */
  supplyChain: SupplyChainInterface;
  /** Called when the user chooses to edit. */
  onEdit: (supplyChain: SupplyChainInterface) => void;
  /** Called when the user chooses to delete. */
  onDelete: (supplyChain: SupplyChainInterface) => void;
  triggerVariant?: "ghost" | "outline";
}

/**
 * SupplyChainActionsMenu
 *
 * Row/card action menu for edit and delete on a supply chain.
 */
export function SupplyChainActionsMenu({
  supplyChain,
  onEdit,
  onDelete,
  triggerVariant = "ghost",
}: SupplyChainActionsMenuProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={triggerVariant} size="icon-sm">
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">Open menu for {supplyChain.name}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(): void => onEdit(supplyChain)}>
            <PencilIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={(): void => onDelete(supplyChain)}
          >
            <Trash2Icon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
