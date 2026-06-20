import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { PAGE_ROUTES } from "@/config/page-routes";
import { isAppError } from "@/lib/errors";
import { getCurrentUser } from "@/services/auth.service";
import { getDashboardSummary } from "@/services/dashboard.service";
import type { DashboardSummaryInterface } from "@/types/dashboard.interface";
import type { UserInterface } from "@/types/user.interface";

/**
 * Authenticated dashboard with traceability KPIs, ongoing chains, and charts.
 */
export default async function DashboardPage(): Promise<React.JSX.Element> {
  let user: UserInterface;
  let summary: DashboardSummaryInterface;

  try {
    [user, summary] = await Promise.all([getCurrentUser(), getDashboardSummary()]);
  } catch (error) {
    if (isAppError(error) && error.statusCode === 401) {
      redirect(PAGE_ROUTES.login);
    }

    throw error;
  }

  return <DashboardView user={user} summary={summary} />;
}
