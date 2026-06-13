"use client";

import Link from "next/link";

import { DashboardPanel } from "@/components/layout/dashboard-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAGE_ROUTES, supplyChainDetailPage } from "@/config/page-routes";
import {
  SUPPLY_CHAIN_OVERALL_RISK_BADGE_VARIANT,
  SUPPLY_CHAIN_OVERALL_RISK_LABELS,
} from "@/config/supply-chain-risk";
import { Badge } from "@/components/ui/badge";
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
    <DashboardPanel
      accent="primary"
      title="Ongoing supply chains"
      description="Active journeys not yet delivered — open a chain to record events."
      contentClassName="gap-card flex flex-col"
    >
      {ongoingSupplyChains.length === 0 ? (
        <p className="text-text-secondary text-sm">
          No ongoing supply chains. All active chains may be delivered or none exist
          yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Commodity</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Deforestation risk</TableHead>
              <TableHead>Events</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ongoingSupplyChains.map((chain) => (
              <TableRow key={chain.supplyChainId}>
                <TableCell className="font-medium">
                  <Link
                    href={supplyChainDetailPage(chain.supplyChainId)}
                    className="text-link font-semibold hover:underline"
                  >
                    {chain.name}
                  </Link>
                </TableCell>
                <TableCell className="text-text-secondary">
                  {chain.commodityName}
                </TableCell>
                <TableCell>
                  <span className="bg-primary-light text-primary rounded-control inline-flex px-2 py-0.5 text-xs font-medium">
                    {chain.progressLabel}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      SUPPLY_CHAIN_OVERALL_RISK_BADGE_VARIANT[chain.overallRiskLevel]
                    }
                  >
                    {SUPPLY_CHAIN_OVERALL_RISK_LABELS[chain.overallRiskLevel]}
                  </Badge>
                </TableCell>
                <TableCell className="text-text-secondary tabular-nums">
                  {chain.eventsRecordedCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Link
        href={PAGE_ROUTES.supplyChains}
        className="text-link text-sm font-medium hover:underline"
      >
        View all supply chains
      </Link>
    </DashboardPanel>
  );
}
