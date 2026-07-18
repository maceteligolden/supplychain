"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression, LatLngTuple, PathOptions } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";
import { RISK_BOUNDARY_COLORS } from "@/lib/farm/map-theme";
import type { FarmMapCenter } from "@/lib/farm/map-types";
import { NIGERIA_DEFAULT_CENTER } from "@/lib/farm/map-types";
import type { FarmAssessmentMapContextInterface } from "@/types/farm-map-context.interface";
import type { FarmAssessmentMapMode } from "@/types/farm-map-context.interface";
import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";

const DEFAULT_ZOOM = 6;
const LOCATE_ZOOM = 15;

const STREET_TILES = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

const SATELLITE_TILES = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution:
    "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
};

export type FarmUnifiedBasemap = "street" | "satellite";

function toLatLng(coordinates: GeoCoordinateInterface[]): LatLngTuple[] {
  return coordinates.map((coord) => [coord.latitude, coord.longitude]);
}

function closeRing(coordinates: GeoCoordinateInterface[]): GeoCoordinateInterface[] {
  if (coordinates.length < 3) {
    return coordinates;
  }
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (
    first &&
    last &&
    (first.latitude !== last.latitude || first.longitude !== last.longitude)
  ) {
    return [...coordinates, first];
  }
  return coordinates;
}

/** World polygon with farm plot holes — hides GFW tiles outside the boundary. */
function buildClipMaskGeoJson(
  plots: GeoCoordinateInterface[][],
): GeoJSON.Feature<GeoJSON.Polygon> | null {
  const holes = plots
    .filter((plot) => plot.length >= 3)
    .map((plot) =>
      closeRing(plot)
        .map((c) => [c.longitude, c.latitude] as [number, number])
        .reverse(),
    );

  if (holes.length === 0) {
    return null;
  }

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-180, -85],
          [180, -85],
          [180, 85],
          [-180, 85],
          [-180, -85],
        ],
        ...holes,
      ],
    },
  };
}

