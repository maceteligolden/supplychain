import type { ReactNode } from "react";

export interface PageHeaderProps {
  /** Page title displayed in the header. */
  title: string;
  /** Optional subtitle or description below the title. */
  description?: string;
  /** Optional action buttons rendered on the right side. */
  actions?: ReactNode;
}

/**
 * PageHeader
 *
 * Reusable page title block with optional description and action slot.
 * Used at the top of each authenticated ops page.
 */
export function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps): React.JSX.Element {
  return (
    <div className="gap-card flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="gap-card flex flex-col">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
