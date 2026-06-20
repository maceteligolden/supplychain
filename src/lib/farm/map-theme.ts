import type { AssessmentRiskLevel } from "@/config/farm-assessment-risk";
import type { PathOptions } from "leaflet";

/** GFW raster tile symbology — matches colors painted on the satellite map. */
export const GFW_TILE_LAYER_COLORS: Record<string, string> = {
  tree_cover_loss: "#ff6699",
  tree_cover_gain: "#4d99e4",
  integrated_alerts: "#da2044",
  cocoa_risk: "#f59300",
};

/** Mock assessment legend colors (API still returns legend; UI no longer renders it). */
export const MAP_LEGEND_COLORS = {
  landMass: "#2f6f4f",
  deforestation: "#dc2626",
  afforestation: "#16a34a",
  stability: "#166534",
} as const;

/** Leaflet path styles for farm boundary by assessment risk. */
export const RISK_BOUNDARY_STYLES: Record<AssessmentRiskLevel, PathOptions> = {
  LOW: { color: "#12b76a", fillColor: "#12b76a", fillOpacity: 0.14, weight: 2 },
  MEDIUM: { color: "#f79009", fillColor: "#f79009", fillOpacity: 0.16, weight: 2 },
  HIGH: { color: "#f04438", fillColor: "#f04438", fillOpacity: 0.18, weight: 2 },
};

/** Default boundary styling when no assessment risk is applied. */
export const DEFAULT_BOUNDARY_STYLE: PathOptions = {
  color: "#2f6f4f",
  fillColor: "#2f6f4f",
  fillOpacity: 0.15,
  weight: 2,
};

export const DRAFT_POLYLINE_STYLE: PathOptions = {
  color: "#2f6f4f",
  weight: 2,
  dashArray: "6 4",
};

/** Tailwind class hints for metric stat values on deforestation tab. */
export const METRIC_VALUE_CLASSES = {
  deforestation: "text-destructive",
  afforestation: "text-success",
  stability: "text-[#166534]",
  forestCover: "text-primary",
  whisp: "text-info",
} as const;
