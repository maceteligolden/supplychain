"use client";

import { AllocationActionsMenu } from "@/components/batch-allocations/allocation-actions-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";

export interface AllocationTableProps {
  allocations: BatchAllocationInterface[];
  batchById: Record<string, BatchInterface>;
  supplyChainNames: Record<string, string>;
  onEdit: (allocation: BatchAllocationInterface) => void;
  onDelete: (allocation: BatchAllocationInterface) => void;
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
 * AllocationTable
 *
 * Lists batch allocations for a farm with batch and supply chain context.
 */
export function AllocationTable({
  allocations,
  batchById,
  supplyChainNames,
  onEdit,
  onDelete,
  emptyMessage = "No allocations yet. Allocate a batch to a supply chain.",
}: AllocationTableProps): React.JSX.Element {
  if (allocations.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Batch</TableHead>
          <TableHead>Supply chain</TableHead>
          <TableHead>Allocated</TableHead>
          <TableHead>Remaining on batch</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allocations.map((allocation) => {
          const batch = batchById[allocation.batchId];
          const batchTotal = batch?.quantity ?? 0;
          const allocatedOnBatch = allocations
            .filter((item) => item.batchId === allocation.batchId)
            .reduce((sum, item) => sum + item.quantity, 0);
          const remaining = Math.max(batchTotal - allocatedOnBatch, 0);

          return (
            <TableRow key={allocation.id}>
              <TableCell>
                <code className="text-xs">
                  {batch?.batchNumber ?? allocation.batchId}
                </code>
              </TableCell>
              <TableCell>
                {supplyChainNames[allocation.supplyChainId] ?? "Unknown"}
              </TableCell>
              <TableCell>
                {allocation.quantity.toLocaleString()} {batch?.unit ?? ""}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {remaining.toLocaleString()} {batch?.unit ?? ""}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(allocation.allocatedAt)}
              </TableCell>
              <TableCell>
                <AllocationActionsMenu
                  allocation={allocation}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
