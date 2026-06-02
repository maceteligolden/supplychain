export type ReportCategory = "inventory" | "shipments" | "orders" | "financial";

export interface ReportDefinitionInterface {
  /** Unique report identifier. */
  id: string;
  /** Report display name. */
  name: string;
  /** Short description of what the report covers. */
  description: string;
  /** Report category for grouping. */
  category: ReportCategory;
  /** Supported date range presets. */
  dateRangePresets: string[];
  /** ISO timestamp of last generated report. */
  lastGeneratedAt: string | null;
}

export type GetReportsOutput = {
  reports: ReportDefinitionInterface[];
  total: number;
};
