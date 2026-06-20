import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";

type ParseGeoJsonBoundaryOutput = {
  coordinates: GeoCoordinateInterface[];
};

function ringToCoordinates(ring: number[][]): GeoCoordinateInterface[] {
  const coordinates: GeoCoordinateInterface[] = [];

  for (const pair of ring) {
    const longitude = pair[0];
    const latitude = pair[1];
    if (typeof longitude !== "number" || typeof latitude !== "number") {
      continue;
    }
    coordinates.push({ latitude, longitude });
  }

  if (coordinates.length > 1) {
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    if (
      first &&
      last &&
      first.latitude === last.latitude &&
      first.longitude === last.longitude
    ) {
      return coordinates.slice(0, -1);
    }
  }

  return coordinates;
}

function extractRingFromGeometry(geometry: GeoJSON.Geometry): GeoCoordinateInterface[] {
  if (geometry.type === "Polygon") {
    return ringToCoordinates(geometry.coordinates[0] ?? []);
  }

  if (geometry.type === "MultiPolygon") {
    const firstPolygon = geometry.coordinates[0]?.[0];
    if (!firstPolygon) {
      throw new Error("MultiPolygon has no coordinates");
    }
    return ringToCoordinates(firstPolygon);
  }

  throw new Error("GeoJSON must contain a Polygon or MultiPolygon geometry");
}

/** Parses a GeoJSON file into farm boundary coordinates (WGS84). */
export function parseGeoJsonBoundary(input: unknown): ParseGeoJsonBoundaryOutput {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid GeoJSON file");
  }

  const geoJson = input as GeoJSON.GeoJSON;

  if (geoJson.type === "FeatureCollection") {
    const feature = geoJson.features.find(
      (item) =>
        item.geometry?.type === "Polygon" || item.geometry?.type === "MultiPolygon",
    );

    if (!feature?.geometry) {
      throw new Error("GeoJSON FeatureCollection must include a Polygon feature");
    }

    const coordinates = extractRingFromGeometry(feature.geometry);
    if (coordinates.length < 3) {
      throw new Error("Boundary polygon must have at least 3 points");
    }

    return { coordinates };
  }

  if (geoJson.type === "Feature" && geoJson.geometry) {
    const coordinates = extractRingFromGeometry(geoJson.geometry);
    if (coordinates.length < 3) {
      throw new Error("Boundary polygon must have at least 3 points");
    }

    return { coordinates };
  }

  if (geoJson.type === "Polygon" || geoJson.type === "MultiPolygon") {
    const coordinates = extractRingFromGeometry(geoJson);
    if (coordinates.length < 3) {
      throw new Error("Boundary polygon must have at least 3 points");
    }

    return { coordinates };
  }

  throw new Error(
    "Unsupported GeoJSON structure — use a Polygon Feature or FeatureCollection",
  );
}
