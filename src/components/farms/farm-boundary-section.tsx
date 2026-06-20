"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LatLngExpression } from "leaflet";

import { FarmMapLayerControls } from "@/components/farms/farm-map-layer-controls";
import {
  FarmUnifiedMapLoader,
  type FarmUnifiedBasemap,
} from "@/components/farms/farm-unified-map-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";
import { calculatePolygonAreaHectares } from "@/lib/farm/calculate-polygon-area-hectares";
import { parseGeoJsonBoundary } from "@/lib/farm/parse-geojson-boundary";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { getFarmAssessmentMapContext } from "@/services/farm-assessments.service";
import {
  deleteFarmBoundary,
  geocodeFarm,
  upsertFarmBoundary,
} from "@/services/farm-boundaries.service";
import type { FarmAssessmentMapContextInterface } from "@/types/farm-map-context.interface";
import type {
  FarmBoundaryInterface,
  GeoCoordinateInterface,
} from "@/types/farm-boundary.interface";
import type { FarmInterface } from "@/types/farm.interface";

const GHANA_DEFAULT_CENTER: LatLngExpression = [7.95, -1.03];

type BoundaryInputMode = "draw" | "coordinates" | "geojson";

type CoordinateRow = GeoCoordinateInterface & { id: string };

function createRow(coordinate?: GeoCoordinateInterface): CoordinateRow {
  return {
    id: crypto.randomUUID(),
    latitude: coordinate?.latitude ?? 0,
    longitude: coordinate?.longitude ?? 0,
  };
}

export interface FarmBoundarySectionProps {
  farm: FarmInterface;
  boundary: FarmBoundaryInterface | null;
  selectedAssessmentId?: string | null;
  selectedRiskLevel?: AssessmentRiskLevel | null;
  showAssessmentLayers?: boolean;
}

