"use client";

import { Label } from "@/components/ui/label";
import { GFW_TILE_LAYER_COLORS } from "@/lib/farm/map-theme";
import type { FarmMapTileLayerInterface } from "@/types/farm-map-context.interface";

export interface FarmMapLayerControlsProps {
  tileLayers: FarmMapTileLayerInterface[];
  visibleLayerIds: Set<string>;
  onToggleLayer: (layerId: string, visible: boolean) => void;
  whispRiskPcrop?: string | null;
}

function layerSwatchColor(layerId: string): string {
  return GFW_TILE_LAYER_COLORS[layerId] ?? "#94a3b8";
}

/** Toggle panel for GFW raster overlays — swatches match tile colors on the map. */
export function FarmMapLayerControls({
  tileLayers,
  visibleLayerIds,
  onToggleLayer,
  whispRiskPcrop,
}: FarmMapLayerControlsProps): React.JSX.Element {
  return (
    <div className="border-border bg-background/95 flex flex-col gap-3 rounded-xl border p-4 shadow-sm">
      <div>
        <p className="text-foreground text-sm font-semibold">Map layers</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Toggle Global Forest Watch overlays. Colors on the map match the swatches
          below.
        </p>
        {whispRiskPcrop ? (
          <p className="text-muted-foreground mt-2 text-xs">
            WHISP cocoa risk:{" "}
            <span className="text-info font-medium">{whispRiskPcrop}</span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        {tileLayers.map((layer) => (
          <div key={layer.id} className="flex items-center gap-2">
            <input
              id={`layer-${layer.id}`}
              type="checkbox"
              checked={visibleLayerIds.has(layer.id)}
              onChange={(event): void => onToggleLayer(layer.id, event.target.checked)}
              className="border-input accent-primary size-4 rounded border"
            />
            <span
              className="inline-block size-3 shrink-0 rounded-sm border border-black/10"
              style={{ backgroundColor: layerSwatchColor(layer.id) }}
              aria-hidden
            />
            <Label htmlFor={`layer-${layer.id}`} className="text-xs font-normal">
              {layer.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
