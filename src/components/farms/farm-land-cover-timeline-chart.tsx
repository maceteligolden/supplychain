"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import type { FarmLandCoverTimelinePointInterface } from "@/types/farm-land-cover.interface";

export interface FarmLandCoverTimelineChartProps {
  /** Timeline points from baseline + assessments. */
  points: FarmLandCoverTimelinePointInterface[];
  /** Highlight a specific assessment on the chart. */
  selectedAssessmentId?: string;
}

function formatAxisLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });
}

/**
 * FarmLandCoverTimelineChart
 *
 * Line chart of forest cover and deforestation over time for a farm boundary.
 */
export function FarmLandCoverTimelineChart({
  points,
  selectedAssessmentId,
}: FarmLandCoverTimelineChartProps): React.JSX.Element {
  const chartData = points.map((point) => ({
    ...point,
    label: formatAxisLabel(point.observedAt),
    isSelected: point.assessmentId === selectedAssessmentId,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Land-cover timeline</CardTitle>
          <CardDescription>
            Forest cover trend within the farm boundary over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No land-cover data yet. Run an assessment to add a snapshot.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Land-cover timeline</CardTitle>
        <CardDescription>
          Mock satellite baseline (2020–2024) plus assessment snapshots. Solid markers
          indicate assessment runs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                width={36}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value, name) => {
                  const numeric =
                    typeof value === "number" ? value : Number(value ?? 0);
                  return [
                    `${numeric}%`,
                    name === "forestCoverPercent" ? "Forest cover" : "Deforestation",
                  ];
                }}
                labelFormatter={(_, payload) => {
                  const entry = payload?.[0]?.payload as
                    | { observedAt?: string; source?: string }
                    | undefined;
                  if (!entry?.observedAt) {
                    return "";
                  }
                  const date = formatAxisLabel(entry.observedAt);
                  return entry.source === "ASSESSMENT"
                    ? `${date} · Assessment`
                    : `${date} · Baseline`;
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "forestCoverPercent" ? "Forest cover" : "Deforestation"
                }
              />
              <Line
                type="monotone"
                dataKey="forestCoverPercent"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={(props): React.JSX.Element => {
                  const { cx, cy, payload } = props as {
                    cx: number;
                    cy: number;
                    payload: { source?: string; isSelected?: boolean };
                  };
                  const isAssessment = payload.source === "ASSESSMENT";
                  const radius = payload.isSelected ? 6 : isAssessment ? 5 : 3;
                  return (
                    <circle
                      key={`forest-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={isAssessment ? "var(--chart-2)" : "transparent"}
                      stroke="var(--chart-2)"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="deforestationPercent"
                stroke="var(--chart-1)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