/** Unified farm map: boundary input and assessment overlays. */
export function FarmBoundarySection({
  farm,
  boundary,
  selectedAssessmentId = null,
  selectedRiskLevel = null,
  showAssessmentLayers = false,
}: FarmBoundarySectionProps): React.JSX.Element {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<BoundaryInputMode>("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [draftCoordinates, setDraftCoordinates] = useState<GeoCoordinateInterface[]>(
    [],
  );
  const [coordinateRows, setCoordinateRows] = useState<CoordinateRow[]>([
    createRow(),
    createRow(),
    createRow(),
  ]);
  const [isShapeClosed, setIsShapeClosed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [basemap, setBasemap] = useState<FarmUnifiedBasemap>("street");
  const [flyToCenter, setFlyToCenter] = useState<LatLngExpression | null>(null);

  const [mapContext, setMapContext] =
    useState<FarmAssessmentMapContextInterface | null>(null);
  const [mapContextError, setMapContextError] = useState<string | null>(null);
  const [isMapContextLoading, setIsMapContextLoading] = useState(false);
  const [visibleLayerIds, setVisibleLayerIds] = useState<Set<string>>(new Set());

  const farmGps = useMemo((): GeoCoordinateInterface | null => {
    const { latitude, longitude } = farm.location;
    if (latitude !== undefined && longitude !== undefined) {
      return { latitude, longitude };
    }
    return null;
  }, [farm.location]);

  const mapCenter = useMemo((): LatLngExpression => {
    if (farmGps) {
      return [farmGps.latitude, farmGps.longitude];
    }
    return GHANA_DEFAULT_CENTER;
  }, [farmGps]);

  const previewCoordinates = useMemo((): GeoCoordinateInterface[] => {
    if (isDrawing && inputMode === "draw") {
      return draftCoordinates;
    }
    if (isDrawing && (inputMode === "coordinates" || inputMode === "geojson")) {
      return coordinateRows.filter(
        (row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude),
      );
    }
    return boundary?.coordinates ?? [];
  }, [boundary?.coordinates, coordinateRows, draftCoordinates, inputMode, isDrawing]);

  const draftAreaHectares = useMemo((): number | null => {
    const coords =
      isDrawing && inputMode !== "draw"
        ? coordinateRows.filter((row) => row.latitude && row.longitude)
        : draftCoordinates;

    if (coords.length < 3) {
      return null;
    }
    return calculatePolygonAreaHectares(coords);
  }, [coordinateRows, draftCoordinates, inputMode, isDrawing]);

  const displayArea =
    isDrawing && draftAreaHectares !== null
      ? draftAreaHectares
      : (boundary?.areaHectares ?? farm.areaHectares ?? null);

  const canShowAssessment =
    showAssessmentLayers &&
    !isDrawing &&
    selectedAssessmentId &&
    selectedRiskLevel &&
    boundary;

  const displayedMapContext = canShowAssessment ? mapContext : null;

  useEffect(() => {
    if (!canShowAssessment || !selectedAssessmentId) {
      return;
    }

    let cancelled = false;
    const assessmentId = selectedAssessmentId;

    async function loadMapContext(): Promise<void> {
      setIsMapContextLoading(true);
      setMapContextError(null);

      try {
        const context = await getFarmAssessmentMapContext(farm.id, assessmentId);
        if (cancelled) {
          return;
        }
        setMapContext(context);
        setVisibleLayerIds(
          new Set(
            context.tileLayers
              .filter((layer) => layer.defaultVisible)
              .map((layer) => layer.id),
          ),
        );
      } catch (error) {
        if (cancelled) {
          return;
        }
        setMapContext(null);
        setMapContextError(
          isAppError(error) ? error.message : "Failed to load assessment map layers.",
        );
      } finally {
        if (!cancelled) {
          setIsMapContextLoading(false);
        }
      }
    }

    void loadMapContext();

    return (): void => {
      cancelled = true;
    };
  }, [canShowAssessment, farm.id, selectedAssessmentId]);

  function startDrawing(mode: BoundaryInputMode = "draw"): void {
    setInputMode(mode);
    setIsDrawing(true);
    setDraftCoordinates(boundary?.coordinates ?? []);
    setCoordinateRows(
      boundary?.coordinates.length
        ? boundary.coordinates.map((coordinate) => createRow(coordinate))
        : [createRow(), createRow(), createRow()],
    );
    setIsShapeClosed(mode !== "draw");
  }

  function cancelDrawing(): void {
    setIsDrawing(false);
    setDraftCoordinates([]);
    setIsShapeClosed(false);
  }

  function handleMapClick(coordinate: GeoCoordinateInterface): void {
    if (inputMode !== "draw") {
      return;
    }
    setDraftCoordinates((current) => [...current, coordinate]);
  }

  function handleUndo(): void {
    setDraftCoordinates((current) => current.slice(0, -1));
    setIsShapeClosed(false);
  }

  function handleClearAll(): void {
    setDraftCoordinates([]);
    setIsShapeClosed(false);
  }

  function handleCloseShape(): void {
    if (draftCoordinates.length < 3) {
      showErrorToast("Add at least 3 points before closing the shape.");
      return;
    }
    setIsShapeClosed(true);
  }

  function resolveSaveCoordinates(): GeoCoordinateInterface[] | null {
    if (inputMode === "draw") {
      if (draftCoordinates.length < 3) {
        showErrorToast("Draw at least 3 points to save a boundary.");
        return null;
      }
      if (!isShapeClosed) {
        showErrorToast("Close the shape before saving.");
        return null;
      }
      return draftCoordinates;
    }

    const coords = coordinateRows
      .map(({ latitude, longitude }) => ({ latitude, longitude }))
      .filter(
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

  async function handleSave(): Promise<void> {
    const coordinates = resolveSaveCoordinates();
    if (!coordinates) {
      return;
    }

    setIsSubmitting(true);

    try {
      await upsertFarmBoundary(farm.id, { coordinates });
      showSuccessToast("Farm boundary saved successfully.");
      cancelDrawing();
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to save boundary. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGeoJsonUpload(file: File): Promise<void> {
    try {
      const text = await file.text();
      const parsed = parseGeoJsonBoundary(JSON.parse(text));
      setInputMode("geojson");
      setIsDrawing(true);
      setDraftCoordinates(parsed.coordinates);
      setCoordinateRows(parsed.coordinates.map((coordinate) => createRow(coordinate)));
      setIsShapeClosed(true);
      showSuccessToast("GeoJSON loaded — review the preview and save.");
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Could not parse GeoJSON file.",
      );
    }
  }

  async function handleCenterOnAddress(): Promise<void> {
    setIsGeocoding(true);

    try {
      const result = await geocodeFarm(farm.id);
      setFlyToCenter([result.latitude, result.longitude]);
      showSuccessToast(`Centered on ${result.displayName}`);
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Could not locate farm address on the map.");
      }
    } finally {
      setIsGeocoding(false);
    }
  }

  async function handleDelete(): Promise<void> {
    setIsSubmitting(true);

    try {
      await deleteFarmBoundary(farm.id);
      showSuccessToast("Farm boundary removed.");
      cancelDrawing();
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to remove boundary. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleToggleLayer(layerId: string, visible: boolean): void {
    setVisibleLayerIds((current) => {
      const next = new Set(current);
      if (visible) {
        next.add(layerId);
      } else {
        next.delete(layerId);
      }
      return next;
    });
  }

  const mapPreviewCoordinates = isDrawing
    ? previewCoordinates
    : (boundary?.coordinates ?? []);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-foreground text-lg font-semibold tracking-tight">
          Farm map
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Define the farm boundary, then view GFW deforestation overlays on the same map
          when an assessment is selected.
        </p>
      </div>

      <Card className="border-border/80 bg-surface-secondary/40 overflow-hidden shadow-sm">
        <CardContent className="gap-card flex flex-col pt-6">
          {!isDrawing ? (
            <Tabs
              value={inputMode}
              onValueChange={(value): void => setInputMode(value as BoundaryInputMode)}
              className="w-full"
            >
              <TabsList className="bg-background/80 grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="draw">Draw</TabsTrigger>
                <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
                <TabsTrigger value="geojson">GeoJSON</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              {displayArea != null && Number.isFinite(displayArea) ? (
                <>
                  Area:{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    {displayArea.toLocaleString()} ha
                  </span>
                </>
              ) : (
                "No boundary mapped yet"
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting || isGeocoding}
                onClick={(): void => void handleCenterOnAddress()}
              >
                {isGeocoding ? "Locating…" : "Center on address"}
              </Button>
              {!isDrawing ? (
                <>
                  <Button
                    type="button"
                    variant={basemap === "street" ? "default" : "outline"}
                    size="sm"
                    onClick={(): void => setBasemap("street")}
                  >
                    Street
                  </Button>
                  <Button
                    type="button"
                    variant={basemap === "satellite" ? "default" : "outline"}
                    size="sm"
                    onClick={(): void => setBasemap("satellite")}
                  >
                    Satellite
                  </Button>
                </>
              ) : null}
              {!isDrawing && boundary ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(): void => startDrawing("draw")}
                  >
                    Redraw
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={(): void => void handleDelete()}
                  >
                    Remove
                  </Button>
                </>
              ) : null}
              {!isDrawing && !boundary ? (
                <>
                  {inputMode === "draw" ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={(): void => startDrawing("draw")}
                    >
                      Draw boundary
                    </Button>
                  ) : null}
                  {inputMode === "coordinates" ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={(): void => startDrawing("coordinates")}
                    >
                      Enter coordinates
                    </Button>
                  ) : null}
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
                        onClick={(): void => fileInputRef.current?.click()}
                      >
                        Upload GeoJSON
                      </Button>
                    </>
                  ) : null}
                </>
              ) : null}
              {isDrawing ? (
                <>
                  {inputMode === "draw" ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!draftCoordinates.length}
                        onClick={handleUndo}
                      >
                        Undo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!draftCoordinates.length}
                        onClick={handleClearAll}
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isShapeClosed || draftCoordinates.length < 3}
                        onClick={handleCloseShape}
                      >
                        Close shape
                      </Button>
                    </>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelDrawing}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={(): void => void handleSave()}
                  >
                    {isSubmitting ? "Saving…" : "Save boundary"}
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {isDrawing && inputMode === "coordinates" ? (
            <div className="bg-background/70 flex flex-col gap-3 rounded-lg border p-3">
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
                      value={row.latitude || ""}
                      onChange={(event): void => {
                        const value = Number(event.target.value);
                        setCoordinateRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, latitude: value } : item,
                          ),
                        );
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
                      value={row.longitude || ""}
                      onChange={(event): void => {
                        const value = Number(event.target.value);
                        setCoordinateRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, longitude: value } : item,
                          ),
                        );
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={coordinateRows.length <= 3}
                      onClick={(): void =>
                        setCoordinateRows((current) =>
                          current.filter((item) => item.id !== row.id),
                        )
                      }
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
                onClick={(): void =>
                  setCoordinateRows((current) => [...current, createRow()])
                }
              >
                Add point
              </Button>
            </div>
          ) : null}

          <div className="border-border ring-primary/5 h-[28rem] overflow-hidden rounded-xl border shadow-inner ring-1">
            <FarmUnifiedMapLoader
              center={mapCenter}
              farmGps={farmGps}
              savedCoordinates={mapPreviewCoordinates}
              draftCoordinates={
                inputMode === "draw" && isDrawing ? draftCoordinates : []
              }
              isDrawing={isDrawing && inputMode === "draw"}
              isShapeClosed={isShapeClosed}
              basemap={basemap}
              flyToCenter={flyToCenter}
              onMapClick={
                isDrawing && inputMode === "draw" ? handleMapClick : undefined
              }
              mapContext={displayedMapContext}
              riskLevel={selectedRiskLevel}
              visibleLayerIds={visibleLayerIds}
              showAssessmentLayers={Boolean(displayedMapContext)}
            />
          </div>

          {canShowAssessment && isMapContextLoading ? (
            <p className="text-muted-foreground text-xs">Loading assessment layers…</p>
          ) : null}
          {canShowAssessment && mapContextError ? (
            <p className="text-destructive text-xs">{mapContextError}</p>
          ) : null}

          {displayedMapContext ? (
            <FarmMapLayerControls
              tileLayers={displayedMapContext.tileLayers}
              visibleLayerIds={visibleLayerIds}
              onToggleLayer={handleToggleLayer}
              whispRiskPcrop={displayedMapContext.whispRiskPcrop}
            />
          ) : null}

          {!isDrawing && boundary && !canShowAssessment ? (
            <p className="text-muted-foreground bg-accent/40 rounded-lg px-3 py-2 text-xs">
              Run an assessment below to see GFW deforestation overlays on this map.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
