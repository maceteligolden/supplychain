"use client";

import Link from "next/link";

import { SupplyChainActionsMenu } from "@/components/supply-chains/supply-chain-actions-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supplyChainDetailPage } from "@/config/page-routes";
import { SUPPLY_CHAIN_STATUS_LABELS } from "@/config/supply-chain-status";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface SupplyChainGridProps {
  supplyChains: SupplyChainInterface[];
  onEdit: (supplyChain: SupplyChainInterface) => void;
  onDelete: (supplyChain: SupplyChainInterface) => void;
  emptyMessage?: string;
}

/**
 * SupplyChainGrid
 *
 * Card grid layout for supply chains.
 */
export function SupplyChainGrid({
  supplyChains,
  onEdit,
  onDelete,
  emptyMessage = "No supply chains yet. Add your first supply chain to get started.",
}: SupplyChainGridProps): React.JSX.Element {
  if (supplyChains.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {supplyChains.map((chain) => (
        <Card key={chain.id} size="sm">
          <CardHeader>
            <CardTitle className="truncate">
              <Link href={supplyChainDetailPage(chain.id)} className="hover:underline">
                {chain.name}
              </Link>
            </CardTitle>
            <CardAction>
              <SupplyChainActionsMenu
                supplyChain={chain}
                onEdit={onEdit}
                onDelete={onDelete}
                triggerVariant="outline"
              />
            </CardAction>
          </CardHeader>
          <CardContent className="gap-card flex flex-col">
            <code className="text-muted-foreground text-xs">{chain.code}</code>
            <Badge variant={chain.status === "ACTIVE" ? "secondary" : "outline"}>
              {SUPPLY_CHAIN_STATUS_LABELS[chain.status]}
            </Badge>
            {chain.description ? (
              <p className="text-muted-foreground text-sm">{chain.description}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
