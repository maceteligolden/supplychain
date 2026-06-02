"use client";

import Link from "next/link";
import { MapPinIcon } from "lucide-react";

import { FarmActionsMenu } from "@/components/farms/farm-actions-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { farmDetailPage } from "@/config/page-routes";
import { formatFarmLocation } from "@/lib/farm/format-location";
import type { FarmInterface } from "@/types/farm.interface";

export interface FarmGridProps {
  /** Farms to display in the grid. */
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

function formatCoordinates(farm: FarmInterface): string | null {
  const { latitude, longitude } = farm.location;
  if (latitude === undefined || longitude === undefined) {
    return null;
  }

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

/**
 * FarmGrid
 *
 * Card grid layout for farms with commodity, location, and row actions.
 */
export function FarmGrid({
  farms,
  commodityNames,
  onEdit,
  onDelete,
  emptyMessage = "No farms yet. Add your first farm to get started.",
}: FarmGridProps): React.JSX.Element {
  if (farms.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {farms.map((farm) => {
        const coordinates = formatCoordinates(farm);

        return (
          <Card key={farm.id} size="sm">
            <CardHeader>
              <CardTitle className="truncate">
                <Link href={farmDetailPage(farm.id)} className="hover:underline">
                  {farm.name}
                </Link>
              </CardTitle>
              <CardAction>
                <FarmActionsMenu
                  farm={farm}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  triggerVariant="outline"
                />
              </CardAction>
            </CardHeader>
            <CardContent className="gap-card flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <code className="text-muted-foreground text-xs">{farm.code}</code>
                <Badge variant="secondary">
                  {commodityNames[farm.commodityId] ?? "Unknown"}
                </Badge>
              </div>
              <div className="text-muted-foreground flex items-start gap-2 text-sm">
                <MapPinIcon className="mt-0.5 size-4 shrink-0" />
                <span>{formatFarmLocation(farm.location)}</span>
              </div>
              {coordinates ? (
                <p className="text-muted-foreground text-xs">GPS: {coordinates}</p>
              ) : null}
              <p className="text-muted-foreground text-xs">
                Created {formatDate(farm.createdAt)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
