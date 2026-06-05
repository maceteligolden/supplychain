"use client";

import Link from "next/link";

import { FarmActionsMenu } from "@/components/farms/farm-actions-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { farmDetailPage } from "@/config/page-routes";
import { FARM_STATUS_BADGE_VARIANT, FARM_STATUS_LABELS } from "@/config/farm-status";
import { formatFarmLocation } from "@/lib/farm/format-location";
import type { FarmInterface } from "@/types/farm.interface";

export interface FarmTableProps {
  /** Farms to display in the table. */
  farms: FarmInterface[];
  /** Maps commodity id to display name. */
  commodityNames: Record<string, string>;
  /** Called when the user chooses to edit a farm. */
  onEdit: (farm: FarmInterface) => void;
  /** Called when the user chooses to delete a farm. */
  onDelete: (farm: FarmInterface) => void;
  /** Message when no farms match the current filters. */
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
 * FarmTable
 *
 * Data table listing farms with name, code, commodity, location,
 * created date, and row actions for edit and delete.
 */
export function FarmTable({
  farms,
  commodityNames,
  onEdit,
  onDelete,
  emptyMessage = "No farms yet. Add your first farm to get started.",
}: FarmTableProps): React.JSX.Element {
  if (farms.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Commodities</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {farms.map((farm) => (
          <TableRow key={farm.id}>
            <TableCell className="font-medium">
              <Link
                href={farmDetailPage(farm.id)}
                className="text-foreground hover:underline"
              >
                {farm.name}
              </Link>
            </TableCell>
            <TableCell>
              <code className="text-xs">{farm.code}</code>
            </TableCell>
            <TableCell>
              <Badge variant={FARM_STATUS_BADGE_VARIANT[farm.status]}>
                {FARM_STATUS_LABELS[farm.status]}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {farm.commodityIds.map((commodityId) => (
                  <Badge key={commodityId} variant="secondary">
                    {commodityNames[commodityId] ?? "Unknown"}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground max-w-xs truncate">
              {formatFarmLocation(farm.location)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(farm.createdAt)}
            </TableCell>
            <TableCell>
              <FarmActionsMenu farm={farm} onEdit={onEdit} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
