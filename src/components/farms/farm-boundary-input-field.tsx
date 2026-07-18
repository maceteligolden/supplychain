"use client";

import { useMemo, useRef, useState } from "react";

import {
  FarmUnifiedMapLoader,
  type FarmUnifiedBasemap,
} from "@/components/farms/farm-unified-map-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";
import type { FarmMapCenter } from "@/lib/farm/map-types";
import { parseGeoJsonBoundary } from "@/lib/farm/parse-geojson-boundary";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import type { FarmAssessmentMapContextInterface } from "@/types/farm-map-context.interface";
import type { FarmAssessmentMapMode } from "@/types/farm-map-context.interface";
import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";

export type BoundaryInputMode = "draw" | "coordinates" | "geojson";

type CoordinateRow = GeoCoordinateInterface & { id: string };

function createRow(coordinate?: GeoCoordinateInterface): CoordinateRow {
  return {
    id: crypto.randomUUID(),
    latitude: coordinate?.latitude ?? 0,
    longitude: coordinate?.longitude ?? 0,
  };
}

function rowsFromCoordinates(coordinates: GeoCoordinateInterface[]): CoordinateRow[] {
  if (coordinates.length === 0) {
    return [createRow(), createRow(), createRow()];
  }
  return coordinates.map((coordinate) => createRow(coordinate));
}

export interface FarmBoundaryInputFieldProps {
  center: FarmMapCenter;
  farmGps?: GeoCoordinateInterface | null;
  inputMode: BoundaryInputMode;
  onInputModeChange: (mode: BoundaryInputMode) => void;
  isEditing: boolean;
  coordinates: GeoCoordinateInterface[];
  onCoordinatesChange: (coordinates: GeoCoordinateInterface[]) => void;
  isShapeClosed: boolean;
  onShapeClosedChange: (closed: boolean) => void;
  savedCoordinates?: GeoCoordinateInterface[];
  savedPlots?: GeoCoordinateInterface[][];
  draftPlots?: GeoCoordinateInterface[][];
  onStartEditing: (mode: BoundaryInputMode) => void;
  onCancelEditing?: () => void;
  disabled?: boolean;
  mapClassName?: string;
  showBasemapToggle?: boolean;
  basemap?: FarmUnifiedBasemap;
  onBasemapChange?: (basemap: FarmUnifiedBasemap) => void;
  flyToCenter?: FarmMapCenter | null;
  preferFarmFocus?: boolean;
  focusNonce?: number;
  areaLabel?: React.ReactNode;
  leadingActions?: React.ReactNode;
  trailingActions?: React.ReactNode;
  idleHint?: string;
  mapContext?: FarmAssessmentMapContextInterface | null;
  riskLevel?: AssessmentRiskLevel | null;
  visibleLayerIds?: Set<string>;
  showAssessmentLayers?: boolean;
  assessmentMapMode?: FarmAssessmentMapMode;
  pickLocationMode?: boolean;
  onPickLocation?: (coordinate: GeoCoordinateInterface) => void;
  onVertexDrag?: (index: number, coordinate: GeoCoordinateInterface) => void;
}

/**
 * Shared boundary input: Draw / Coordinates / GeoJSON tabs + Leaflet map preview.
 */
