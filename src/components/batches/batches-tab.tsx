"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";

import { BatchDeleteDialog } from "@/components/batches/batch-delete-dialog";
import { BatchFormDialog } from "@/components/batches/batch-form-dialog";
import { BatchTable } from "@/components/batches/batch-table";
import {
  LIST_VIEW_DEFAULT_PAGE_SIZE,
  ListViewPagination,
} from "@/components/layout/list-view-pagination";
import { ListViewToolbar } from "@/components/layout/list-view-toolbar";
import { Button } from "@/components/ui/button";
import type { ListViewPageSize } from "@/config/list-view";
import { filterItemsBySearch } from "@/lib/list-view/filter-items";
import { paginateItems } from "@/lib/list-view/paginate-items";
import type { BatchInterface } from "@/types/batch.interface";
import type { ListViewLayout } from "@/types/list-view.interface";

export interface BatchesTabProps {
  farmId: string;
  batches: BatchInterface[];
}

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "CREATED", label: "Created" },
  { value: "PARTIALLY_ALLOCATED", label: "Partially allocated" },
  { value: "FULLY_ALLOCATED", label: "Fully allocated" },
];

/**
 * BatchesTab
 *
 * Harvest batch list and CRUD for a selected farm.
 */
export function BatchesTab({ farmId, batches }: BatchesTabProps): React.JSX.Element {
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
  const [selectedBatch, setSelectedBatch] = useState<BatchInterface | undefined>(
    undefined,
  );
  const [batchToDelete, setBatchToDelete] = useState<BatchInterface | null>(null);

  const filteredBatches = useMemo(() => {
    const searched = filterItemsBySearch(batches, searchQuery, (batch) =>
      `${batch.batchNumber} ${batch.harvestDate}`.trim(),
    );

    if (statusFilter === "all") {
      return searched;
    }

    return searched.filter((batch) => batch.status === statusFilter);
  }, [batches, searchQuery, statusFilter]);

  const pagination = useMemo(
    () => paginateItems(filteredBatches, currentPage, pageSize),
    [filteredBatches, currentPage, pageSize],
  );

  const hasActiveFilters = searchQuery.trim().length > 0 || statusFilter !== "all";
  const emptyMessage = hasActiveFilters
    ? "No batches match your search or filter."
    : "No batches yet. Record your first harvest batch.";

  return (
    <div className="gap-card flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Harvest batches for this farm</p>
        <Button
          size="sm"
          onClick={(): void => {
            setSelectedBatch(undefined);
            setFormKey((current) => current + 1);
            setFormOpen(true);
          }}
        >
          <PlusIcon className="size-4" />
          Add batch
        </Button>
      </div>
      <ListViewToolbar
        searchValue={searchQuery}
        onSearchChange={(value): void => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by batch number…"
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
      <BatchTable
        batches={pagination.items}
        onEdit={(batch): void => {
          setSelectedBatch(batch);
          setFormKey((current) => current + 1);
          setFormOpen(true);
        }}
        onDelete={(batch): void => {
          setBatchToDelete(batch);
          setDeleteOpen(true);
        }}
        emptyMessage={emptyMessage}
      />
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
      <BatchFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        farmId={farmId}
        batch={selectedBatch}
      />
      <BatchDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        batch={batchToDelete}
      />
    </div>
  );
}
