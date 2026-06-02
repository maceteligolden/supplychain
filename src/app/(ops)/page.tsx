import { PlaceholderDashboard } from "@/components/dashboard/placeholder-dashboard";
import { getCurrentUser } from "@/services/auth.service";

/**
 * Authenticated dashboard — placeholder KPIs until Phase 2 metrics are built.
 */
export default async function DashboardPage(): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  return <PlaceholderDashboard user={user} />;
}
