"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { AllocationsTab } from "@/components/batch-allocations/allocations-tab";
import { BatchesTab } from "@/components/batches/batches-tab";
import { FarmDeforestationTab } from "@/components/farms/farm-deforestation-tab";
import { StatCard } from "@/components/layout/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAGE_ROUTES } from "@/config/page-routes";
import { FARM_STATUS_BADGE_VARIANT, FARM_STATUS_LABELS } from "@/config/farm-status";
import { getFarmBatchStats } from "@/lib/farm/batch-stats";
import { formatFarmLocation } from "@/lib/farm/format-location";
import { isFarmOwnerEmpty } from "@/lib/farm/format-owner";
import { cn } from "@/lib/utils";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";
import type { FarmLandCoverTimelinePointInterface } from "@/types/farm-land-cover.interface";
import type { FarmBoundaryInterface } from "@/types/farm-boundary.interface";
import type { FarmInterface, FarmOwnerInterface } from "@/types/farm.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface FarmDetailViewProps {
  /** Farm being viewed. */
  farm: FarmInterface;
  /** Commodities linked to this farm. */
  commodities: CommodityInterface[];
  /** Harvest batches for this farm. */
  batches: BatchInterface[];
  /** Batch allocations for this farm. */
  allocations: BatchAllocationInterface[];
  /** Supply chains available for allocation. */
  supplyChains: SupplyChainInterface[];
  /** Farm boundary polygon, if mapped. */
  boundary: FarmBoundaryInterface | null;
  /** Deforestation assessments for this farm, newest first. */
  assessments: FarmAssessmentInterface[];
  /** Land-cover timeline points for charting. */
  landCoverTimeline: FarmLandCoverTimelinePointInterface[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DetailField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

function EmptyValue({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <span className="text-muted-foreground italic">{children}</span>;
}

function DeclarationValue({ accepted }: { accepted: boolean }): React.JSX.Element {
  return (
    <span
      className={cn(
        "font-medium",
        accepted ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {accepted ? "Accepted" : "Not accepted"}
    </span>
  );
}

function OwnerDetails({ owner }: { owner: FarmOwnerInterface }): React.JSX.Element {
  if (isFarmOwnerEmpty(owner)) {
    return <EmptyValue>Not provided</EmptyValue>;
  }

  const name = [owner.firstName, owner.lastName].filter(Boolean).join(" ").trim();
  const contact = [owner.phone, owner.email].filter((part) => part.trim().length > 0);

  return (
    <div className="flex flex-col gap-0.5">
      {name ? <span className="text-foreground font-medium">{name}</span> : null}
      {contact.length > 0 ? (
        <span className="text-muted-foreground text-sm">{contact.join(" · ")}</span>
      ) : null}
    </div>
  );
}

function MetaItem({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <span className="text-muted-foreground text-sm">{children}</span>;
}

/**
 * FarmDetailView
 *
 * Farm detail page with metadata, batch summary stats, and tabs for
 * harvest batch and allocation management.
 */
export function FarmDetailView({
  farm,
  commodities,
  batches,
  allocations,
  supplyChains,
  boundary,
  assessments,
  landCoverTimeline,
}: FarmDetailViewProps): React.JSX.Element {
  const stats = getFarmBatchStats(batches);
  const coordinates =
    farm.location.latitude !== undefined && farm.location.longitude !== undefined
      ? `${farm.location.latitude.toFixed(4)}, ${farm.location.longitude.toFixed(4)}`
      : null;
  const locationDisplay = formatFarmLocation(farm.location);
  const hasLocation = locationDisplay.trim().length > 0;

  return (
    <div className="gap-section flex flex-col">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground w-fit"
        render={<Link href={PAGE_ROUTES.farms} />}
      >
        <ArrowLeftIcon className="size-4" />
        Back to farms
      </Button>

      <header className="border-border flex flex-col gap-4 border-b pb-6">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {farm.code}
        </p>
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {farm.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={FARM_STATUS_BADGE_VARIANT[farm.status]}>
              {FARM_STATUS_LABELS[farm.status]}
            </Badge>
            {commodities.map((commodity) => (
              <Badge key={commodity.id} variant="secondary">
                {commodity.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {hasLocation ? (
            <>
              <MetaItem>{locationDisplay}</MetaItem>
              {(coordinates || farm.createdAt) && (
                <span aria-hidden className="text-border">
                  ·
                </span>
              )}
            </>
          ) : null}
          {coordinates ? (
            <>
              <MetaItem>GPS {coordinates}</MetaItem>
              {farm.createdAt && (
                <span aria-hidden className="text-border">
                  ·
                </span>
              )}
            </>
          ) : null}
          <MetaItem>Registered {formatDate(farm.createdAt)}</MetaItem>
        </div>
      </header>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deforestation">Deforestation</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="gap-section flex flex-col pt-6">
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Farm profile
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Owner, production estimate, and compliance details
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailField label="Owner">
                    <OwnerDetails owner={farm.owner} />
                  </DetailField>
                  <DetailField label="Annual production">
                    {farm.annualProductionEstimateKg !== undefined ? (
                      <span className="font-medium tabular-nums">
                        {farm.annualProductionEstimateKg.toLocaleString()}{" "}
                        <span className="text-muted-foreground font-normal">kg</span>
                      </span>
                    ) : (
                      <EmptyValue>Not set</EmptyValue>
                    )}
                  </DetailField>
                  <DetailField label="Area">
                    {farm.areaHectares !== undefined ? (
                      <span className="font-medium tabular-nums">
                        {farm.areaHectares.toLocaleString()}{" "}
                        <span className="text-muted-foreground font-normal">ha</span>
                      </span>
                    ) : (
                      <EmptyValue>Not mapped</EmptyValue>
                    )}
                  </DetailField>
                  <DetailField label="Declaration">
                    <DeclarationValue accepted={farm.declarationAccepted} />
                  </DetailField>
                </dl>
              </CardContent>
            </Card>
          </section>

          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Batch overview
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Harvest batches recorded for this farm
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
          </section>
        </TabsContent>

        <TabsContent value="deforestation" className="pt-6">
          <FarmDeforestationTab
            farm={farm}
            boundary={boundary}
            assessments={assessments}
            landCoverTimeline={landCoverTimeline}
          />
        </TabsContent>

        <TabsContent value="operations" className="pt-6">
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Batch & allocation
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Record harvests and assign quantities to active supply chains
              </p>
            </div>
            <Card>
              <CardHeader className="border-border border-b pb-4">
                <CardTitle className="text-base font-semibold">Operations</CardTitle>
                <CardDescription>
                  Manage harvest batches and supply chain allocations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs defaultValue="batches">
                  <TabsList>
                    <TabsTrigger value="batches">Batch management</TabsTrigger>
                    <TabsTrigger value="allocations">Allocation management</TabsTrigger>
                  </TabsList>
                  <TabsContent value="batches" className="pt-4">
                    <BatchesTab
                      farmId={farm.id}
                      batches={batches}
                      farmCommodityIds={farm.commodityIds}
                      commodities={commodities}
                    />
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
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
