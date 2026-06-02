"use client";

import Link from "next/link";

import { SupplyChainActionsMenu } from "@/components/supply-chains/supply-chain-actions-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supplyChainDetailPage } from "@/config/page-routes";
import { SUPPLY_CHAIN_STATUS_LABELS } from "@/config/supply-chain-status";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface SupplyChainTableProps {
  supplyChains: SupplyChainInterface[];
  onEdit: (supplyChain: SupplyChainInterface) => void;
  onDelete: (supplyChain: SupplyChainInterface) => void;
  emptyMessage?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * SupplyChainTable
 *
 * Data table listing supply chains with name, code, status, and actions.
 */
export function SupplyChainTable({
  supplyChains,
  onEdit,
  onDelete,
  emptyMessage = "No supply chains yet. Add your first supply chain to get started.",
}: SupplyChainTableProps): React.JSX.Element {
  if (supplyChains.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {supplyChains.map((chain) => (
          <TableRow key={chain.id}>
            <TableCell className="font-medium">
              <Link href={supplyChainDetailPage(chain.id)} className="hover:underline">
                {chain.name}
              </Link>
            </TableCell>
            <TableCell>
              <code className="text-xs">{chain.code}</code>
            </TableCell>
            <TableCell>
              <Badge variant={chain.status === "ACTIVE" ? "secondary" : "outline"}>
                {SUPPLY_CHAIN_STATUS_LABELS[chain.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(chain.createdAt)}
            </TableCell>
            <TableCell>
              <SupplyChainActionsMenu
                supplyChain={chain}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
