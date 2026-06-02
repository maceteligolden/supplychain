export interface DashboardKpiInterface {
  /** Unique identifier for the KPI card. */
  id: string;
  /** Display label shown on the dashboard card. */
  label: string;
  /** Current metric value. */
  value: number;
  /** Optional description below the value. */
  description?: string;
}

export interface OngoingSupplyChainInterface {
  /** Supply chain identifier. */
  supplyChainId: string;
  /** Display name of the supply chain. */
  name: string;
  /** Commodity name linked to the chain. */
  commodityName: string;
  /** Human-readable progress label (e.g. "At Collection"). */
  progressLabel: string;
  /** Number of lifecycle events recorded on this chain. */
  eventsRecordedCount: number;
}

export interface DashboardChartPointInterface {
  /** Category label for the chart axis. */
  label: string;
  /** Numeric value for the chart bar. */
  value: number;
}

export interface DashboardRecentActivityInterface {
  /** Unique activity identifier. */
  id: string;
  /** Human-readable activity description. */
  description: string;
  /** ISO timestamp of when the activity occurred. */
  occurredAt: string;
  /** Supply chain this activity belongs to. */
  supplyChainId: string;
}

export interface DashboardSummaryInterface {
  /** Key performance indicators for the overview cards. */
  kpis: DashboardKpiInterface[];
  /** Active supply chains still in progress (not delivered). */
  ongoingSupplyChains: OngoingSupplyChainInterface[];
  /** Event counts grouped by lifecycle type for charts. */
  eventsByType: DashboardChartPointInterface[];
  /** Active chains grouped by furthest lifecycle stage reached. */
  chainProgress: DashboardChartPointInterface[];
  /** Recent supply-chain activity feed items. */
  recentActivity: DashboardRecentActivityInterface[];
}

export type GetDashboardSummaryOutput = DashboardSummaryInterface;
