"use client";

import { CommodityActionsMenu } from "@/components/commodities/commodity-actions-menu";
import { CommodityThumbnail } from "@/components/commodities/commodity-thumbnail";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CommodityInterface } from "@/types/commodity.interface";

export interface CommodityGridProps {
  /** Commodities to display in the grid. */
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
 * CommodityGrid
 *
 * Card grid layout for commodities with image, metadata, and row actions.
 */
export function CommodityGrid({
  commodities,
  onEdit,
  onDelete,
  emptyMessage = "No commodities yet. Add your first commodity to get started.",
}: CommodityGridProps): React.JSX.Element {
  if (commodities.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {commodities.map((commodity) => (
        <Card key={commodity.id} size="sm">
          <CardHeader>
            <CardTitle className="truncate">{commodity.name}</CardTitle>
            <CardAction>
              <CommodityActionsMenu
                commodity={commodity}
                onEdit={onEdit}
                onDelete={onDelete}
                triggerVariant="outline"
              />
            </CardAction>
          </CardHeader>
          <CardContent className="gap-card flex flex-col">
            <div className="bg-muted relative flex aspect-video items-center justify-center overflow-hidden rounded-lg">
              <CommodityThumbnail name={commodity.name} imageUrl={commodity.imageUrl} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="text-muted-foreground text-xs">{commodity.code}</code>
              <Badge variant="secondary">{commodity.unit}</Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Created {formatDate(commodity.createdAt)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