function MapClickHandler({
  enabled,
  onMapClick,
}: {
  enabled: boolean;
  onMapClick?: (coordinate: GeoCoordinateInterface) => void;
}): null {
  useMapEvents({
    click(event): void {
      if (!enabled || !onMapClick) {
        return;
      }
      onMapClick({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });
  return null;
}

function focusMapOnFarm(
  map: L.Map,
  plots: GeoCoordinateInterface[][],
  farmGps: GeoCoordinateInterface | null | undefined,
  options?: { padding?: [number, number]; maxZoom?: number },
): boolean {
  const padding = options?.padding ?? [32, 32];
  const maxZoom = options?.maxZoom ?? 16;
  const flat = plots.flat();
  if (flat.length > 0) {
    map.fitBounds(toLatLng(flat), { padding, maxZoom });
    return true;
  }
  if (farmGps) {
    map.flyTo([farmGps.latitude, farmGps.longitude], LOCATE_ZOOM, { duration: 0.8 });
    return true;
  }
  return false;
}

const DEFAULT_FOCUS_PADDING: [number, number] = [32, 32];
const DEFAULT_FOCUS_MAX_ZOOM = 16;
/** Tighter frame once assessment overlays are on so the plot fills the view. */
const ASSESSMENT_FOCUS_PADDING: [number, number] = [0, 0];
const ASSESSMENT_FOCUS_MAX_ZOOM = 20;
const MAP_MAX_ZOOM = 22;
/** Near-opaque so GFW tiles outside the plot are not readable. */
const CLIP_MASK_FILL_OPACITY = 0.96;

function MapViewController({
  center,
  plots,
  farmGps,
  isDrawing,
  flyToCenter,
  bbox,
  preferFarmFocus = false,
  focusNonce = 0,
  tightFarmFocus = false,
}: {
  center: FarmMapCenter;
  plots: GeoCoordinateInterface[][];
  farmGps?: GeoCoordinateInterface | null;
  isDrawing: boolean;
  flyToCenter?: FarmMapCenter | null;
  bbox?: [number, number, number, number] | null;
  /** When true, always zoom to farm boundary/GPS. */
  preferFarmFocus?: boolean;
  /** Increment to re-run focus (Focus on farm CTA / fullscreen). */
  focusNonce?: number;
  /** When true, zoom closer so the boundary dominates the viewport. */
  tightFarmFocus?: boolean;
}): null {
  const map = useMap();
  const focusPadding = tightFarmFocus
    ? ASSESSMENT_FOCUS_PADDING
    : DEFAULT_FOCUS_PADDING;
  const focusMaxZoom = tightFarmFocus
    ? ASSESSMENT_FOCUS_MAX_ZOOM
    : DEFAULT_FOCUS_MAX_ZOOM;

  const applyFarmFocus = useCallback((): boolean => {
    map.invalidateSize({ animate: false });
    if (preferFarmFocus && !isDrawing) {
      return focusMapOnFarm(map, plots, farmGps, {
        padding: focusPadding,
        maxZoom: focusMaxZoom,
      });
    }
    const flat = plots.flat();
    if (flat.length > 0 && !isDrawing) {
      map.fitBounds(toLatLng(flat), {
        padding: focusPadding,
        maxZoom: focusMaxZoom,
      });
      return true;
    }
    return false;
  }, [farmGps, focusMaxZoom, focusPadding, isDrawing, map, plots, preferFarmFocus]);

  useEffect(() => {
    if (flyToCenter) {
      map.flyTo([flyToCenter[0], flyToCenter[1]], LOCATE_ZOOM, { duration: 1 });
    }
  }, [flyToCenter, map]);

  useEffect(() => {
    if (focusNonce > 0) {
      applyFarmFocus();
    }
  }, [applyFarmFocus, focusNonce]);

  useEffect(() => {
    if (flyToCenter) {
      return;
    }

    if (applyFarmFocus()) {
      return;
    }

    if (bbox && !preferFarmFocus) {
      map.invalidateSize({ animate: false });
      const [west, south, east, north] = bbox;
      map.fitBounds(
        [
          [south, west],
          [north, east],
        ],
        { padding: focusPadding, maxZoom: focusMaxZoom },
      );
      return;
    }

    if (farmGps) {
      map.setView([farmGps.latitude, farmGps.longitude], LOCATE_ZOOM);
      return;
    }

    map.setView([center[0], center[1]], isDrawing ? LOCATE_ZOOM : DEFAULT_ZOOM);
  }, [
    bbox,
    center,
    farmGps,
    flyToCenter,
    focusMaxZoom,
    focusPadding,
    isDrawing,
    map,
    plots,
    preferFarmFocus,
    tightFarmFocus,
    applyFarmFocus,
  ]);

  // Re-fit when the map pane resizes (e.g. entering fullscreen) — otherwise zoom
  // stays computed for the previous short viewport (see debug mapSize.y ≈ 240).
  useEffect(() => {
    const container = map.getContainer();
    let frame = 0;
    let lastW = 0;
    let lastH = 0;
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const size = map.getSize();
        if (Math.abs(size.x - lastW) < 16 && Math.abs(size.y - lastH) < 16) {
          return;
        }
        lastW = size.x;
        lastH = size.y;
        if (flyToCenter || isDrawing) {
          map.invalidateSize({ animate: false });
          return;
        }
        applyFarmFocus();
      });
    });
    observer.observe(container);
    return (): void => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [
    applyFarmFocus,
    flyToCenter,
    focusMaxZoom,
    focusPadding,
    isDrawing,
    map,
    plots,
    farmGps,
    preferFarmFocus,
    tightFarmFocus,
  ]);

  return null;
}

const vertexIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#f59e0b;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:grab"></span>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function DraggableVertexMarkers({
  coordinates,
  enabled,
  onVertexDrag,
}: {
  coordinates: GeoCoordinateInterface[];
  enabled: boolean;
  onVertexDrag?: (index: number, coordinate: GeoCoordinateInterface) => void;
}): React.JSX.Element {
  if (!enabled || !onVertexDrag || coordinates.length === 0) {
    return <></>;
  }

  return (
    <>
      {coordinates.map((coord, index) => (
        <Marker
          key={`vertex-${index}`}
          position={[coord.latitude, coord.longitude]}
          icon={vertexIcon}
          draggable
          eventHandlers={{
            dragend: (event): void => {
              const marker = event.target as L.Marker;
              const latLng = marker.getLatLng();
              onVertexDrag(index, {
                latitude: latLng.lat,
                longitude: latLng.lng,
              });
            },
          }}
        />
      ))}
    </>
  );
}