export function FarmBoundaryInputField({
  center,
  farmGps = null,
  inputMode,
  onInputModeChange,
  isEditing,
  coordinates,
  onCoordinatesChange,
  isShapeClosed,
  onShapeClosedChange,
  savedCoordinates = [],
  savedPlots = [],
  draftPlots = [],
  onStartEditing,
  onCancelEditing,
  disabled = false,
  mapClassName = "h-64",
  showBasemapToggle = false,
  basemap = "street",
  onBasemapChange,
  flyToCenter = null,
  preferFarmFocus = false,
  focusNonce = 0,
  areaLabel,
  leadingActions,
  trailingActions,
  idleHint,
  mapContext = null,
  riskLevel = null,
  visibleLayerIds = new Set(),
  showAssessmentLayers = false,
  assessmentMapMode = "satellite",
  pickLocationMode = false,
  onPickLocation,
  onVertexDrag,
}: FarmBoundaryInputFieldProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coordinateRows, setCoordinateRows] = useState<CoordinateRow[]>(() =>
    rowsFromCoordinates(coordinates),
  );

  const previewPlots = useMemo((): GeoCoordinateInterface[][] => {
    if (!isEditing) {
      return savedPlots.length > 0
        ? savedPlots
        : savedCoordinates.length >= 3
          ? [savedCoordinates]
          : [];
    }
    if (inputMode === "draw") {
      if (isShapeClosed && coordinates.length >= 3) {
        return draftPlots.length > 0
          ? [...draftPlots.slice(0, -1), coordinates]
          : [coordinates];
      }
      return draftPlots;
    }
    const rows = coordinateRows.filter(
      (row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude),
    );
    return rows.length >= 3 ? [rows] : [];
  }, [
    coordinateRows,
    coordinates,
    draftPlots,
    inputMode,
    isEditing,
    isShapeClosed,
    savedCoordinates,
    savedPlots,
  ]);

  function syncRowsToParent(rows: CoordinateRow[]): void {
    const next = rows
      .map(({ latitude, longitude }) => ({ latitude, longitude }))
      .filter(
        (coordinate) =>
          Number.isFinite(coordinate.latitude) && Number.isFinite(coordinate.longitude),
      );
    onCoordinatesChange(next);
    if (next.length >= 3) {
      onShapeClosedChange(true);
    }
  }

  function handleStart(mode: BoundaryInputMode): void {
    if (mode === "coordinates") {
      setCoordinateRows(rowsFromCoordinates(savedCoordinates));
    }
    onStartEditing(mode);
  }

  function handleMapClick(coordinate: GeoCoordinateInterface): void {
    if (pickLocationMode && onPickLocation) {
      onPickLocation(coordinate);
      return;
    }
    if (inputMode !== "draw" || !isEditing || isShapeClosed) {
      return;
    }
    onCoordinatesChange([...coordinates, coordinate]);
    onShapeClosedChange(false);
  }

  function handleUndo(): void {
    onCoordinatesChange(coordinates.slice(0, -1));
    onShapeClosedChange(false);
  }

  function handleClearAll(): void {
    onCoordinatesChange([]);
    onShapeClosedChange(false);
  }

  function handleCloseShape(): void {
    if (coordinates.length < 3) {
      showErrorToast("Add at least 3 points before closing the shape.");
      return;
    }
    onShapeClosedChange(true);
  }

  async function handleGeoJsonUpload(file: File): Promise<void> {
    try {
      const text = await file.text();
      const parsed = parseGeoJsonBoundary(JSON.parse(text));
      const rows = parsed.coordinates.map((coordinate) => createRow(coordinate));
      setCoordinateRows(rows);
      onInputModeChange("geojson");
      onCoordinatesChange(parsed.coordinates);
      onShapeClosedChange(true);
      onStartEditing("geojson");
      showSuccessToast("GeoJSON loaded — review the preview.");
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Could not parse GeoJSON file.",
      );
    }
  }

  const hasSavedBoundary = savedCoordinates.length >= 3 || savedPlots.length > 0;
  const startLabel =
    inputMode === "draw"
      ? hasSavedBoundary
        ? "Redraw"
        : "Draw boundary"
      : inputMode === "coordinates"
        ? hasSavedBoundary
          ? "Edit coordinates"
          : "Enter coordinates"
        : hasSavedBoundary
          ? "Replace GeoJSON"
          : "Upload GeoJSON";

  return (
    <div className="gap-card flex h-full min-h-0 flex-col">
      {!isEditing ? (
        <Tabs
          value={inputMode}
          onValueChange={(value): void => onInputModeChange(value as BoundaryInputMode)}
          className="w-full"
        >
          <TabsList className="bg-background/80 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="draw" disabled={disabled}>
              Draw
            </TabsTrigger>
            <TabsTrigger value="coordinates" disabled={disabled}>
              Coordinates
            </TabsTrigger>
            <TabsTrigger value="geojson" disabled={disabled}>
              GeoJSON
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ) : (
        <p className="text-muted-foreground text-xs">
          Editing via{" "}
          <span className="text-foreground font-medium capitalize">{inputMode}</span>
          {isEditing ? " · satellite basemap while drawing" : null}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-muted-foreground text-sm">{areaLabel}</div>
        <div className="flex flex-wrap gap-2">
          {leadingActions}
          {showBasemapToggle && !isEditing && onBasemapChange ? (
            <>
              <Button
                type="button"
                variant={basemap === "street" ? "default" : "outline"}
                size="sm"
                disabled={disabled}
                onClick={(): void => onBasemapChange("street")}
              >
                Street
              </Button>
              <Button
                type="button"
                variant={basemap === "satellite" ? "default" : "outline"}
                size="sm"
                disabled={disabled}
                onClick={(): void => onBasemapChange("satellite")}
              >
                Satellite
              </Button>
            </>
          ) : null}

          {!isEditing ? (
            <>
              {inputMode === "geojson" ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".geojson,.json,application/geo+json,application/json"
                    className="hidden"
                    onChange={(event): void => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handleGeoJsonUpload(file);
                      }
                      event.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={disabled}
                    onClick={(): void => fileInputRef.current?.click()}
                  >
                    {startLabel}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={disabled}
                  onClick={(): void => handleStart(inputMode)}
                >
                  {startLabel}
                </Button>
              )}
            </>
          ) : null}

          {isEditing && inputMode === "draw" ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || coordinates.length === 0}
                onClick={handleUndo}
              >
                Undo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || coordinates.length === 0}
                onClick={handleClearAll}
              >
                Clear
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
            </>
          ) : null}

          {isEditing && onCancelEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={onCancelEditing}
            >
              Cancel
            </Button>
          ) : null}

          {trailingActions}
        </div>
      </div>

      {isEditing && inputMode === "coordinates" ? (
        <div className="bg-background/70 flex max-h-48 flex-col gap-3 overflow-auto rounded-lg border p-3">
          {coordinateRows.map((row, index) => (
            <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <div className="flex flex-col gap-1">
                <Label htmlFor={`lat-${row.id}`} className="text-xs">
                  Point {index + 1} latitude
                </Label>
                <Input
                  id={`lat-${row.id}`}
                  type="number"
                  step="any"
                  disabled={disabled}
                  value={row.latitude || ""}
                  onChange={(event): void => {
                    const value = Number(event.target.value);
                    setCoordinateRows((current) => {
                      const next = current.map((item) =>
                        item.id === row.id ? { ...item, latitude: value } : item,
                      );
                      syncRowsToParent(next);
                      return next;
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`lng-${row.id}`} className="text-xs">
                  Longitude
                </Label>
                <Input
                  id={`lng-${row.id}`}
                  type="number"
                  step="any"
                  disabled={disabled}
                  value={row.longitude || ""}
                  onChange={(event): void => {
                    const value = Number(event.target.value);
                    setCoordinateRows((current) => {
                      const next = current.map((item) =>
                        item.id === row.id ? { ...item, longitude: value } : item,
                      );
                      syncRowsToParent(next);
                      return next;
                    });
                  }}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || coordinateRows.length <= 3}
                  onClick={(): void => {
                    setCoordinateRows((current) => {
                      const next = current.filter((item) => item.id !== row.id);
                      syncRowsToParent(next);
                      return next;
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            disabled={disabled}
            onClick={(): void => {
              setCoordinateRows((current) => {
                const next = [...current, createRow()];
                syncRowsToParent(next);
                return next;
              });
            }}
          >
            Add point
          </Button>
        </div>
      ) : null}

      {isEditing && inputMode === "draw" ? (
        <p className="text-muted-foreground text-xs">
          Click the map to add corners (max 500). Close the shape, drag vertices to
          adjust, then save. Use Add plot for multi-plot farms.
        </p>
      ) : null}

      {!isEditing && idleHint ? (
        <p className="text-muted-foreground text-xs">{idleHint}</p>
      ) : null}

      <div
        className={`border-border ring-primary/5 min-h-0 flex-1 overflow-hidden rounded-xl border shadow-inner ring-1 ${mapClassName}`}
      >
        <FarmUnifiedMapLoader
          center={center}
          farmGps={farmGps}
          savedPlots={previewPlots}
          draftCoordinates={inputMode === "draw" && isEditing ? coordinates : []}
          draftPlots={draftPlots}
          isDrawing={isEditing && inputMode === "draw"}
          isShapeClosed={isShapeClosed}
          pickLocationMode={pickLocationMode}
          basemap={basemap}
          flyToCenter={flyToCenter}
          preferFarmFocus={preferFarmFocus}
          focusNonce={focusNonce}
          onMapClick={
            !disabled && (pickLocationMode || (isEditing && inputMode === "draw"))
              ? handleMapClick
              : undefined
          }
          onVertexDrag={onVertexDrag}
          mapContext={mapContext}
          riskLevel={riskLevel}
          visibleLayerIds={visibleLayerIds}
          showAssessmentLayers={showAssessmentLayers}
          assessmentMapMode={assessmentMapMode}
          className="h-full min-h-[16rem] w-full"
        />
      </div>
    </div>
  );
}

/** Resolves coordinates to persist from the active input mode. */
export function resolveBoundaryCoordinates(input: {
  inputMode: BoundaryInputMode;
  coordinates: GeoCoordinateInterface[];
  isShapeClosed: boolean;
}): GeoCoordinateInterface[] | null {
  if (input.inputMode === "draw") {
    if (input.coordinates.length < 3) {
      showErrorToast("Draw at least 3 points to save a boundary.");
      return null;
    }
    if (!input.isShapeClosed) {
      showErrorToast("Close the shape before saving.");
      return null;
    }
    return input.coordinates;
  }

  const coords = input.coordinates.filter(
    (coordinate) =>
      Number.isFinite(coordinate.latitude) &&
      Number.isFinite(coordinate.longitude) &&
      coordinate.latitude >= -90 &&
      coordinate.latitude <= 90 &&
      coordinate.longitude >= -180 &&
      coordinate.longitude <= 180,
  );

  if (coords.length < 3) {
    showErrorToast("Enter at least 3 valid coordinate pairs.");
    return null;
  }

  return coords;
}
