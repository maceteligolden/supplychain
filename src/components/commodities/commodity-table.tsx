"use client";

import { CommodityActionsMenu } from "@/components/commodities/commodity-actions-menu";
import { CommodityThumbnail } from "@/components/commodities/commodity-thumbnail";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CommodityInterface } from "@/types/commodity.interface";

export interface CommodityTableProps {
  /** Commodities to display in the table. */
  commodities: CommodityInterface[];
  /** Called when the user chooses to edit a commodity. */
  onEdit: (commodity: CommodityInterface) => void;
  /** Called when the user chooses to delete a commodity. */
  onDelete: (commodity: CommodityInterface) => void;
  /** Message when no commodities match the current filters. */
  emptyMessage?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * CommodityTable
 *
 * Data table listing commodities with thumbnail, name, code, unit,
 * created date, and row actions for edit and delete.
 */
export function CommodityTable({
  commodities,
  onEdit,
  onDelete,
  emptyMessage = "No commodities yet. Add your first commodity to get started.",
}: CommodityTableProps): React.JSX.Element {
  if (commodities.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commodities.map((commodity) => (
          <TableRow key={commodity.id}>
            <TableCell>
              <div className="bg-muted relative flex size-10 items-center justify-center overflow-hidden rounded-md">
                <CommodityThumbnail
                  name={commodity.name}
                  imageUrl={commodity.imageUrl}
                />
              </div>
            </TableCell>
            <TableCell className="font-medium">{commodity.name}</TableCell>
            <TableCell>
              <code className="text-xs">{commodity.code}</code>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{commodity.unit}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(commodity.createdAt)}
            </TableCell>
            <TableCell>
              <CommodityActionsMenu
                commodity={commodity}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
