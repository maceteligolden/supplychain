export type ActivityType =
  | "order_created"
  | "shipment_dispatched"
  | "inventory_low"
  | "supplier_added";

export interface KpiMetricInterface {
  /** Unique identifier for the KPI card. */
  id: string;
  /** Display label shown on the dashboard card. */
  label: string;
  /** Current metric value. */
  value: number;
  /** Unit suffix (e.g. "%", "units"). */
  unit?: string;
  /** Percentage change from previous period. */
  changePercent: number;
  /** Whether the change is positive (good) or negative. */
  trend: "up" | "down" | "neutral";
}

export interface RecentActivityInterface {
  /** Unique activity identifier. */
  id: string;
  /** Type of supply-chain event. */
  type: ActivityType;
  /** Human-readable activity description. */
  description: string;
  /** ISO timestamp of when the activity occurred. */
  occurredAt: string;
  /** Related entity reference (order ID, shipment ID, etc.). */
  referenceId: string;
}

export interface DashboardSummaryInterface {
  /** Key performance indicators for the overview cards. */
  kpis: KpiMetricInterface[];
  /** Recent supply-chain activity feed items. */
  recentActivity: RecentActivityInterface[];
}

export type GetDashboardSummaryOutput = DashboardSummaryInterface;
