"use client";

import { BatchActionsMenu } from "@/components/batches/batch-actions-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BATCH_STATUS_LABELS } from "@/config/batch-status";
import type { BatchInterface } from "@/types/batch.interface";

export interface BatchTableProps {
  batches: BatchInterface[];
  onEdit: (batch: BatchInterface) => void;
  onDelete: (batch: BatchInterface) => void;
  emptyMessage?: string;
}

/**
 * BatchTable
 *
 * Data table listing harvest batches for a farm.
 */
export function BatchTable({
  batches,
  onEdit,
  onDelete,
  emptyMessage = "No batches yet. Record your first harvest batch.",
}: BatchTableProps): React.JSX.Element {
  if (batches.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Batch number</TableHead>
          <TableHead>Harvest date</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((batch) => (
          <TableRow key={batch.id}>
            <TableCell>
              <code className="text-xs">{batch.batchNumber}</code>
            </TableCell>
            <TableCell>{batch.harvestDate}</TableCell>
            <TableCell>
              {batch.quantity.toLocaleString()} {batch.unit}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{BATCH_STATUS_LABELS[batch.status]}</Badge>
            </TableCell>
            <TableCell>
              <BatchActionsMenu batch={batch} onEdit={onEdit} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
