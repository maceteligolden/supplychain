"use client";

import Link from "next/link";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Building2Icon, PackageIcon, RouteIcon, SproutIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  TraceabilityGraphEventStatus,
  TraceabilityGraphNodeInterface,
  TraceabilityGraphNodeType,
} from "@/types/traceability-graph.interface";

export type CustodyGraphNodeData = {
  node: TraceabilityGraphNodeInterface;
};

const NODE_TYPE_LABELS: Record<TraceabilityGraphNodeType, string> = {
  farm: "Farm",
  batch: "Batch",
  chain: "Supply chain",
  event: "Event",
};

const NODE_TYPE_ICONS: Record<
  TraceabilityGraphNodeType,
  React.ComponentType<{ className?: string }>
> = {
  farm: SproutIcon,
  batch: PackageIcon,
  chain: RouteIcon,
  event: Building2Icon,
};

function getEventStatusClassName(
  status: TraceabilityGraphEventStatus | undefined,
): string {
  switch (status) {
    case "completed":
      return "border-primary bg-card";
    case "skipped":
      return "border-muted-foreground/40 bg-muted/30 border-dashed";
    case "next":
      return "border-primary bg-primary/5 ring-primary/30 ring-2";
    case "upcoming":
    default:
      return "border-border bg-card";
  }
}

/**
 * CustodyGraphNode
 *
 * Custom React Flow node for chain-of-custody graph entities
 * (farm, batch, supply chain hub, lifecycle event).
 */
export function CustodyGraphNode({
  data,
}: NodeProps<Node<CustodyGraphNodeData>>): React.JSX.Element {
  const { node } = data;
  const Icon = NODE_TYPE_ICONS[node.type];
  const isEvent = node.type === "event";

  const content = (
    <div
      className={cn(
        "w-48 rounded-lg border p-3 shadow-sm",
        isEvent ? getEventStatusClassName(node.eventStatus) : "border-border bg-card",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className="text-muted-foreground size-4 shrink-0" />
        <Badge variant="outline" className="text-xs">
          {NODE_TYPE_LABELS[node.type]}
        </Badge>
      </div>
      <p className="text-foreground text-sm leading-snug font-medium">{node.label}</p>
      {node.subtitle ? (
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {node.subtitle}
        </p>
      ) : null}
    </div>
  );

  return (
    <>
      <Handle type="target" position={Position.Left} className="opacity-0" />
      {node.href ? (
        <Link href={node.href} className="block transition-opacity hover:opacity-90">
          {content}
        </Link>
      ) : (
        content
      )}
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </>
  );
}

export const custodyGraphNodeTypes = {
  custody: CustodyGraphNode,
};
