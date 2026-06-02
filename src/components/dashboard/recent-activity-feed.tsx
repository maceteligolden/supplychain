"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          Latest lifecycle events recorded across all supply chains.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentActivity.length === 0 ? (
          <p className="text-muted-foreground text-sm">No events recorded yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {recentActivity.map((item) => (
              <li key={item.id} className="flex flex-col gap-1">
                <Link
                  href={supplyChainDetailPage(item.supplyChainId)}
                  className="text-foreground text-sm font-medium hover:underline"
                >
                  {item.description}
                </Link>
                <span className="text-muted-foreground text-xs">
                  {formatDateTime(item.occurredAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
