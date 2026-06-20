"use client";

import { useEffect, useMemo } from "react";
import {
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
import {
  DEFAULT_BOUNDARY_STYLE,
  DRAFT_POLYLINE_STYLE,
  RISK_BOUNDARY_STYLES,
} from "@/lib/farm/map-theme";
import type { FarmAssessmentMapContextInterface } from "@/types/farm-map-context.interface";
import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";

const DEFAULT_CENTER: LatLngExpression = [7.95, -1.03];
const DEFAULT_ZOOM = 6;
const DRAW_ZOOM = 14;
const GPS_ZOOM = 16;

const STREET_TILES = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

const SATELLITE_TILES = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution:
    "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
};

export type FarmUnifiedBasemap = "street" | "satellite";

function toLatLng(coordinates: GeoCoordinateInterface[]): LatLngTuple[] {
  return coordinates.map((coord) => [coord.latitude, coord.longitude]);
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

function MapViewController({
  center,
  coordinates,
  farmGps,
  isDrawing,
  flyToCenter,
  bbox,
}: {
  center: LatLngExpression;
  coordinates: GeoCoordinateInterface[];
  farmGps?: GeoCoordinateInterface | null;
  isDrawing: boolean;
  flyToCenter?: LatLngExpression | null;
  bbox?: [number, number, number, number] | null;
}): null {
  const map = useMap();

  useEffect(() => {
    if (flyToCenter) {
      map.flyTo(flyToCenter, GPS_ZOOM, { duration: 1 });
    }
  }, [flyToCenter, map]);

  useEffect(() => {
    if (flyToCenter) {
      return;
    }

    if (coordinates.length > 0) {
      map.fitBounds(toLatLng(coordinates), { padding: [24, 24], maxZoom: 16 });
      return;
    }

    if (bbox) {
      const [west, south, east, north] = bbox;
      map.fitBounds(
        [
          [south, west],
          [north, east],
        ],
        { padding: [24, 24], maxZoom: 16 },
      );
      return;
    }

    if (farmGps) {
      map.setView([farmGps.latitude, farmGps.longitude], GPS_ZOOM);
      return;
    }

    map.setView(center, isDrawing ? DRAW_ZOOM : DEFAULT_ZOOM);
  }, [bbox, center, coordinates, farmGps, flyToCenter, isDrawing, map]);

  return null;
}

export interface FarmUnifiedMapProps {
  center?: LatLngExpression;
  farmGps?: GeoCoordinateInterface | null;
  savedCoordinates: GeoCoordinateInterface[];
  draftCoordinates?: GeoCoordinateInterface[];
  isDrawing: boolean;
  isShapeClosed: boolean;
  basemap?: FarmUnifiedBasemap;
  flyToCenter?: LatLngExpression | null;
  onMapClick?: (coordinate: GeoCoordinateInterface) => void;
  mapContext?: FarmAssessmentMapContextInterface | null;
  riskLevel?: AssessmentRiskLevel | null;
  visibleLayerIds?: Set<string>;
  showAssessmentLayers?: boolean;
}

/**
 * FarmUnifiedMap
 *
 * Single Leaflet map for boundary draw/view and assessment overlays.
 */
export function FarmUnifiedMap({
  center = DEFAULT_CENTER,
  farmGps = null,
  savedCoordinates,
  draftCoordinates = [],
  isDrawing,
  isShapeClosed,
  basemap = "street",
  flyToCenter = null,
  onMapClick,
  mapContext = null,
  riskLevel = null,
  visibleLayerIds = new Set(),
  showAssessmentLayers = false,
}: FarmUnifiedMapProps): React.JSX.Element {
  const displayCoordinates = isDrawing ? draftCoordinates : savedCoordinates;
  const showPolygon = isDrawing ? isShapeClosed : displayCoordinates.length >= 3;
  const showPolyline = isDrawing && !isShapeClosed && draftCoordinates.length > 0;
  const showFarmMarker =
    !isDrawing &&
    savedCoordinates.length === 0 &&
    farmGps !== null &&
    farmGps !== undefined;

  const effectiveBasemap = showAssessmentLayers && !isDrawing ? "satellite" : basemap;
  const tiles = effectiveBasemap === "satellite" ? SATELLITE_TILES : STREET_TILES;

  const boundaryStyle: PathOptions = useMemo(() => {
    if (showAssessmentLayers && riskLevel) {
      return RISK_BOUNDARY_STYLES[riskLevel];
    }
    return DEFAULT_BOUNDARY_STYLE;
  }, [riskLevel, showAssessmentLayers]);

  const activeTileLayers = useMemo(() => {
    if (!showAssessmentLayers || !mapContext) {
      return [];
    }
    return mapContext.tileLayers.filter((layer) => visibleLayerIds.has(layer.id));
  }, [mapContext, showAssessmentLayers, visibleLayerIds]);

  const mapCenter = useMemo((): LatLngExpression => {
    if (mapContext?.bbox) {
      const [west, south, east, north] = mapContext.bbox;
      return [(south + north) / 2, (west + east) / 2];
    }
    return center;
  }, [center, mapContext]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer attribution={tiles.attribution} url={tiles.url} />
      {activeTileLayers.map((layer) => (
        <TileLayer
          key={layer.id}
          url={layer.urlTemplate}
          opacity={layer.opacity}
          zIndex={200}
        />
      ))}
      <MapViewController
        center={center}
        coordinates={displayCoordinates}
        farmGps={farmGps}
        isDrawing={isDrawing}
        flyToCenter={flyToCenter}
        bbox={showAssessmentLayers ? (mapContext?.bbox ?? null) : null}
      />
      <MapClickHandler enabled={isDrawing && !isShapeClosed} onMapClick={onMapClick} />
      {showFarmMarker && farmGps ? (
        <Marker
          position={[farmGps.latitude, farmGps.longitude]}
          icon={L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })}
        />
      ) : null}
      {showPolyline ? (
        <Polyline
          positions={toLatLng(draftCoordinates)}
          pathOptions={DRAFT_POLYLINE_STYLE}
        />
      ) : null}
      {showPolygon ? (
        <Polygon positions={toLatLng(displayCoordinates)} pathOptions={boundaryStyle} />
      ) : null}
    </MapContainer>
  );
}
