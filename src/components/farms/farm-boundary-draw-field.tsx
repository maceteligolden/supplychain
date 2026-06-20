"use client";

import { useMemo, useState } from "react";
import type { LatLngExpression } from "leaflet";

import { FarmUnifiedMapLoader } from "@/components/farms/farm-unified-map-loader";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/lib/toast/notify";
import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";

const GHANA_DEFAULT_CENTER: LatLngExpression = [7.95, -1.03];

export interface FarmBoundaryDrawFieldProps {
  /** Map centre — farm GPS or regional default. */
  center?: LatLngExpression;
  /** Draft polygon corners. */
  coordinates: GeoCoordinateInterface[];
  /** Called when coordinates change. */
  onCoordinatesChange: (coordinates: GeoCoordinateInterface[]) => void;
  /** Whether the polygon ring is closed. */
  isShapeClosed: boolean;
  /** Called when shape closed state changes. */
  onShapeClosedChange: (closed: boolean) => void;
  disabled?: boolean;
}

/**
 * FarmBoundaryDrawField
 *
 * Click-to-draw boundary map for farm create wizard and similar forms.
 */
export function FarmBoundaryDrawField({
  center,
  coordinates,
  onCoordinatesChange,
  isShapeClosed,
  onShapeClosedChange,
  disabled = false,
}: FarmBoundaryDrawFieldProps): React.JSX.Element {
  const [isDrawing, setIsDrawing] = useState(coordinates.length > 0);

  const mapCenter = useMemo(
    (): LatLngExpression => center ?? GHANA_DEFAULT_CENTER,
    [center],
  );

  function startDrawing(): void {
    setIsDrawing(true);
    onCoordinatesChange([]);
    onShapeClosedChange(false);
  }

  function handleMapClick(coordinate: GeoCoordinateInterface): void {
    onCoordinatesChange([...coordinates, coordinate]);
    onShapeClosedChange(false);
  }

  function handleUndo(): void {
    onCoordinatesChange(coordinates.slice(0, -1));
    onShapeClosedChange(false);
  }

  function handleCloseShape(): void {
    if (coordinates.length < 3) {
      showErrorToast("Add at least 3 points before closing the shape.");
      return;
    }
    onShapeClosedChange(true);
  }

  function handleClear(): void {
    setIsDrawing(false);
    onCoordinatesChange([]);
    onShapeClosedChange(false);
  }

  return (
    <div className="gap-card flex flex-col">
      <div className="flex flex-wrap gap-2">
        {!isDrawing ? (
          <Button type="button" size="sm" disabled={disabled} onClick={startDrawing}>
            Draw boundary
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || coordinates.length === 0}
              onClick={handleUndo}
            >
              Undo last point
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isShapeClosed || coordinates.length < 3}
              onClick={handleCloseShape}
            >
              Close shape
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={handleClear}
            >
              Clear
            </Button>
          </>
        )}
      </div>
      {isDrawing ? (
        <p className="text-muted-foreground text-xs">
          Click the map to add corners. Use at least 3 points, then close the shape.
        </p>
      ) : (
        <p className="text-muted-foreground text-xs">
          Optional — draw the farm polygon now or skip and map it later on the farm
          detail page.
        </p>
      )}
      <div className="border-border h-64 overflow-hidden rounded-lg border">
        <FarmUnifiedMapLoader
          center={mapCenter}
          savedCoordinates={[]}
          draftCoordinates={isDrawing ? coordinates : []}
          isDrawing={isDrawing}
          isShapeClosed={isShapeClosed}
          onMapClick={isDrawing && !disabled ? handleMapClick : undefined}
        />
      </div>
      {isShapeClosed && coordinates.length >= 3 ? (
        <p className="text-foreground text-xs font-medium">
          Boundary ready — {coordinates.length} points, shape closed.
        </p>
      ) : null}
    </div>
  );
}
