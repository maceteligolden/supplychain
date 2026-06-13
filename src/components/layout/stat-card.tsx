import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangleIcon,
  BoxesIcon,
  LinkIcon,
  SproutIcon,
  WorkflowIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statCardVariants = cva(
  "shadow-card rounded-card relative overflow-hidden border-0 transition-shadow hover:shadow-subtle",
  {
    variants: {
      variant: {
        primary:
          "border-l-primary bg-primary-light/70 border-l-4 [&_[data-stat-value]]:text-primary",
        success:
          "border-l-success bg-success/10 border-l-4 [&_[data-stat-value]]:text-success",
        info: "border-l-info bg-info/10 border-l-4 [&_[data-stat-value]]:text-info",
        warning:
          "border-l-warning bg-warning/10 border-l-4 [&_[data-stat-value]]:text-warning",
        neutral:
          "border-l-border bg-surface-secondary border-l-4 [&_[data-stat-value]]:text-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

const statIconVariants = cva(
  "flex size-8 shrink-0 items-center justify-center rounded-control",
  {
    variants: {
      variant: {
        primary: "bg-primary/15 text-primary",
        success: "bg-success/15 text-success",
        info: "bg-info/15 text-info",
        warning: "bg-warning/15 text-warning",
        neutral: "bg-muted text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type StatCardVariant = NonNullable<
  VariantProps<typeof statCardVariants>["variant"]
>;

const STAT_CARD_ICONS: Record<StatCardVariant, LucideIcon> = {
  primary: SproutIcon,
  success: BoxesIcon,
  info: LinkIcon,
  warning: AlertTriangleIcon,
  neutral: WorkflowIcon,
};

/** Maps dashboard KPI ids to visual variants for clearer scanability. */
export const KPI_VARIANT_BY_ID: Record<string, StatCardVariant> = {
  "kpi-farms": "primary",
  "kpi-batches": "success",
  "kpi-active-chains": "info",
  "kpi-events": "neutral",
  "kpi-at-risk-chains": "warning",
};

export interface StatCardProps extends VariantProps<typeof statCardVariants> {
  /** KPI label shown above the value. */
  label: string;
  /** Metric value to display. */
  value: number | string;
  /** Optional unit suffix (e.g. "KG"). */
  unit?: string;
  /** Optional description below the value. */
  description?: string;
  /** Optional icon override; defaults from variant. */
  icon?: LucideIcon;
  className?: string;
}

/**
 * StatCard
 *
 * KPI card with tinted backgrounds and accent borders to improve visual hierarchy.
 */
export function StatCard({
  label,
  value,
  unit,
  description,
  variant = "neutral",
  icon,
  className,
}: StatCardProps): React.JSX.Element {
  const resolvedVariant = variant ?? "neutral";
  const Icon = icon ?? STAT_CARD_ICONS[resolvedVariant];

  return (
    <Card className={cn(statCardVariants({ variant: resolvedVariant }), className)}>
      <CardContent className="gap-card flex flex-col pt-4 pb-4">
        <div className="gap-card flex items-start justify-between">
          <div className="gap-tight flex min-w-0 flex-1 flex-col">
            <p className="text-text-secondary text-xs font-semibold tracking-wide uppercase">
              {label}
            </p>
            <p
              data-stat-value
              className="mt-0.5 text-2xl font-bold tracking-tight tabular-nums"
            >
              {value}
              {unit ? (
                <span className="text-text-secondary ml-1 text-sm font-medium">
                  {unit}
                </span>
              ) : null}
            </p>
          </div>
          <div className={statIconVariants({ variant: resolvedVariant })}>
            <Icon className="size-4" aria-hidden />
          </div>
        </div>
        {description ? (
          <p className="text-text-secondary text-xs leading-relaxed">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
