import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StatCardProps {
  /** KPI label shown above the value. */
  label: string;
  /** Metric value to display. */
  value: number | string;
  /** Optional unit suffix (e.g. "KG"). */
  unit?: string;
  /** Optional description below the value. */
  description?: string;
}

/**
 * StatCard
 *
 * Reusable KPI card for dashboard and summary views. Displays a label,
 * primary value, and optional unit or description.
 */
export function StatCard({
  label,
  value,
  unit,
  description,
}: StatCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground text-3xl font-bold">
          {value}
          {unit ? (
            <span className="text-muted-foreground ml-1 text-base font-normal">
              {unit}
            </span>
          ) : null}
        </p>
        {description ? (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
