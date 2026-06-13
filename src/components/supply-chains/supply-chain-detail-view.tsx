"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";

import { EventTimeline } from "@/components/supply-chain-events/event-timeline";
import { SupplyChainRiskSummary } from "@/components/supply-chains/supply-chain-risk-summary";
import { SupplyChainExportMenu } from "@/components/supply-chains/supply-chain-export-menu";
import { StatCard } from "@/components/layout/stat-card";
import { CustodyGraphLoader } from "@/components/traceability/custody-graph-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAGE_ROUTES } from "@/config/page-routes";
import { SUPPLY_CHAIN_STATUS_LABELS } from "@/config/supply-chain-status";
import { buildCustodyGraph } from "@/lib/supply-chain/build-custody-graph";
import { getSupplyChainStats } from "@/lib/supply-chain/supply-chain-stats";
import type { ActorInterface } from "@/types/actor.interface";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";
import type { SupplyChainRiskSummaryInterface } from "@/types/supply-chain-risk.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface SupplyChainDetailViewProps {
  /** Supply chain being viewed. */
  supplyChain: SupplyChainInterface;
  /** Commodity linked to this chain. */
  commodity?: CommodityInterface;
  /** Batch allocations on this chain. */
  allocations: BatchAllocationInterface[];
  /** Batches referenced by allocations. */
  batches: BatchInterface[];
  /** Farms referenced by batches. */
  farms: FarmInterface[];
  /** Lifecycle events recorded for this chain. */
  events: SupplyChainEventInterface[];
  /** Actors for event display and forms. */
  actors: ActorInterface[];
  /** Deforestation risk summary for linked farms. */
  riskSummary: SupplyChainRiskSummaryInterface;
  /** Opens the edit wizard. */
  onEdit: () => void;
}

/**
 * SupplyChainDetailView
 *
 * Supply chain detail with stats, allocation summary, and event tracking timeline.
 */
export function SupplyChainDetailView({
  supplyChain,
  commodity,
  allocations,
  batches,
  farms,
  events,
  actors,
  riskSummary,
  onEdit,
}: SupplyChainDetailViewProps): React.JSX.Element {
  const stats = getSupplyChainStats({ allocations, batches, farms, events });

  const custodyGraph = useMemo(
    () =>
      buildCustodyGraph({
        supplyChain,
        commodity,
        allocations,
        batches,
        farms,
        events,
        actors,
      }),
    [supplyChain, commodity, allocations, batches, farms, events, actors],
  );

  const allocationRows = allocations.map((allocation) => {
    const batch = batches.find((item) => item.id === allocation.batchId);
    const farm = batch ? farms.find((item) => item.id === batch.farmId) : undefined;
    return { allocation, batch, farm };
  });

  return (
    <div className="gap-section flex flex-col">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        render={<Link href={PAGE_ROUTES.supplyChains} />}
      >
        <ArrowLeftIcon className="size-4" />
        Back to supply chains
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="gap-card flex flex-col">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            {supplyChain.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={supplyChain.status === "ACTIVE" ? "secondary" : "outline"}>
              {SUPPLY_CHAIN_STATUS_LABELS[supplyChain.status]}
            </Badge>
            {commodity ? <Badge variant="outline">{commodity.name}</Badge> : null}
            <code className="text-muted-foreground text-xs">{supplyChain.code}</code>
          </div>
          {supplyChain.description ? (
            <p className="text-muted-foreground text-sm">{supplyChain.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SupplyChainExportMenu supplyChainId={supplyChain.id} />
          <Button variant="outline" onClick={onEdit}>
            <PencilIcon className="size-4" />
            Edit supply chain
          </Button>
        </div>
      </div>

      <div className="gap-grid grid sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Linked farms"
          value={stats.linkedFarmsCount}
          description="Farms supplying this chain"
          variant="primary"
        />
        <StatCard
          label="Allocated batches"
          value={stats.allocatedBatchesCount}
          description="Harvest batches assigned"
          variant="success"
        />
        <StatCard
          label="Total quantity"
          value={stats.totalAllocatedQuantity.toLocaleString()}
          description="Combined allocated volume"
          variant="info"
        />
        <StatCard
          label="Events recorded"
          value={stats.eventsRecordedCount}
          description="Lifecycle milestones logged"
          variant="neutral"
        />
      </div>

      <SupplyChainRiskSummary riskSummary={riskSummary} />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-foreground text-lg font-semibold">Chain of custody</h3>
            <p className="text-muted-foreground text-sm">
              Visual map from farm harvest through each custody handoff.
            </p>
          </div>
          <CustodyGraphLoader graph={custodyGraph} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-foreground mb-4 text-lg font-semibold">Allocations</h3>
          {allocationRows.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No batches allocated yet. Edit this supply chain to assign produce.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farm</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocationRows.map(({ allocation, batch, farm }) => (
                  <TableRow key={allocation.id}>
                    <TableCell>{farm?.name ?? "Unknown farm"}</TableCell>
                    <TableCell>
                      <code className="text-xs">
                        {batch?.batchNumber ?? allocation.batchId}
                      </code>
                    </TableCell>
                    <TableCell>
                      {allocation.quantity.toLocaleString()} {batch?.unit ?? ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <EventTimeline
            supplyChainId={supplyChain.id}
            events={events}
            actors={actors}
          />
        </CardContent>
      </Card>
    </div>
  );
}
