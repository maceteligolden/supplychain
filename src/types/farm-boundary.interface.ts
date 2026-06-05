export interface GeoCoordinateInterface {
  /** GPS latitude (-90 to 90). */
  latitude: number;
  /** GPS longitude (-180 to 180). */
  longitude: number;
}

export interface FarmBoundaryInterface {
  /** Farm this boundary belongs to. */
  farmId: string;
  /** Polygon vertices (open ring — auto-closed on save). */
  coordinates: GeoCoordinateInterface[];
  /** Computed geodesic area in hectares. */
  areaHectares: number;
  /** ISO timestamp when the boundary was created. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

export type UpsertFarmBoundaryInput = {
  coordinates: GeoCoordinateInterface[];
};

export type GetFarmBoundaryOutput = {
  boundary: FarmBoundaryInterface | null;
};

export type UpsertFarmBoundaryOutput = FarmBoundaryInterface;

export type DeleteFarmBoundaryOutput = {
  success: boolean;
  farmId: string;
};
