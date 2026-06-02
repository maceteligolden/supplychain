"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAGE_ROUTES, supplyChainDetailPage } from "@/config/page-routes";
import type { OngoingSupplyChainInterface } from "@/types/dashboard.interface";

export interface OngoingChainsCardProps {
  /** Active supply chains still in progress. */
  ongoingSupplyChains: OngoingSupplyChainInterface[];
}

/**
 * OngoingChainsCard
 *
 * Compact table of active supply chains that have not reached delivery,
 * with quick links to chain detail pages.
 */
export function OngoingChainsCard({
  ongoingSupplyChains,
}: OngoingChainsCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ongoing supply chains</CardTitle>
        <CardDescription>
          Active journeys not yet delivered — open a chain to record events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {ongoingSupplyChains.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No ongoing supply chains. All active chains may be delivered or none exist
            yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Commodity</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Events</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ongoingSupplyChains.map((chain) => (
                <TableRow key={chain.supplyChainId}>
                  <TableCell className="font-medium">
                    <Link
                      href={supplyChainDetailPage(chain.supplyChainId)}
                      className="hover:underline"
                    >
                      {chain.name}
                    </Link>
                  </TableCell>
                  <TableCell>{chain.commodityName}</TableCell>
                  <TableCell>{chain.progressLabel}</TableCell>
                  <TableCell>{chain.eventsRecordedCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Link
          href={PAGE_ROUTES.supplyChains}
          className="text-primary mt-4 inline-block text-sm hover:underline"
        >
          View all supply chains
        </Link>
      </CardContent>
    </Card>
  );
}
