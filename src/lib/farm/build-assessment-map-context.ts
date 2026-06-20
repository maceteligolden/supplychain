import type { FarmAssessmentAnalysisInterface } from "@/types/farm-assessment.interface";
import type { FarmBoundaryInterface } from "@/types/farm-boundary.interface";
import type {
  FarmAssessmentMapContextInterface,
  FarmMapLegendItemInterface,
  FarmMapTileLayerInterface,
} from "@/types/farm-map-context.interface";
import { MAP_LEGEND_COLORS } from "@/lib/farm/map-theme";

const DEFAULT_TILE_LAYERS: FarmMapTileLayerInterface[] = [
  {
    id: "tree_cover_loss",
    label: "Tree cover loss",
    urlTemplate:
      "https://tiles.globalforestwatch.org/umd_tree_cover_loss/latest/dynamic/{z}/{x}/{y}.png?startYear=2021&endYear=2024",
    opacity: 0.75,
    defaultVisible: true,
  },
  {
    id: "tree_cover_gain",
    label: "Tree cover gain",
    urlTemplate:
      "https://tiles.globalforestwatch.org/umd_tree_cover_gain_from_height/latest/dynamic/{z}/{x}/{y}.png",
    opacity: 0.65,
    defaultVisible: true,
  },
  {
    id: "integrated_alerts",
    label: "Integrated alerts",
    urlTemplate:
      "https://tiles.globalforestwatch.org/gfw_integrated_alerts/latest/dynamic/{z}/{x}/{y}.png",
    opacity: 0.7,
    defaultVisible: false,
  },
  {
    id: "cocoa_risk",
    label: "West Africa cocoa risk",
    urlTemplate:
      "https://tiles.globalforestwatch.org/gfw_west_africa_cocoa_deforestation_risk/latest/dynamic/{z}/{x}/{y}.png",
    opacity: 0.55,
    defaultVisible: false,
  },
];

function hectaresFromPercent(totalHectares: number, percent: number): number {
  return Math.round(((totalHectares * percent) / 100) * 100) / 100;
}

function buildLegend(
  analysis: FarmAssessmentAnalysisInterface,
  boundaryAreaHectares: number,
): FarmMapLegendItemInterface[] {
  const stablePercent = Math.max(
    0,
    analysis.stabilityPercent ??
      Math.max(0, 100 - analysis.deforestationPercent - analysis.afforestationPercent),
  );

  return [
    {
      category: "Farm land mass",
      color: MAP_LEGEND_COLORS.landMass,
      percent: 100,
      hectares: boundaryAreaHectares,
    },
    {
      category: "Deforestation (loss)",
      color: MAP_LEGEND_COLORS.deforestation,
      percent: analysis.deforestationPercent,
      hectares: hectaresFromPercent(
        boundaryAreaHectares,
        analysis.deforestationPercent,
      ),
    },
    {
      category: "Afforestation (gain)",
      color: MAP_LEGEND_COLORS.afforestation,
      percent: analysis.afforestationPercent,
      hectares: hectaresFromPercent(
        boundaryAreaHectares,
        analysis.afforestationPercent,
      ),
    },
    {
      category: "Stable cover",
      color: MAP_LEGEND_COLORS.stability,
      percent: stablePercent,
      hectares: hectaresFromPercent(boundaryAreaHectares, stablePercent),
    },
  ];
}

function computeBbox(
  boundary: FarmBoundaryInterface,
): [number, number, number, number] {
  const longitudes = boundary.coordinates.map((coordinate) => coordinate.longitude);
  const latitudes = boundary.coordinates.map((coordinate) => coordinate.latitude);

  return [
    Math.min(...longitudes),
    Math.min(...latitudes),
    Math.max(...longitudes),
    Math.max(...latitudes),
  ];
}

/** Builds assessment map context for mock mode or local preview. */
export function buildAssessmentMapContext(input: {
  boundary: FarmBoundaryInterface;
  analysis: FarmAssessmentAnalysisInterface;
  boundaryAreaHectares: number;
}): FarmAssessmentMapContextInterface {
  return {
    boundary: input.boundary.coordinates,
    bbox: computeBbox(input.boundary),
    legend: buildLegend(input.analysis, input.boundaryAreaHectares),
    tileLayers: DEFAULT_TILE_LAYERS,
    protectedAreas: { type: "FeatureCollection", features: [] },
    proximityBuffer: null,
    nearestProtectedArea: null,
    whispRiskPcrop: input.analysis.whispRiskPcrop ?? null,
  };
}

export { MAP_LEGEND_COLORS as LEGEND_COLORS };
