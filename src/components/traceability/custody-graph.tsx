"use client";

import { useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  custodyGraphNodeTypes,
  type CustodyGraphNodeData,
} from "@/components/traceability/custody-graph-node";
import type { TraceabilityGraphInterface } from "@/types/traceability-graph.interface";

export interface CustodyGraphProps {
  /** Pre-built chain-of-custody graph data. */
  graph: TraceabilityGraphInterface;
}

const FIRST_CARD_TYPES = new Set(["farm", "batch", "chain"]);

function FitFirstCards({ focusNodeIds }: { focusNodeIds: string[] }): null {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (focusNodeIds.length === 0) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      void fitView({
        nodes: focusNodeIds.map((id) => ({ id })),
        padding: 0.2,
        duration: 200,
      });
    });

    return (): void => {
      cancelAnimationFrame(frame);
    };
  }, [fitView, focusNodeIds]);

  return null;
}

/**
 * CustodyGraph
 *
 * Interactive left-to-right chain-of-custody visualization using React Flow.
 * Initial viewport focuses on farm → batch → chain cards.
 */
export function CustodyGraph({ graph }: CustodyGraphProps): React.JSX.Element {
  const nodes = useMemo(
    () =>
      graph.nodes.map(
        (node): Node<CustodyGraphNodeData> => ({
          id: node.id,
          type: "custody",
          position: node.position,
          data: { node },
          draggable: false,
          selectable: false,
        }),
      ),
    [graph.nodes],
  );

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: false,
        style: { strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: "var(--muted-foreground)" },
      })),
    [graph.edges],
  );

  const focusNodeIds = useMemo(() => {
    const firstCards = graph.nodes
      .filter((node) => FIRST_CARD_TYPES.has(node.type))
      .map((node) => node.id);
    return firstCards.length > 0 ? firstCards : graph.nodes.map((node) => node.id);
  }, [graph.nodes]);

  return (
    <div className="flex flex-col gap-3">
      {!graph.hasAllocations ? (
        <p className="text-muted-foreground text-sm">
          No batches allocated yet — the graph shows the supply chain hub and lifecycle
          steps. Edit this chain to assign produce from farms.
        </p>
      ) : null}
      <div className="border-border bg-muted/20 h-[28rem] min-h-96 w-full overflow-hidden rounded-lg border">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={custodyGraphNodeTypes}
            minZoom={0.5}
            maxZoom={1.5}
            nodesConnectable={false}
            nodesDraggable={false}
            elementsSelectable={false}
            panOnScroll
            zoomOnScroll={false}
            proOptions={{ hideAttribution: true }}
          >
            <FitFirstCards focusNodeIds={focusNodeIds} />
            <Background gap={16} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="border-primary bg-card size-3 rounded border" />
          Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="border-primary bg-primary/5 ring-primary/30 size-3 rounded border ring-2" />
          Next step
        </span>
        <span className="flex items-center gap-1.5">
          <span className="border-muted-foreground/40 size-3 rounded border border-dashed" />
          Skipped
        </span>
        <span className="flex items-center gap-1.5">
          <span className="border-border bg-card size-3 rounded border" />
          Upcoming
        </span>
      </div>
    </div>
  );
}
