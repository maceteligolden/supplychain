"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  FarmBoundaryInputField,
  resolveBoundaryCoordinates,
  type BoundaryInputMode,
} from "@/components/farms/farm-boundary-input-field";
import { FarmLocatePanel } from "@/components/farms/farm-locate-panel";
import { FarmMapLayerControls } from "@/components/farms/farm-map-layer-controls";
import { FarmMapLegend } from "@/components/farms/farm-map-legend";
import type { FarmUnifiedBasemap } from "@/components/farms/farm-unified-map-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";
import { getBoundaryPlots } from "@/lib/farm/boundary-plots";
import { calculatePolygonAreaHectares } from "@/lib/farm/calculate-polygon-area-hectares";
import { isAppError } from "@/lib/errors";
import { NIGERIA_DEFAULT_CENTER, type FarmMapCenter } from "@/lib/farm/map-types";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { getFarmAssessmentMapContext } from "@/services/farm-assessments.service";
import {
  deleteFarmBoundary,
  upsertFarmBoundary,
} from "@/services/farm-boundaries.service";
import { updateFarm } from "@/services/farms.service";
import type { FarmAssessmentMapContextInterface } from "@/types/farm-map-context.interface";
import type { FarmAssessmentMapMode } from "@/types/farm-map-context.interface";
import type {
  FarmBoundaryInterface,
  GeoCoordinateInterface,
} from "@/types/farm-boundary.interface";
import type { FarmInterface } from "@/types/farm.interface";

export interface FarmBoundarySectionProps {
  farm: FarmInterface;
  boundary: FarmBoundaryInterface | null;
  selectedAssessmentId?: string | null;
  selectedRiskLevel?: AssessmentRiskLevel | null;
  showAssessmentLayers?: boolean;
}

