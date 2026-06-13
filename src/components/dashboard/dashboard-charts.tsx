"use client";

import type React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardPanel } from "@/components/layout/dashboard-panel";
import type { DashboardChartPointInterface } from "@/types/dashboard.interface";

export interface DashboardChartsProps {
  /** Event counts grouped by lifecycle type. */
  eventsByType: DashboardChartPointInterface[];
  /** Active chains grouped by furthest lifecycle stage. */
  chainProgress: DashboardChartPointInterface[];
}

const EVENT_BAR_COLORS = [
  "var(--primary)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
  "var(--chart-4)",
];

const PROGRESS_BAR_COLORS = [
  "var(--primary)",
  "var(--chart-2)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
];

function truncateLabel(label: string, maxLength: number): string {
  if (label.length <= maxLength) {
    return label;
  }

  return `${label.slice(0, maxLength - 1)}…`;
}

function ChartTooltip({
  active,
  payload,
  valueLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { label?: string; value?: number } }>;
  valueLabel: string;
}): React.JSX.Element | null {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0]?.payload;

  return (
    <div className="rounded-control border-border/60 bg-popover text-popover-foreground border px-3 py-2 text-xs shadow-lg">
      <p className="text-foreground font-medium">{entry?.label}</p>
      <p className="text-text-secondary mt-0.5">
        {valueLabel}:{" "}
        <span className="text-foreground font-semibold">{entry?.value}</span>
      </p>
    </div>
  );
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
    <div className="gap-grid grid lg:grid-cols-2">
      <DashboardPanel
        accent="success"
        title="Events by type"
        description="Lifecycle events recorded across all supply chains."
        contentClassName="pt-2"
      >
        <div className="bg-success/5 rounded-control h-64 w-full p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={eventsChartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="shortLabel"
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                content={<ChartTooltip valueLabel="Count" />}
                cursor={{ fill: "var(--primary-light)", opacity: 0.35 }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {eventsChartData.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={EVENT_BAR_COLORS[index % EVENT_BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardPanel>

      <DashboardPanel
        accent="primary"
        title="Chain progress"
        description="Active supply chains grouped by furthest lifecycle stage reached."
        contentClassName="pt-2"
      >
        {progressChartData.length === 0 ? (
          <p className="text-text-secondary text-sm">No active supply chains.</p>
        ) : (
          <div className="bg-primary-light/40 rounded-control h-64 w-full p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={progressChartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  content={<ChartTooltip valueLabel="Chains" />}
                  cursor={{ fill: "var(--primary-light)", opacity: 0.5 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {progressChartData.map((entry, index) => (
                    <Cell
                      key={entry.label}
                      fill={PROGRESS_BAR_COLORS[index % PROGRESS_BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}
