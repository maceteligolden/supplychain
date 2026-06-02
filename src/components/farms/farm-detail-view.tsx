"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { AllocationsTab } from "@/components/batch-allocations/allocations-tab";
import { BatchesTab } from "@/components/batches/batches-tab";
import { StatCard } from "@/components/layout/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAGE_ROUTES } from "@/config/page-routes";
import { getFarmBatchStats } from "@/lib/farm/batch-stats";
import { formatFarmLocation } from "@/lib/farm/format-location";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface FarmDetailViewProps {
  /** Farm being viewed. */
  farm: FarmInterface;
  /** Display name of the farm commodity. */
  commodityName: string;
  /** Harvest batches for this farm. */
  batches: BatchInterface[];
  /** Batch allocations for this farm. */
  allocations: BatchAllocationInterface[];
  /** Supply chains available for allocation. */
  supplyChains: SupplyChainInterface[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * FarmDetailView
 *
 * Farm detail page with metadata, batch summary stats, and tabs for
 * harvest batch and allocation management.
 */
export function FarmDetailView({
  farm,
  commodityName,
  batches,
  allocations,
  supplyChains,
}: FarmDetailViewProps): React.JSX.Element {
  const stats = getFarmBatchStats(batches);
  const coordinates =
    farm.location.latitude !== undefined && farm.location.longitude !== undefined
      ? `${farm.location.latitude.toFixed(4)}, ${farm.location.longitude.toFixed(4)}`
      : null;

  return (
    <div className="gap-section flex flex-col">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        render={<Link href={PAGE_ROUTES.farms} />}
      >
        <ArrowLeftIcon className="size-4" />
        Back to farms
      </Button>

      <div className="gap-card flex flex-col">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {farm.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{commodityName}</Badge>
          <code className="text-muted-foreground text-xs">{farm.code}</code>
        </div>
        <p className="text-muted-foreground text-sm">
          {formatFarmLocation(farm.location)}
        </p>
        {coordinates ? (
          <p className="text-muted-foreground text-xs">GPS: {coordinates}</p>
        ) : null}
        <p className="text-muted-foreground text-xs">
          Registered {formatDate(farm.createdAt)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total batches"
          value={stats.totalBatches}
          description="Harvest batches recorded"
        />
        <StatCard
          label="Unallocated batches"
          value={stats.unallocatedBatches}
          description="No quantity allocated yet"
        />
        <StatCard
          label="Allocated batches"
          value={stats.allocatedBatches}
          description="Partially or fully allocated"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="batches">
            <TabsList>
              <TabsTrigger value="batches">Batch management</TabsTrigger>
              <TabsTrigger value="allocations">Allocation management</TabsTrigger>
            </TabsList>
            <TabsContent value="batches" className="pt-4">
              <BatchesTab farmId={farm.id} batches={batches} />
            </TabsContent>
            <TabsContent value="allocations" className="pt-4">
              <AllocationsTab
                batches={batches}
                allocations={allocations}
                supplyChains={supplyChains}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
