"use client";

import Link from "next/link";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";

import { StatCard } from "@/components/layout/stat-card";
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
import { ACTOR_STATUS_LABELS, ACTOR_TYPE_LABELS } from "@/config/actor-types";
import { SUPPLY_CHAIN_EVENT_TYPE_LABELS } from "@/config/supply-chain-event-types";
import { SUPPLY_CHAIN_STATUS_LABELS } from "@/config/supply-chain-status";
import { formatActorAddress } from "@/lib/actor/format-address";
import { PAGE_ROUTES, supplyChainDetailPage } from "@/config/page-routes";
import type { ActorInvolvementInterface } from "@/types/actor-involvement.interface";

export interface ActorDetailViewProps {
  /** Actor involvement data including profile and events. */
  involvement: ActorInvolvementInterface;
  /** Opens the edit dialog. */
  onEdit: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
 * ActorDetailView
 *
 * Actor profile with involvement stats, linked supply chains, and event history.
 */
export function ActorDetailView({
  involvement,
  onEdit,
}: ActorDetailViewProps): React.JSX.Element {
  const { actor, events, supplyChains, stats } = involvement;

  const chainSummaries = supplyChains.map((chain) => {
    const chainEvents = events.filter((item) => item.supplyChain.id === chain.id);
    const latest = chainEvents[0]?.event;

    return {
      chain,
      latestEventType: latest?.type,
      latestEventDate: latest?.occurredAt,
      eventCount: chainEvents.length,
    };
  });

  return (
    <div className="gap-section flex flex-col">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        render={<Link href={PAGE_ROUTES.actors} />}
      >
        <ArrowLeftIcon className="size-4" />
        Back to actors
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="gap-card flex flex-col">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            {actor.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{ACTOR_TYPE_LABELS[actor.type]}</Badge>
            <Badge variant={actor.status === "ACTIVE" ? "secondary" : "outline"}>
              {ACTOR_STATUS_LABELS[actor.status]}
            </Badge>
            <code className="text-muted-foreground text-xs">{actor.code}</code>
          </div>
          <p className="text-muted-foreground text-sm">{formatActorAddress(actor)}</p>
          <p className="text-muted-foreground text-xs">
            Registered {formatDate(actor.createdAt)}
          </p>
        </div>
        <Button variant="outline" onClick={onEdit}>
          <PencilIcon className="size-4" />
          Edit actor
        </Button>
      </div>

      <div className="gap-grid grid sm:grid-cols-2">
        <StatCard
          label="Events recorded"
          value={stats.eventCount}
          description="Lifecycle events with this actor"
          variant="info"
        />
        <StatCard
          label="Supply chains involved"
          value={stats.supplyChainCount}
          description="Distinct journeys referencing this actor"
          variant="primary"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-foreground mb-4 text-lg font-semibold">Supply chains</h3>
          {chainSummaries.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              This actor has not been linked to any supply chain events yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last event</TableHead>
                  <TableHead>Events</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chainSummaries.map(
                  ({ chain, latestEventType, latestEventDate, eventCount }) => (
                    <TableRow key={chain.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={supplyChainDetailPage(chain.id)}
                          className="hover:underline"
                        >
                          {chain.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={chain.status === "ACTIVE" ? "secondary" : "outline"}
                        >
                          {SUPPLY_CHAIN_STATUS_LABELS[chain.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {latestEventType
                          ? `${SUPPLY_CHAIN_EVENT_TYPE_LABELS[latestEventType]} — ${formatDateTime(latestEventDate ?? "")}`
                          : "—"}
                      </TableCell>
                      <TableCell>{eventCount}</TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-foreground mb-4 text-lg font-semibold">Event history</h3>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">No events recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supply chain</TableHead>
                  <TableHead>Event type</TableHead>
                  <TableHead>Occurred</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map(({ event, supplyChain }) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Link
                        href={supplyChainDetailPage(supplyChain.id)}
                        className="hover:underline"
                      >
                        {supplyChain.name}
                      </Link>
                    </TableCell>
                    <TableCell>{SUPPLY_CHAIN_EVENT_TYPE_LABELS[event.type]}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateTime(event.occurredAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                      {event.notes ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
