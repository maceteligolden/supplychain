import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { OngoingChainsCard } from "@/components/dashboard/ongoing-chains-card";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import type { DashboardSummaryInterface } from "@/types/dashboard.interface";
import type { UserInterface } from "@/types/user.interface";

export interface DashboardViewProps {
  /** Authenticated user for the welcome message. */
  user: UserInterface;
  /** Aggregated dashboard metrics. */
  summary: DashboardSummaryInterface;
}

/**
 * DashboardView
 *
 * Traceability overview with KPIs, ongoing chains, charts, and recent activity.
 */
export function DashboardView({
  user,
  summary,
}: DashboardViewProps): React.JSX.Element {
  return (
    <div className="gap-section flex flex-col">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.firstName}. Traceability overview for the POC.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.kpis.map((kpi) => (
          <StatCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            description={kpi.description}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OngoingChainsCard ongoingSupplyChains={summary.ongoingSupplyChains} />
        <RecentActivityFeed recentActivity={summary.recentActivity} />
      </div>

      <DashboardCharts
        eventsByType={summary.eventsByType}
        chainProgress={summary.chainProgress}
      />
    </div>
  );
}
