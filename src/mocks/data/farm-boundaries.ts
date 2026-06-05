import { calculatePolygonAreaHectares } from "@/lib/farm/calculate-polygon-area-hectares";
import { getFarmById, updateFarm } from "@/mocks/data/farms";
import type {
  FarmBoundaryInterface,
  GeoCoordinateInterface,
} from "@/types/farm-boundary.interface";

const ASHANTI_BOUNDARY_COORDINATES: GeoCoordinateInterface[] = [
  { latitude: 6.6895, longitude: -1.6254 },
  { latitude: 6.6895, longitude: -1.6234 },
  { latitude: 6.6875, longitude: -1.6234 },
  { latitude: 6.6875, longitude: -1.6254 },
];

const ASHANTI_BOUNDARY_AREA = calculatePolygonAreaHectares(
  ASHANTI_BOUNDARY_COORDINATES,
);

const SEED_BOUNDARIES: FarmBoundaryInterface[] = [
  {
    farmId: "farm_ashanti_cocoa_001",
    coordinates: ASHANTI_BOUNDARY_COORDINATES,
    areaHectares: ASHANTI_BOUNDARY_AREA,
    createdAt: "2025-01-12T08:00:00.000Z",
    updatedAt: "2025-01-12T08:00:00.000Z",
  },
];

/** In-memory mutable mock store — swap for MongoDB in production. */
let boundaries: FarmBoundaryInterface[] = [...SEED_BOUNDARIES];

export function getFarmBoundaryByFarmId(
  farmId: string,
): FarmBoundaryInterface | undefined {
  return boundaries.find((item) => item.farmId === farmId);
}

export function upsertFarmBoundary(
  farmId: string,
  coordinates: GeoCoordinateInterface[],
): FarmBoundaryInterface {
  const farm = getFarmById(farmId);
  if (!farm) {
    throw new Error("Farm not found");
  }

  const existing = getFarmBoundaryByFarmId(farmId);
  const areaHectares = calculatePolygonAreaHectares(coordinates);
  const now = new Date().toISOString();

  const boundary: FarmBoundaryInterface = {
    farmId,
    coordinates,
    areaHectares,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    boundaries = boundaries.map((item) => (item.farmId === farmId ? boundary : item));
  } else {
    boundaries = [...boundaries, boundary];
  }

  const statusUpdate =
    !existing && farm.status === "DRAFT" ? { status: "MAPPED" as const } : {};

  updateFarm(farmId, {
    areaHectares,
    ...statusUpdate,
  });

  return boundary;
}

export function deleteFarmBoundary(farmId: string): boolean {
  const existing = getFarmBoundaryByFarmId(farmId);
  if (!existing) {
    return false;
  }

  const farm = getFarmById(farmId);
  boundaries = boundaries.filter((item) => item.farmId !== farmId);

  if (farm) {
    const statusUpdate = farm.status === "MAPPED" ? { status: "DRAFT" as const } : {};

    updateFarm(farmId, {
      areaHectares: null,
      ...statusUpdate,
    });
  }

  return true;
}

/** Reset store to seed data — useful for tests only. */
export function resetFarmBoundariesMockStore(): void {
  boundaries = [...SEED_BOUNDARIES];
}
