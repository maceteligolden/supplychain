export interface GeoCoordinateInterface {
  /** GPS latitude (-90 to 90). */
  latitude: number;
  /** GPS longitude (-180 to 180). */
  longitude: number;
}

export interface FarmBoundaryInterface {
  /** Farm this boundary belongs to. */
  farmId: string;
  /** Primary / first plot ring (compat). */
  coordinates: GeoCoordinateInterface[];
  /** All plot rings for multi-plot farms. */
  plots?: GeoCoordinateInterface[][];
  /** Computed geodesic area in hectares. */
  areaHectares: number;
  /** ISO timestamp when the boundary was created. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

export type UpsertFarmBoundaryInput = {
  coordinates?: GeoCoordinateInterface[];
  plots?: GeoCoordinateInterface[][];
};

export type GetFarmBoundaryOutput = {
  boundary: FarmBoundaryInterface | null;
};

export type UpsertFarmBoundaryOutput = FarmBoundaryInterface;

export type DeleteFarmBoundaryOutput = {
  success: boolean;
  farmId: string;
};

export type GetFarmGeocodeOutput = {
  latitude: number;
  longitude: number;
  displayName: string;
  results?: GetFarmGeocodeOutput[];
};