export interface FarmUnifiedMapProps {
  center?: FarmMapCenter;
  farmGps?: GeoCoordinateInterface | null;
  savedPlots: GeoCoordinateInterface[][];
  draftCoordinates?: GeoCoordinateInterface[];
  draftPlots?: GeoCoordinateInterface[][];
  isDrawing: boolean;
  isShapeClosed: boolean;
  pickLocationMode?: boolean;
  basemap?: FarmUnifiedBasemap;
  flyToCenter?: FarmMapCenter | null;
  onMapClick?: (coordinate: GeoCoordinateInterface) => void;
  onVertexDrag?: (index: number, coordinate: GeoCoordinateInterface) => void;
  mapContext?: FarmAssessmentMapContextInterface | null;
  riskLevel?: AssessmentRiskLevel | null;
  visibleLayerIds?: Set<string>;
  showAssessmentLayers?: boolean;
  assessmentMapMode?: FarmAssessmentMapMode;
  preferFarmFocus?: boolean;
  focusNonce?: number;
  className?: string;
}

/**
 * FarmUnifiedMap — free Leaflet map (OSM + Esri) for locate, draw, and overlays.
 */
export function FarmUnifiedMap({
  center = NIGERIA_DEFAULT_CENTER,
  farmGps = null,
  savedPlots,
  draftCoordinates = [],
  draftPlots = [],
  isDrawing,
  isShapeClosed,
  pickLocationMode = false,
  basemap = "street",
  flyToCenter = null,
  onMapClick,
  onVertexDrag,
  mapContext = null,
  riskLevel = null,
  visibleLayerIds = new Set(),
  showAssessmentLayers = false,
  assessmentMapMode = "satellite",
  preferFarmFocus = false,
  focusNonce = 0,
  className = "h-full w-full min-h-[16rem]",
}: FarmUnifiedMapProps): React.JSX.Element {
  const displayPlots = useMemo((): GeoCoordinateInterface[][] => {
    if (isDrawing && draftPlots.length > 0) {
      if (isShapeClosed && draftCoordinates.length >= 3) {
        return [...draftPlots.slice(0, -1), draftCoordinates];
      }
      return draftPlots;
    }
    if (isDrawing && isShapeClosed && draftCoordinates.length >= 3) {
      return [draftCoordinates];
    }
    return savedPlots;
  }, [draftCoordinates, draftPlots, isDrawing, isShapeClosed, savedPlots]);

  const openDraft =
    isDrawing && !isShapeClosed && draftCoordinates.length > 0 ? draftCoordinates : [];

  const effectiveBasemap: FarmUnifiedBasemap =
    showAssessmentLayers && !isDrawing
      ? assessmentMapMode === "satellite"
        ? "satellite"
        : basemap === "satellite"
          ? "satellite"
          : "street"
      : isDrawing
        ? "satellite"
        : basemap;

  // Risk mode prefers a clearer categorical fill; still use satellite under overlays when in satellite mode
  const tiles = effectiveBasemap === "satellite" ? SATELLITE_TILES : STREET_TILES;

  /** Solid tint under GFW tiles so areas without loss/gain pixels don’t look “unanalyzed”. */
  const landCoverFillStyle: PathOptions | null = ((): PathOptions | null => {
    if (!showAssessmentLayers || !mapContext?.legend?.length || isDrawing) {
      return null;
    }
    const stable = mapContext.legend.find((item) => item.category === "Stable cover");
    const nonForest = mapContext.legend.find((item) => item.category === "Non-forest");
    const baseFill =
      (stable?.percent ?? 0) >= (nonForest?.percent ?? 0)
        ? (stable?.color ?? "#166534")
        : (nonForest?.color ?? "#a8a29e");
    return {
      color: "transparent",
      fillColor: baseFill,
      fillOpacity: assessmentMapMode === "risk" ? 0.7 : 0.55,
      weight: 0,
    };
  })();

  const boundaryStyle: PathOptions = useMemo(() => {
    if (showAssessmentLayers && riskLevel) {
      const colors = RISK_BOUNDARY_COLORS[riskLevel];
      return {
        color: colors.stroke,
        fillColor: colors.fill,
        fillOpacity: landCoverFillStyle
          ? 0
          : assessmentMapMode === "risk"
            ? 0.35
            : 0.14,
        weight: 2.5,
      };
    }
    return {
      color: "#1d4ed8",
      fillColor: "#2563eb",
      fillOpacity: 0.15,
      weight: 2.5,
    };
  }, [assessmentMapMode, landCoverFillStyle, riskLevel, showAssessmentLayers]);

  const activeTileLayers = useMemo(() => {
    if (!showAssessmentLayers || !mapContext || isDrawing) {
      return [];
    }
    return mapContext.tileLayers.filter(
      (layer) =>
        visibleLayerIds.has(layer.id) &&
        (assessmentMapMode === "satellite" ||
          layer.id === "tree_cover_density" ||
          layer.id === "tree_cover_loss" ||
          layer.id === "tree_cover_gain"),
    );
  }, [assessmentMapMode, isDrawing, mapContext, showAssessmentLayers, visibleLayerIds]);

  const clipMask = useMemo(
    () =>
      showAssessmentLayers && !isDrawing ? buildClipMaskGeoJson(displayPlots) : null,
    [displayPlots, isDrawing, showAssessmentLayers],
  );

  const showFarmMarker =
    !isDrawing &&
    savedPlots.length === 0 &&
    farmGps !== null &&
    (pickLocationMode || true);

  const mapCenter: LatLngExpression = useMemo(() => {
    if (mapContext?.bbox) {
      const [west, south, east, north] = mapContext.bbox;
      return [(south + north) / 2, (west + east) / 2];
    }
    return [center[0], center[1]];
  }, [center, mapContext]);

  const gpsIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#2563eb;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    [],
  );

  return (
    <MapContainer
      center={mapCenter}
      zoom={DEFAULT_ZOOM}
      maxZoom={MAP_MAX_ZOOM}
      className={className}
      scrollWheelZoom
    >
      <TileLayer
        url={tiles.url}
        attribution={tiles.attribution}
        maxZoom={MAP_MAX_ZOOM}
      />

      {landCoverFillStyle
        ? displayPlots.map((plot, index) =>
            plot.length >= 3 ? (
              <Polygon
                key={`landcover-fill-${index}`}
                positions={toLatLng(closeRing(plot))}
                pathOptions={landCoverFillStyle}
              />
            ) : null,
          )
        : null}

      {activeTileLayers.map((layer) => (
        <TileLayer
          key={layer.id}
          url={layer.urlTemplate}
          opacity={layer.opacity}
          attribution="© Global Forest Watch / UMD"
          zIndex={350}
          maxZoom={MAP_MAX_ZOOM}
          maxNativeZoom={12}
        />
      ))}

      {clipMask ? (
        <GeoJSON
          key={`mask-${displayPlots.length}-${displayPlots[0]?.[0]?.latitude ?? 0}`}
          data={clipMask}
          style={{
            color: "transparent",
            fillColor: "#0f172a",
            fillOpacity: CLIP_MASK_FILL_OPACITY,
            weight: 0,
          }}
          pathOptions={{ interactive: false }}
        />
      ) : null}

      {displayPlots.map((plot, index) =>
        plot.length >= 3 ? (
          <Polygon
            key={`plot-${index}`}
            positions={toLatLng(closeRing(plot))}
            pathOptions={boundaryStyle}
          />
        ) : null,
      )}

      {openDraft.length > 0 ? (
        <Polyline
          positions={toLatLng(openDraft)}
          pathOptions={{
            color: "#f59e0b",
            weight: 2,
            dashArray: "6 4",
          }}
        />
      ) : null}

      <DraggableVertexMarkers
        coordinates={isDrawing ? draftCoordinates : []}
        enabled={isDrawing && isShapeClosed}
        onVertexDrag={onVertexDrag}
      />

      {showFarmMarker && farmGps ? (
        <Marker position={[farmGps.latitude, farmGps.longitude]} icon={gpsIcon} />
      ) : null}

      <MapClickHandler enabled={Boolean(onMapClick)} onMapClick={onMapClick} />
      <MapViewController
        center={center}
        plots={displayPlots}
        farmGps={farmGps}
        isDrawing={isDrawing}
        flyToCenter={flyToCenter}
        bbox={mapContext?.bbox ?? null}
        preferFarmFocus={preferFarmFocus}
        focusNonce={focusNonce}
        tightFarmFocus={showAssessmentLayers && !isDrawing}
      />
    </MapContainer>
  );
}
