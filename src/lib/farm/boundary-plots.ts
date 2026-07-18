import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";

export const MAX_BOUNDARY_PLOTS = 20;
export const MIN_RING_VERTICES = 3;
export const MAX_RING_VERTICES = 500;

/** Returns plot rings from a boundary (compat with legacy coordinates-only). */
export function getBoundaryPlots(
  boundary: {
    coordinates: GeoCoordinateInterface[];
    plots?: GeoCoordinateInterface[][];
  } | null,
): GeoCoordinateInterface[][] {
  if (!boundary) {
    return [];
  }

  if (boundary.plots && boundary.plots.length > 0) {
    return boundary.plots;
  }

  if (boundary.coordinates.length >= MIN_RING_VERTICES) {
    return [boundary.coordinates];
  }

  return [];
}

/** Flattens plots to the primary ring for simple consumers. */
export function primaryPlotCoordinates(
  plots: GeoCoordinateInterface[][],
): GeoCoordinateInterface[] {
  return plots[0] ?? [];
}
