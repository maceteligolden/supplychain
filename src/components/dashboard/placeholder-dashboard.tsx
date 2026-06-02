import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import type { UserInterface } from "@/types/user.interface";

export interface PlaceholderDashboardProps {
  /** Authenticated Super Admin user for the welcome message. */
  user: UserInterface;
}

/**
 * PlaceholderDashboard
 *
 * Phase 1 dashboard shell showing welcome copy and zero-value KPI placeholders
 * for Farms, Batches, Supply Chains, and Events. Full metrics arrive in Phase 2.
 */
export function PlaceholderDashboard({
  user,
}: PlaceholderDashboardProps): React.JSX.Element {
  return (
    <div className="gap-section flex flex-col">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.firstName}. Traceability overview for the POC.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Farms" value={0} description="Registered farms" />
        <StatCard label="Batches" value={0} description="Harvest batches" />
        <StatCard label="Supply Chains" value={0} description="Active journeys" />
        <StatCard label="Events" value={0} description="Recorded events" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traceability POC</CardTitle>
          <CardDescription>
            Full dashboard metrics and activity feeds will be added in the next phase.
            Use the sidebar to navigate as new modules are enabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            You are signed in as{" "}
            <span className="text-foreground font-medium">
              {user.firstName} {user.lastName}
            </span>{" "}
            ({user.role.replace("_", " ")}).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
