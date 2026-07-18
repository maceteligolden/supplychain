import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";

/** GFW raster tile symbology — matches colors painted on the assessment map. */
export const GFW_TILE_LAYER_COLORS: Record<string, string> = {
  tree_cover_loss: "#ff6699",
  tree_cover_gain: "#4d99e4",
};

/** Assessment legend colors for risk-layer mode. */
export const MAP_LEGEND_COLORS = {
  deforestation: "#dc2626",
  afforestation: "#16a34a",
  stability: "#166534",
  nonForest: "#a8a29e",
} as const;

export const RISK_BOUNDARY_COLORS: Record<
  AssessmentRiskLevel,
  { stroke: string; fill: string }
> = {
  LOW: { stroke: "#12b76a", fill: "#12b76a" },
  MEDIUM: { stroke: "#f79009", fill: "#f79009" },
  HIGH: { stroke: "#f04438", fill: "#f04438" },
};

/** Tailwind class hints for metric stat values on deforestation tab. */
export const METRIC_VALUE_CLASSES = {
  deforestation: "text-destructive",
  afforestation: "text-success",
  stability: "text-[#166534]",
  forestCover: "text-primary",
  whisp: "text-info",
} as const;
