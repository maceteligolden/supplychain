"use client";

import Link from "next/link";
import { ActivityIcon } from "lucide-react";

import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { supplyChainDetailPage } from "@/config/page-routes";
import type { DashboardRecentActivityInterface } from "@/types/dashboard.interface";

export interface RecentActivityFeedProps {
  /** Recent lifecycle events across all supply chains. */
  recentActivity: DashboardRecentActivityInterface[];
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * RecentActivityFeed
 *
 * Chronological feed of the latest supply chain lifecycle events.
 */
export function RecentActivityFeed({
  recentActivity,
}: RecentActivityFeedProps): React.JSX.Element {
  return (
    <DashboardPanel
      accent="info"
      title="Recent activity"
      description="Latest lifecycle events recorded across all supply chains."
    >
      {recentActivity.length === 0 ? (
        <p className="text-text-secondary text-sm">No events recorded yet.</p>
      ) : (
        <ul className="gap-card flex flex-col">
          {recentActivity.map((item) => (
            <li
              key={item.id}
              className="border-border/60 bg-background/70 gap-tight rounded-control flex gap-3 border p-3"
            >
              <div className="bg-info/15 text-info rounded-control flex size-8 shrink-0 items-center justify-center">
                <ActivityIcon className="size-4" aria-hidden />
              </div>
              <div className="gap-tight flex min-w-0 flex-col">
                <Link
                  href={supplyChainDetailPage(item.supplyChainId)}
                  className="text-link text-sm leading-snug font-medium hover:underline"
                >
                  {item.description}
                </Link>
                <span className="text-text-secondary text-xs tabular-nums">
                  {formatDateTime(item.occurredAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
