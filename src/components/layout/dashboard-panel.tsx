"use client";

import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const dashboardPanelVariants = cva(
  "shadow-card rounded-card overflow-hidden border-0",
  {
    variants: {
      accent: {
        primary: "border-l-primary bg-primary-light/50 border-l-4",
        info: "border-l-info bg-info/10 border-l-4",
        success: "border-l-success bg-success/10 border-l-4",
        warning: "border-l-warning bg-warning/10 border-l-4",
        neutral: "border-l-border bg-surface-secondary border-l-4",
      },
    },
    defaultVariants: {
      accent: "neutral",
    },
  },
);

const headerVariants = cva("border-border/60 border-b pb-3", {
  variants: {
    accent: {
      primary: "bg-primary-light/30",
      info: "bg-info/5",
      success: "bg-success/5",
      warning: "bg-warning/5",
      neutral: "bg-background/60",
    },
  },
  defaultVariants: {
    accent: "neutral",
  },
});

export interface DashboardPanelProps extends VariantProps<
  typeof dashboardPanelVariants
> {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * DashboardPanel — tinted dashboard section card with accent border and header band.
 */
export function DashboardPanel({
  title,
  description,
  accent,
  children,
  className,
  contentClassName,
}: DashboardPanelProps): React.JSX.Element {
  return (
    <Card className={cn(dashboardPanelVariants({ accent }), className)}>
      <CardHeader className={cn(headerVariants({ accent }), "gap-tight")}>
        <CardTitle className="text-foreground text-sm font-semibold">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-text-secondary text-xs leading-relaxed">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={cn("pt-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
