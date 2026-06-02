"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";

import { AllocationDeleteDialog } from "@/components/batch-allocations/allocation-delete-dialog";
import { AllocationFormDialog } from "@/components/batch-allocations/allocation-form-dialog";
import { AllocationTable } from "@/components/batch-allocations/allocation-table";
import {
  LIST_VIEW_DEFAULT_PAGE_SIZE,
  ListViewPagination,
} from "@/components/layout/list-view-pagination";
import { ListViewToolbar } from "@/components/layout/list-view-toolbar";
import { Button } from "@/components/ui/button";
import type { ListViewPageSize } from "@/config/list-view";
import { filterItemsBySearch } from "@/lib/list-view/filter-items";
import { paginateItems } from "@/lib/list-view/paginate-items";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { ListViewLayout } from "@/types/list-view.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface AllocationsTabProps {
  batches: BatchInterface[];
  allocations: BatchAllocationInterface[];
  supplyChains: SupplyChainInterface[];
}

/**
 * AllocationsTab
 *
 * Batch allocation list and CRUD for a selected farm.
 */
export function AllocationsTab({
  batches,
  allocations,
  supplyChains,
}: AllocationsTabProps): React.JSX.Element {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState<ListViewLayout>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<ListViewPageSize>(
    LIST_VIEW_DEFAULT_PAGE_SIZE,
  );
  const [selectedAllocation, setSelectedAllocation] = useState<
    BatchAllocationInterface | undefined
  >(undefined);
  const [allocationToDelete, setAllocationToDelete] =
    useState<BatchAllocationInterface | null>(null);

  const batchById = useMemo(
    () => Object.fromEntries(batches.map((batch) => [batch.id, batch])),
    [batches],
  );

  const supplyChainNames = useMemo(
    () => Object.fromEntries(supplyChains.map((chain) => [chain.id, chain.name])),
    [supplyChains],
  );

  const filteredAllocations = useMemo(() => {
    return filterItemsBySearch(allocations, searchQuery, (allocation) => {
      const batch = batchById[allocation.batchId];
      const chainName = supplyChainNames[allocation.supplyChainId] ?? "";
      return `${batch?.batchNumber ?? ""} ${chainName}`.trim();
    });
  }, [allocations, searchQuery, batchById, supplyChainNames]);

  const pagination = useMemo(
    () => paginateItems(filteredAllocations, currentPage, pageSize),
    [filteredAllocations, currentPage, pageSize],
  );

  const hasActiveSupplyChains = supplyChains.some((chain) => chain.status === "ACTIVE");
  const hasBatches = batches.length > 0;
  const emptyMessage = searchQuery.trim()
    ? "No allocations match your search."
    : "No allocations yet. Allocate a batch to a supply chain.";

  return (
    <div className="gap-card flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Allocate harvest batches to active supply chains
        </p>
        <Button
          size="sm"
          disabled={!hasBatches || !hasActiveSupplyChains}
          onClick={(): void => {
            setSelectedAllocation(undefined);
            setFormKey((current) => current + 1);
            setFormOpen(true);
          }}
        >
          <PlusIcon className="size-4" />
          Allocate batch
        </Button>
      </div>
      {!hasActiveSupplyChains ? (
        <p className="text-muted-foreground text-sm">
          Create an active supply chain before allocating batches.
        </p>
      ) : null}
      <ListViewToolbar
        searchValue={searchQuery}
        onSearchChange={(value): void => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by batch or supply chain…"
        filterValue="all"
        onFilterChange={(): void => undefined}
        filterOptions={[{ value: "all", label: "All allocations" }]}
        filterLabel="Filter"
        layout={layout}
        onLayoutChange={setLayout}
      />
      {layout === "table" ? (
        <AllocationTable
          allocations={pagination.items}
          batchById={batchById}
          supplyChainNames={supplyChainNames}
          onEdit={(allocation): void => {
            setSelectedAllocation(allocation);
            setFormKey((current) => current + 1);
            setFormOpen(true);
          }}
          onDelete={(allocation): void => {
            setAllocationToDelete(allocation);
            setDeleteOpen(true);
          }}
          emptyMessage={emptyMessage}
        />
      ) : (
        <AllocationTable
          allocations={pagination.items}
          batchById={batchById}
          supplyChainNames={supplyChainNames}
          onEdit={(allocation): void => {
            setSelectedAllocation(allocation);
            setFormKey((current) => current + 1);
            setFormOpen(true);
          }}
          onDelete={(allocation): void => {
            setAllocationToDelete(allocation);
            setDeleteOpen(true);
          }}
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
      <AllocationFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        batches={batches}
        allocations={allocations}
        supplyChains={supplyChains}
        allocation={selectedAllocation}
      />
      <AllocationDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        allocation={allocationToDelete}
      />
    </div>
  );
}
