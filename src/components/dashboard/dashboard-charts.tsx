"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardChartPointInterface } from "@/types/dashboard.interface";

export interface DashboardChartsProps {
  /** Event counts grouped by lifecycle type. */
  eventsByType: DashboardChartPointInterface[];
  /** Active chains grouped by furthest lifecycle stage. */
  chainProgress: DashboardChartPointInterface[];
}

function truncateLabel(label: string, maxLength: number): string {
  if (label.length <= maxLength) {
    return label;
  }

  return `${label.slice(0, maxLength - 1)}…`;
}

/**
 * DashboardCharts
 *
 * Bar charts for event distribution and supply chain progress breakdown.
 */
export function DashboardCharts({
  eventsByType,
  chainProgress,
}: DashboardChartsProps): React.JSX.Element {
  const eventsChartData = eventsByType.map((item) => ({
    ...item,
    shortLabel: truncateLabel(item.label, 14),
  }));

  const progressChartData = chainProgress.map((item) => ({
    ...item,
    shortLabel: truncateLabel(item.label, 16),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Events by type</CardTitle>
          <CardDescription>
            Lifecycle events recorded across all supply chains.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={eventsChartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                <Tooltip
                  formatter={(value) => [value, "Count"]}
                  labelFormatter={(_, payload) => {
                    const entry = payload?.[0]?.payload as
                      | { label?: string }
                      | undefined;
                    return entry?.label ?? "";
                  }}
                />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chain progress</CardTitle>
          <CardDescription>
            Active supply chains grouped by furthest lifecycle stage reached.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progressChartData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active supply chains.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressChartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                  <Tooltip
                    formatter={(value) => [value, "Chains"]}
                    labelFormatter={(_, payload) => {
                      const entry = payload?.[0]?.payload as
                        | { label?: string }
                        | undefined;
                      return entry?.label ?? "";
                    }}
                  />
                  <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
