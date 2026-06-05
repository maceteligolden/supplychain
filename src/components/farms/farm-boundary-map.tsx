"use client";

import { useEffect } from "react";
import {
  MapContainer,
  Polygon,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";

const DEFAULT_CENTER: LatLngExpression = [7.95, -1.03];
const DEFAULT_ZOOM = 6;
const DRAW_ZOOM = 14;

export interface FarmBoundaryMapProps {
  /** Map centre when farm GPS is unavailable. */
  center?: LatLngExpression;
  /** Saved or draft polygon vertices. */
  coordinates: GeoCoordinateInterface[];
  /** In-progress polyline before the shape is closed. */
  draftCoordinates?: GeoCoordinateInterface[];
  /** Whether click-to-draw is active. */
  isDrawing: boolean;
  /** Whether the draft shape has been closed. */
  isShapeClosed: boolean;
  /** Called when the user clicks the map while drawing. */
  onMapClick?: (coordinate: GeoCoordinateInterface) => void;
}

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
  isDrawing,
}: {
  center: LatLngExpression;
  coordinates: GeoCoordinateInterface[];
  isDrawing: boolean;
}): null {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = toLatLng(coordinates);
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: DRAW_ZOOM });
      return;
    }

    map.setView(center, isDrawing ? DRAW_ZOOM : DEFAULT_ZOOM);
  }, [center, coordinates, isDrawing, map]);

  return null;
}

/**
 * FarmBoundaryMap
 *
 * Leaflet map for viewing and click-drawing farm boundary polygons.
 */
export function FarmBoundaryMap({
  center = DEFAULT_CENTER,
  coordinates,
  draftCoordinates = [],
  isDrawing,
  isShapeClosed,
  onMapClick,
}: FarmBoundaryMapProps): React.JSX.Element {
  const displayCoordinates = isDrawing ? draftCoordinates : coordinates;
  const showPolygon = isDrawing ? isShapeClosed : displayCoordinates.length >= 3;
  const showPolyline = isDrawing && !isShapeClosed && draftCoordinates.length > 0;

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewController
        center={center}
        coordinates={displayCoordinates}
        isDrawing={isDrawing}
      />
      <MapClickHandler enabled={isDrawing && !isShapeClosed} onMapClick={onMapClick} />
      {showPolyline ? (
        <Polyline
          positions={toLatLng(draftCoordinates)}
          pathOptions={{ color: "var(--primary)", weight: 2, dashArray: "6 4" }}
        />
      ) : null}
      {showPolygon ? (
        <Polygon
          positions={toLatLng(displayCoordinates)}
          pathOptions={{
            color: "var(--primary)",
            fillColor: "var(--primary)",
            fillOpacity: 0.15,
            weight: 2,
          }}
        />
      ) : null}
    </MapContainer>
  );
}
