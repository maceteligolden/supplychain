import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";

export interface FarmMapLegendItemInterface {
  category: string;
  color: string;
  percent: number;
  hectares: number;
}

export interface FarmMapTileLayerInterface {
  id: string;
  label: string;
  urlTemplate: string;
  opacity: number;
  defaultVisible: boolean;
}

export interface FarmNearestProtectedAreaInterface {
  name: string;
  distanceKm: number;
}

export interface FarmAssessmentMapContextInterface {
  boundary: GeoCoordinateInterface[];
  bbox: [number, number, number, number];
  legend: FarmMapLegendItemInterface[];
  tileLayers: FarmMapTileLayerInterface[];
  protectedAreas: GeoJSON.FeatureCollection;
  proximityBuffer: GeoJSON.Feature | null;
  nearestProtectedArea: FarmNearestProtectedAreaInterface | null;
  whispRiskPcrop: string | null;
}

export type GetFarmAssessmentMapContextOutput = FarmAssessmentMapContextInterface;
