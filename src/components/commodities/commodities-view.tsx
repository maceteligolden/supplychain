"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";

import { CommodityDeleteDialog } from "@/components/commodities/commodity-delete-dialog";
import { CommodityFormDialog } from "@/components/commodities/commodity-form-dialog";
import { CommodityGrid } from "@/components/commodities/commodity-grid";
import { CommodityTable } from "@/components/commodities/commodity-table";
import {
  LIST_VIEW_DEFAULT_PAGE_SIZE,
  ListViewPagination,
} from "@/components/layout/list-view-pagination";
import { ListViewToolbar } from "@/components/layout/list-view-toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COMMODITY_UNIT_LABELS, COMMODITY_UNITS } from "@/config/commodity-units";
import type { ListViewPageSize } from "@/config/list-view";
import { filterItemsByField, filterItemsBySearch } from "@/lib/list-view/filter-items";
import { paginateItems } from "@/lib/list-view/paginate-items";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { ListViewLayout } from "@/types/list-view.interface";

export interface CommoditiesViewProps {
  /** Initial commodities loaded by the server page. */
  commodities: CommodityInterface[];
}

const COMMODITY_FILTER_OPTIONS = [
  { value: "all", label: "All units" },
  ...COMMODITY_UNITS.map((unit) => ({
    value: unit,
    label: COMMODITY_UNIT_LABELS[unit],
  })),
];

/**
 * CommoditiesView
 *
 * Client shell for commodity management — searchable/filterable paginated list
 * with table or grid layout, create/edit dialog, and delete confirmation.
 */
export function CommoditiesView({
  commodities,
}: CommoditiesViewProps): React.JSX.Element {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [layout, setLayout] = useState<ListViewLayout>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<ListViewPageSize>(
    LIST_VIEW_DEFAULT_PAGE_SIZE,
  );
  const [selectedCommodity, setSelectedCommodity] = useState<
    CommodityInterface | undefined
  >(undefined);
  const [commodityToDelete, setCommodityToDelete] = useState<CommodityInterface | null>(
    null,
  );

  const filteredCommodities = useMemo(() => {
    const searched = filterItemsBySearch(commodities, searchQuery, (commodity) =>
      `${commodity.name} ${commodity.code}`.trim(),
    );

    return filterItemsByField(searched, unitFilter, (commodity) => commodity.unit);
  }, [commodities, searchQuery, unitFilter]);

  const pagination = useMemo(
    () => paginateItems(filteredCommodities, currentPage, pageSize),
    [filteredCommodities, currentPage, pageSize],
  );

  const hasActiveFilters = searchQuery.trim().length > 0 || unitFilter !== "all";
  const emptyMessage = hasActiveFilters
    ? "No commodities match your search or filter."
    : "No commodities yet. Add your first commodity to get started.";

  function handleSearchChange(value: string): void {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handleFilterChange(value: string): void {
    setUnitFilter(value);
    setCurrentPage(1);
  }

  function handlePageSizeChange(nextPageSize: ListViewPageSize): void {
    setPageSize(nextPageSize);
    setCurrentPage(1);
  }

  function handleCreate(): void {
    setSelectedCommodity(undefined);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function handleEdit(commodity: CommodityInterface): void {
    setSelectedCommodity(commodity);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function handleDelete(commodity: CommodityInterface): void {
    setCommodityToDelete(commodity);
    setDeleteOpen(true);
  }

  return (
    <div className="gap-section flex flex-col">
      <PageHeader
        title="Commodities"
        description="Manage traceable commodities — name, code, unit, and image."
        actions={
          <Button onClick={handleCreate}>
            <PlusIcon className="size-4" />
            Add commodity
          </Button>
        }
      />
      <Card>
        <CardContent className="gap-card flex flex-col pt-6">
          <ListViewToolbar
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search by name or code…"
            filterValue={unitFilter}
            onFilterChange={handleFilterChange}
            filterOptions={COMMODITY_FILTER_OPTIONS}
            filterLabel="Filter by unit"
            layout={layout}
            onLayoutChange={setLayout}
          />
          {layout === "table" ? (
            <CommodityTable
              commodities={pagination.items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage={emptyMessage}
            />
          ) : (
            <CommodityGrid
              commodities={pagination.items}
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
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>
      <CommodityFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        commodity={selectedCommodity}
      />
      <CommodityDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        commodity={commodityToDelete}
      />
    </div>
  );
}
