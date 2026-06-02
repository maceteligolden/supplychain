import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getCurrentUser } from "@/services/auth.service";
import { getDashboardSummary } from "@/services/dashboard.service";

/**
 * Authenticated dashboard with traceability KPIs, ongoing chains, and charts.
 */
export default async function DashboardPage(): Promise<React.JSX.Element> {
  const [user, summary] = await Promise.all([getCurrentUser(), getDashboardSummary()]);

  return <DashboardView user={user} summary={summary} />;
}
