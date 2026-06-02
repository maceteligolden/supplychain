"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";

import { SupplyChainDeleteDialog } from "@/components/supply-chains/supply-chain-delete-dialog";
import { SupplyChainFormDialog } from "@/components/supply-chains/supply-chain-form-dialog";
import { SupplyChainGrid } from "@/components/supply-chains/supply-chain-grid";
import { SupplyChainTable } from "@/components/supply-chains/supply-chain-table";
import {
  LIST_VIEW_DEFAULT_PAGE_SIZE,
  ListViewPagination,
} from "@/components/layout/list-view-pagination";
import { ListViewToolbar } from "@/components/layout/list-view-toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  SUPPLY_CHAIN_STATUSES,
  SUPPLY_CHAIN_STATUS_LABELS,
} from "@/config/supply-chain-status";
import type { ListViewPageSize } from "@/config/list-view";
import { filterItemsByField, filterItemsBySearch } from "@/lib/list-view/filter-items";
import { paginateItems } from "@/lib/list-view/paginate-items";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";
import type { ListViewLayout } from "@/types/list-view.interface";

export interface SupplyChainsViewProps {
  supplyChains: SupplyChainInterface[];
}

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...SUPPLY_CHAIN_STATUSES.map((status) => ({
    value: status,
    label: SUPPLY_CHAIN_STATUS_LABELS[status],
  })),
];

/**
 * SupplyChainsView
 *
 * Client shell for supply chain management — searchable/filterable paginated list.
 */
export function SupplyChainsView({
  supplyChains,
}: SupplyChainsViewProps): React.JSX.Element {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [layout, setLayout] = useState<ListViewLayout>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<ListViewPageSize>(
    LIST_VIEW_DEFAULT_PAGE_SIZE,
  );
  const [selectedChain, setSelectedChain] = useState<SupplyChainInterface | undefined>(
    undefined,
  );
  const [chainToDelete, setChainToDelete] = useState<SupplyChainInterface | null>(null);

  const filteredChains = useMemo(() => {
    const searched = filterItemsBySearch(supplyChains, searchQuery, (chain) =>
      `${chain.name} ${chain.code} ${chain.description ?? ""}`.trim(),
    );
    return filterItemsByField(searched, statusFilter, (chain) => chain.status);
  }, [supplyChains, searchQuery, statusFilter]);

  const pagination = useMemo(
    () => paginateItems(filteredChains, currentPage, pageSize),
    [filteredChains, currentPage, pageSize],
  );

  const hasActiveFilters = searchQuery.trim().length > 0 || statusFilter !== "all";
  const emptyMessage = hasActiveFilters
    ? "No supply chains match your search or filter."
    : "No supply chains yet. Add your first supply chain to get started.";

  function handleCreate(): void {
    setSelectedChain(undefined);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function handleEdit(chain: SupplyChainInterface): void {
    setSelectedChain(chain);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function handleDelete(chain: SupplyChainInterface): void {
    setChainToDelete(chain);
    setDeleteOpen(true);
  }

  return (
    <div className="gap-section flex flex-col">
      <PageHeader
        title="Supply chains"
        description="Define traceability routes for allocating harvest batches."
        actions={
          <Button onClick={handleCreate}>
            <PlusIcon className="size-4" />
            Add supply chain
          </Button>
        }
      />
      <Card>
        <CardContent className="gap-card flex flex-col pt-6">
          <ListViewToolbar
            searchValue={searchQuery}
            onSearchChange={(value): void => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            searchPlaceholder="Search by name or code…"
            filterValue={statusFilter}
            onFilterChange={(value): void => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            filterOptions={STATUS_FILTER_OPTIONS}
            filterLabel="Filter by status"
            layout={layout}
            onLayoutChange={setLayout}
          />
          {layout === "table" ? (
            <SupplyChainTable
              supplyChains={pagination.items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage={emptyMessage}
            />
          ) : (
            <SupplyChainGrid
              supplyChains={pagination.items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage={emptyMessage}
            />
          )}
          <ListViewPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            pageSize={pagination.pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(next): void => {
              setPageSize(next);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>
      <SupplyChainFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        supplyChain={selectedChain}
      />
      <SupplyChainDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        supplyChain={chainToDelete}
      />
    </div>
  );
}