/** Unified farm map: full-screen locate/draw and assessment overlays. */
export function FarmBoundarySection({
  farm,
  boundary,
  selectedAssessmentId = null,
  selectedRiskLevel = null,
  showAssessmentLayers = false,
}: FarmBoundarySectionProps): React.JSX.Element {
  const router = useRouter();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputMode, setInputMode] = useState<BoundaryInputMode>("draw");
  const [isEditing, setIsEditing] = useState(false);
  const [draftCoordinates, setDraftCoordinates] = useState<GeoCoordinateInterface[]>(
    [],
  );
  const [draftPlots, setDraftPlots] = useState<GeoCoordinateInterface[][]>([]);
  const [isShapeClosed, setIsShapeClosed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [basemap, setBasemap] = useState<FarmUnifiedBasemap>("street");
  const [flyToCenter, setFlyToCenter] = useState<FarmMapCenter | null>(null);
  const [pickOnMapActive, setPickOnMapActive] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{
    latitude: number;
    longitude: number;
    displayName: string;
  } | null>(null);
  const [latitudeText, setLatitudeText] = useState(
    farm.location.latitude?.toFixed(5) ?? "",
  );
  const [longitudeText, setLongitudeText] = useState(
    farm.location.longitude?.toFixed(5) ?? "",
  );
  const [focusNonce, setFocusNonce] = useState(0);
  /** Keeps GPS on the map after confirm until farm props refresh. */
  const [sessionGps, setSessionGps] = useState<GeoCoordinateInterface | null>(null);
  const [assessmentMapMode, setAssessmentMapMode] =
    useState<FarmAssessmentMapMode>("satellite");

  const [mapContext, setMapContext] =
    useState<FarmAssessmentMapContextInterface | null>(null);
  const [mapContextError, setMapContextError] = useState<string | null>(null);
  const [isMapContextLoading, setIsMapContextLoading] = useState(false);
  const [visibleLayerIds, setVisibleLayerIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }
    // Fullscreen changes the map pane size; bump focus after layout so fitBounds
    // uses the tall viewport (inline height was ~240px in debug logs).
    const timer = window.setTimeout(() => {
      setFocusNonce((current) => current + 1);
    }, 50);
    return (): void => window.clearTimeout(timer);
  }, [isFullscreen]);

  const savedPlots = useMemo(() => getBoundaryPlots(boundary), [boundary]);

  const farmGps = useMemo((): GeoCoordinateInterface | null => {
    if (pendingLocation) {
      return {
        latitude: pendingLocation.latitude,
        longitude: pendingLocation.longitude,
      };
    }
    if (sessionGps) {
      return sessionGps;
    }
    const { latitude, longitude } = farm.location;
    if (latitude !== undefined && longitude !== undefined) {
      return { latitude, longitude };
    }
    return null;
  }, [farm.location, pendingLocation, sessionGps]);

  const mapCenter = useMemo((): FarmMapCenter => {
    if (farmGps) {
      return [farmGps.latitude, farmGps.longitude];
    }
    return NIGERIA_DEFAULT_CENTER;
  }, [farmGps]);

  const draftAreaHectares = useMemo((): number | null => {
    if (!isEditing) {
      return null;
    }
    const plots =
      draftPlots.length > 0
        ? draftPlots
        : draftCoordinates.length >= 3
          ? [draftCoordinates]
          : [];
    if (plots.length === 0) {
      return null;
    }
    return calculatePolygonAreaHectares(plots);
  }, [draftCoordinates, draftPlots, isEditing]);

  const displayArea =
    isEditing && draftAreaHectares !== null
      ? draftAreaHectares
      : (boundary?.areaHectares ?? farm.areaHectares ?? null);

  const canShowAssessment =
    showAssessmentLayers && !isEditing && selectedAssessmentId && mapContext !== null;

  useEffect(() => {
    if (!showAssessmentLayers || !selectedAssessmentId || isEditing) {
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
        if (!cancelled) {
          setMapContext(null);
          setMapContextError(
            isAppError(error) ? error.message : "Failed to load map overlays.",
          );
        }
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
  }, [farm.id, isEditing, selectedAssessmentId, showAssessmentLayers]);

  function syncLatLngInputs(latitude: number, longitude: number): void {
    setLatitudeText(latitude.toFixed(5));
    setLongitudeText(longitude.toFixed(5));
  }

  function handleLocate(result: {
    latitude: number;
    longitude: number;
    displayName: string;
  }): void {
    setPendingLocation(result);
    syncLatLngInputs(result.latitude, result.longitude);
    setFlyToCenter([result.latitude, result.longitude]);
    setBasemap("satellite");
    showSuccessToast(`Centered on ${result.displayName}. Confirm to save location.`);
  }

  function beginDrawMode(options?: { fresh?: boolean }): void {
    setInputMode("draw");
    setIsEditing(true);
    setIsFullscreen(true);
    setBasemap("satellite");
    setPickOnMapActive(false);

    if (options?.fresh) {
      setDraftCoordinates([]);
      setDraftPlots([]);
      setIsShapeClosed(false);
      return;
    }

    setFlyToCenter(null);
    setDraftCoordinates(savedPlots[0] ?? []);
    setDraftPlots(savedPlots.length > 0 ? savedPlots : []);
    setIsShapeClosed(savedPlots.length > 0);
  }

  async function handleConfirmLocation(): Promise<void> {
    if (!pendingLocation) {
      return;
    }

    setIsSubmitting(true);
    try {
      const confirmed = {
        latitude: pendingLocation.latitude,
        longitude: pendingLocation.longitude,
      };
      await updateFarm(farm.id, {
        location: {
          country: farm.location.country || "Nigeria",
          region: farm.location.region,
          city: farm.location.city,
          ...confirmed,
        },
      });
      setSessionGps(confirmed);
      setFlyToCenter([confirmed.latitude, confirmed.longitude]);
      setPendingLocation(null);
      beginDrawMode({ fresh: true });
      showSuccessToast("Location saved — draw the farm boundary on the map.");
      router.refresh();
    } catch (error) {
      showErrorToast(
        isAppError(error) ? error.message : "Failed to save farm location.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleMapClick(coordinate: GeoCoordinateInterface): void {
    if (pickOnMapActive && !isEditing) {
      handleLocate({
        ...coordinate,
        displayName: `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`,
      });
      setPickOnMapActive(false);
      return;
    }
  }

  function handleStartEditing(mode: BoundaryInputMode): void {
    if (mode === "draw") {
      beginDrawMode();
      return;
    }
    setInputMode(mode);
    setIsEditing(true);
    setIsFullscreen(true);
    setBasemap("satellite");
    setDraftCoordinates(savedPlots[0] ?? []);
    setDraftPlots(savedPlots.length > 0 ? savedPlots : []);
    setIsShapeClosed(savedPlots.length > 0);
    setPickOnMapActive(false);
  }

  function handleFocusOnFarm(): void {
    setFlyToCenter(null);
    if (savedPlots.length > 0) {
      const flat = savedPlots.flat();
      const lat =
        flat.reduce((sum, c) => sum + c.latitude, 0) / Math.max(flat.length, 1);
      const lng =
        flat.reduce((sum, c) => sum + c.longitude, 0) / Math.max(flat.length, 1);
      setFlyToCenter([lat, lng]);
    } else if (farmGps) {
      setFlyToCenter([farmGps.latitude, farmGps.longitude]);
    } else {
      showErrorToast("Set a farm location or save a boundary first.");
      return;
    }
    setFocusNonce((current) => current + 1);
  }

  function handleCancelEditing(): void {
    setIsEditing(false);
    setDraftCoordinates([]);
    setDraftPlots([]);
    setIsShapeClosed(false);
    setBasemap("street");
  }

  function handleCloseCurrentPlot(): void {
    if (draftCoordinates.length < 3) {
      showErrorToast("Add at least 3 points before closing the plot.");
      return;
    }
    setIsShapeClosed(true);
    setDraftPlots((current) =>
      current.length === 0
        ? [draftCoordinates]
        : [...current.slice(0, -1), draftCoordinates],
    );
  }

  function handleAddAnotherPlot(): void {
    if (!isShapeClosed || draftCoordinates.length < 3) {
      showErrorToast("Close the current plot before adding another.");
      return;
    }
    if (draftPlots.length >= 20) {
      showErrorToast("At most 20 plots are allowed.");
      return;
    }
    setDraftPlots((current) => {
      const withCurrent =
        current.length === 0
          ? [draftCoordinates]
          : [...current.slice(0, -1), draftCoordinates];
      return withCurrent;
    });
    setDraftCoordinates([]);
    setIsShapeClosed(false);
  }

  async function handleSaveBoundary(): Promise<void> {
    let plots: GeoCoordinateInterface[][] | null = null;

    if (inputMode === "draw") {
      if (!isShapeClosed || draftCoordinates.length < 3) {
        showErrorToast("Close the current plot before saving.");
        return;
      }
      plots =
        draftPlots.length === 0
          ? [draftCoordinates]
          : [...draftPlots.slice(0, -1), draftCoordinates];
    } else {
      const single = resolveBoundaryCoordinates({
        inputMode,
        coordinates: draftCoordinates,
        isShapeClosed,
      });
      plots = single ? [single] : null;
    }

    if (!plots || plots.length === 0) {
      return;
    }

    for (const plot of plots) {
      if (plot.length < 3 || plot.length > 500) {
        showErrorToast("Each plot needs between 3 and 500 vertices.");
        return;
      }
    }

    if (plots.length > 20) {
      showErrorToast("At most 20 plots are allowed.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Send coordinates (primary ring) for backends that require it, plus plots for multi-plot.
      await upsertFarmBoundary(farm.id, {
        plots,
        coordinates: plots[0] ?? [],
      });
      showSuccessToast("Farm boundary saved.");
      setIsEditing(false);
      setBasemap("street");
      setIsFullscreen(false);
      setDraftCoordinates([]);
      setDraftPlots([]);
      router.refresh();
    } catch (error) {
      showErrorToast(
        isAppError(error) ? error.message : "Failed to save farm boundary.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveBoundary(): Promise<void> {
    setIsSubmitting(true);
    try {
      await deleteFarmBoundary(farm.id);
      showSuccessToast("Farm boundary removed.");
      router.refresh();
    } catch (error) {
      showErrorToast(
        isAppError(error) ? error.message : "Failed to remove farm boundary.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const mapShell = (
    <div
      className={
        isFullscreen
          ? "bg-background fixed inset-0 z-50 flex flex-col"
          : "flex flex-col gap-3"
      }
    >
      {isFullscreen ? (
        <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <p className="text-foreground text-sm font-semibold">
              Map farm boundary — {farm.name}
            </p>
            <p className="text-muted-foreground text-xs">
              Locate the plot, draw on satellite imagery, then save. Desktop only.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(): void => {
              if (isEditing) {
                handleCancelEditing();
              }
              setIsFullscreen(false);
              setBasemap("street");
            }}
          >
            Close
          </Button>
        </div>
      ) : null}

      <div
        className={
          isFullscreen
            ? "grid min-h-0 flex-1 gap-3 p-4 lg:grid-cols-[320px_1fr]"
            : "flex flex-col gap-3"
        }
      >
        <div className="flex flex-col gap-3 overflow-auto">
          {(isFullscreen || isEditing) && !isEditing && (
            <FarmLocatePanel
              disabled={isSubmitting}
              pickOnMapActive={pickOnMapActive}
              onPickOnMapChange={setPickOnMapActive}
              onLocate={handleLocate}
              latitudeText={latitudeText}
              longitudeText={longitudeText}
              onLatitudeTextChange={setLatitudeText}
              onLongitudeTextChange={setLongitudeText}
            />
          )}

          {(isFullscreen || isEditing) && isEditing ? (
            <p className="text-muted-foreground bg-accent/40 rounded-lg px-3 py-2 text-xs">
              Drawing mode — click the map to add boundary corners, then close and save
              the plot.
            </p>
          ) : null}

          {pendingLocation && !isEditing ? (
            <div className="bg-accent/40 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs">
              <span className="text-foreground">
                Pending location: {pendingLocation.displayName}
              </span>
              <Button
                type="button"
                size="sm"
                disabled={isSubmitting}
                onClick={(): void => void handleConfirmLocation()}
              >
                Use this location
              </Button>
            </div>
          ) : null}

          {canShowAssessment ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={assessmentMapMode === "satellite" ? "default" : "outline"}
                  onClick={(): void => setAssessmentMapMode("satellite")}
                >
                  Satellite evidence
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={assessmentMapMode === "risk" ? "default" : "outline"}
                  onClick={(): void => setAssessmentMapMode("risk")}
                >
                  Risk layers
                </Button>
              </div>
              {mapContext?.legend?.length ? (
                <FarmMapLegend legend={mapContext.legend} />
              ) : null}
              {mapContext ? (
                <FarmMapLayerControls
                  tileLayers={mapContext.tileLayers}
                  visibleLayerIds={visibleLayerIds}
                  whispRiskPcrop={mapContext.whispRiskPcrop}
                  onToggleLayer={(layerId, visible): void => {
                    setVisibleLayerIds((current) => {
                      const next = new Set(current);
                      if (visible) {
                        next.add(layerId);
                      } else {
                        next.delete(layerId);
                      }
                      return next;
                    });
                  }}
                />
              ) : null}
            </div>
          ) : null}

          {mapContextError ? (
            <p className="text-destructive text-xs">{mapContextError}</p>
          ) : null}
          {isMapContextLoading ? (
            <p className="text-muted-foreground text-xs">Loading map overlays…</p>
          ) : null}
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <FarmBoundaryInputField
            center={mapCenter}
            farmGps={farmGps}
            inputMode={inputMode}
            onInputModeChange={setInputMode}
            isEditing={isEditing}
            coordinates={draftCoordinates}
            onCoordinatesChange={setDraftCoordinates}
            isShapeClosed={isShapeClosed}
            onShapeClosedChange={(closed): void => {
              setIsShapeClosed(closed);
              // Keep draftPlots in sync when "Close shape" is used (same as Close plot).
              if (closed && draftCoordinates.length >= 3) {
                setDraftPlots((current) =>
                  current.length === 0
                    ? [draftCoordinates]
                    : [...current.slice(0, -1), draftCoordinates],
                );
              }
            }}
            savedCoordinates={savedPlots[0] ?? []}
            savedPlots={savedPlots}
            draftPlots={draftPlots}
            onStartEditing={handleStartEditing}
            onCancelEditing={handleCancelEditing}
            disabled={isSubmitting}
            mapClassName={isFullscreen ? "h-full min-h-0 flex-1" : "h-[28rem] shrink-0"}
            showBasemapToggle={!isEditing}
            basemap={basemap}
            onBasemapChange={setBasemap}
            flyToCenter={flyToCenter}
            preferFarmFocus={!isEditing}
            focusNonce={focusNonce}
            pickLocationMode={pickOnMapActive}
            onPickLocation={pickOnMapActive ? handleMapClick : undefined}
            onVertexDrag={
              isEditing && isShapeClosed
                ? (index, coordinate): void => {
                    setDraftCoordinates((current) =>
                      current.map((item, i) => (i === index ? coordinate : item)),
                    );
                  }
                : undefined
            }
            assessmentMapMode={assessmentMapMode}
            areaLabel={
              displayArea !== null ? (
                <span>
                  Area:{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    {displayArea.toLocaleString()} ha
                  </span>
                  {draftPlots.length > 1 || savedPlots.length > 1
                    ? ` · ${Math.max(draftPlots.length, savedPlots.length)} plots`
                    : null}
                </span>
              ) : (
                <span>No boundary area yet</span>
              )
            }
            leadingActions={
              <>
                {!isFullscreen ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(): void => setIsFullscreen(true)}
                  >
                    Open full-screen map
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    isSubmitting || (savedPlots.length === 0 && farmGps === null)
                  }
                  onClick={handleFocusOnFarm}
                >
                  Focus on farm
                </Button>
              </>
            }
            trailingActions={
              isEditing ? (
                <>
                  {inputMode === "draw" ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting || draftCoordinates.length < 3}
                        onClick={handleCloseCurrentPlot}
                      >
                        Close plot
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting || !isShapeClosed}
                        onClick={handleAddAnotherPlot}
                      >
                        Add plot
                      </Button>
                    </>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={(): void => void handleSaveBoundary()}
                  >
                    {isSubmitting ? "Saving…" : "Save boundary"}
                  </Button>
                </>
              ) : boundary ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={(): void => void handleRemoveBoundary()}
                >
                  Remove boundary
                </Button>
              ) : null
            }
            idleHint="Open the full-screen map to locate the farm in Nigeria, then draw plot boundaries on satellite imagery."
            mapContext={mapContext}
            riskLevel={selectedRiskLevel}
            visibleLayerIds={visibleLayerIds}
            showAssessmentLayers={Boolean(canShowAssessment)}
          />
        </div>
      </div>

      <p className="text-muted-foreground px-4 pb-3 text-[11px] leading-relaxed">
        Map data © OpenStreetMap. Imagery © Esri. Forest layers © Global Forest Watch
        (UMD). Analysis via Open Foris WHISP where configured. Supports due diligence —
        not a legal EUDR certificate.
      </p>
    </div>
  );

  if (isFullscreen) {
    return mapShell;
  }

  return (
    <Card className="border-border/80 bg-surface-secondary/20 shadow-sm">
      <CardContent className="gap-card flex flex-col pt-6">{mapShell}</CardContent>
    </Card>
  );
}
