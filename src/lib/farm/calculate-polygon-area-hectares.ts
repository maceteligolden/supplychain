import area from "@turf/area";
import { polygon } from "@turf/helpers";

import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";

const SQUARE_METRES_PER_HECTARE = 10_000;

/** Closes an open coordinate ring by appending the first vertex if needed. */
export function closeCoordinateRing(
  coordinates: GeoCoordinateInterface[],
): GeoCoordinateInterface[] {
  if (coordinates.length < 3) {
    return coordinates;
  }

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  if (!first || !last) {
    return coordinates;
  }

  if (first.latitude === last.latitude && first.longitude === last.longitude) {
    return coordinates;
  }

  return [...coordinates, first];
}

/**
 * Computes geodesic polygon area in hectares from latitude/longitude vertices.
 */
export function calculatePolygonAreaHectares(
  coordinates: GeoCoordinateInterface[],
): number {
  const closed = closeCoordinateRing(coordinates);

  if (closed.length < 4) {
    return 0;
  }

  const ring = closed.map(
    (coord) => [coord.longitude, coord.latitude] as [number, number],
  );

  const feature = polygon([ring]);
  const squareMetres = area(feature);

  return Math.round((squareMetres / SQUARE_METRES_PER_HECTARE) * 100) / 100;
}
