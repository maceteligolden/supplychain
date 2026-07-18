import type { FarmAssessmentAnalysisInterface } from "@/types/farm-assessment.interface";
import type { FarmBoundaryInterface } from "@/types/farm-boundary.interface";
import type {
  FarmAssessmentMapContextInterface,
  FarmMapLegendItemInterface,
  FarmMapTileLayerInterface,
} from "@/types/farm-map-context.interface";
import { getBoundaryPlots } from "@/lib/farm/boundary-plots";
import { MAP_LEGEND_COLORS } from "@/lib/farm/map-theme";

const DEFAULT_TILE_LAYERS: FarmMapTileLayerInterface[] = [
  {
    id: "tree_cover_density",
    label: "Tree cover density",
    urlTemplate:
      "https://tiles.globalforestwatch.org/umd_tree_cover_density_2000/latest/dynamic/{z}/{x}/{y}.png",
    opacity: 0.7,
    defaultVisible: true,
  },
  {
    id: "tree_cover_loss",
    label: "Tree cover loss",
    urlTemplate:
      "https://tiles.globalforestwatch.org/umd_tree_cover_loss/latest/dynamic/{z}/{x}/{y}.png?startYear=2021&endYear=2024",
    opacity: 0.8,
    defaultVisible: true,
  },
  {
    id: "tree_cover_gain",
    label: "Tree cover gain",
    urlTemplate:
      "https://tiles.globalforestwatch.org/umd_tree_cover_gain_from_height/latest/dynamic/{z}/{x}/{y}.png",
    opacity: 0.7,
    defaultVisible: true,
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
  const nonForestPercent = Math.max(
    0,
    Math.round(
      (100 -
        analysis.deforestationPercent -
        analysis.afforestationPercent -
        stablePercent) *
        100,
    ) / 100,
  );

  return [
    {
      category: "Tree cover loss",
      color: MAP_LEGEND_COLORS.deforestation,
      percent: analysis.deforestationPercent,
      hectares: hectaresFromPercent(
        boundaryAreaHectares,
        analysis.deforestationPercent,
      ),
    },
    {
      category: "Tree cover gain",
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
    {
      category: "Non-forest",
      color: MAP_LEGEND_COLORS.nonForest,
      percent: nonForestPercent,
      hectares: hectaresFromPercent(boundaryAreaHectares, nonForestPercent),
    },
  ];
}

function computeBbox(
  plots: { latitude: number; longitude: number }[][],
): [number, number, number, number] {
  const longitudes = plots.flatMap((plot) => plot.map((c) => c.longitude));
  const latitudes = plots.flatMap((plot) => plot.map((c) => c.latitude));

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
  const plots = getBoundaryPlots(input.boundary);

  return {
    boundary: plots[0] ?? input.boundary.coordinates,
    plots,
    bbox: computeBbox(plots.length > 0 ? plots : [input.boundary.coordinates]),
    legend: buildLegend(input.analysis, input.boundaryAreaHectares),
    tileLayers: DEFAULT_TILE_LAYERS,
    protectedAreas: { type: "FeatureCollection", features: [] },
    proximityBuffer: null,
    nearestProtectedArea: null,
    whispRiskPcrop: input.analysis.whispRiskPcrop ?? null,
  };
}

export { MAP_LEGEND_COLORS as LEGEND_COLORS };
