"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";

import { FarmDeleteDialog } from "@/components/farms/farm-delete-dialog";
import { FarmFormDialog } from "@/components/farms/farm-form-dialog";
import { FarmGrid } from "@/components/farms/farm-grid";
import { FarmTable } from "@/components/farms/farm-table";
import {
  LIST_VIEW_DEFAULT_PAGE_SIZE,
  ListViewPagination,
} from "@/components/layout/list-view-pagination";
import { ListViewToolbar } from "@/components/layout/list-view-toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ListViewPageSize } from "@/config/list-view";
import { filterItemsByField, filterItemsBySearch } from "@/lib/list-view/filter-items";
import { paginateItems } from "@/lib/list-view/paginate-items";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { ListViewLayout } from "@/types/list-view.interface";

export interface FarmsViewProps {
  /** Initial farms loaded by the server page. */
  farms: FarmInterface[];
  /** Commodities used for filter options and form select. */
  commodities: CommodityInterface[];
}

/**
 * FarmsView
 *
 * Client shell for farm management — searchable/filterable paginated list
 * with table or grid layout, create/edit dialog, and delete confirmation.
 */
export function FarmsView({ farms, commodities }: FarmsViewProps): React.JSX.Element {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [commodityFilter, setCommodityFilter] = useState("all");
  const [layout, setLayout] = useState<ListViewLayout>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<ListViewPageSize>(
    LIST_VIEW_DEFAULT_PAGE_SIZE,
  );
  const [selectedFarm, setSelectedFarm] = useState<FarmInterface | undefined>(
    undefined,
  );
  const [farmToDelete, setFarmToDelete] = useState<FarmInterface | null>(null);

  const commodityNames = useMemo(
    () =>
      Object.fromEntries(
        commodities.map((commodity) => [commodity.id, commodity.name]),
      ),
    [commodities],
  );

  const commodityFilterOptions = useMemo(
    () => [
      { value: "all", label: "All commodities" },
      ...commodities.map((commodity) => ({
        value: commodity.id,
        label: commodity.name,
      })),
    ],
    [commodities],
  );

  const filteredFarms = useMemo(() => {
    const searched = filterItemsBySearch(farms, searchQuery, (farm) =>
      `${farm.name} ${farm.code} ${farm.location.city} ${farm.location.region} ${farm.location.country}`.trim(),
    );

    return filterItemsByField(searched, commodityFilter, (farm) => farm.commodityId);
  }, [farms, searchQuery, commodityFilter]);

  const pagination = useMemo(
    () => paginateItems(filteredFarms, currentPage, pageSize),
    [filteredFarms, currentPage, pageSize],
  );

  const hasActiveFilters = searchQuery.trim().length > 0 || commodityFilter !== "all";
  const emptyMessage = hasActiveFilters
    ? "No farms match your search or filter."
    : "No farms yet. Add your first farm to get started.";

  function handleSearchChange(value: string): void {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handleFilterChange(value: string): void {
    setCommodityFilter(value);
    setCurrentPage(1);
  }

  function handlePageSizeChange(nextPageSize: ListViewPageSize): void {
    setPageSize(nextPageSize);
    setCurrentPage(1);
  }

  function handleCreate(): void {
    setSelectedFarm(undefined);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function handleEdit(farm: FarmInterface): void {
    setSelectedFarm(farm);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function handleDelete(farm: FarmInterface): void {
    setFarmToDelete(farm);
    setDeleteOpen(true);
  }

  return (
    <div className="gap-section flex flex-col">
      <PageHeader
        title="Farms"
        description="Register and manage farms — link each farm to a commodity and location."
        actions={
          <Button onClick={handleCreate} disabled={commodities.length === 0}>
            <PlusIcon className="size-4" />
            Add farm
          </Button>
        }
      />
      {commodities.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center text-sm">
            Create at least one commodity before registering farms.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="gap-card flex flex-col pt-6">
            <ListViewToolbar
              searchValue={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search by name, code, or location…"
              filterValue={commodityFilter}
              onFilterChange={handleFilterChange}
              filterOptions={commodityFilterOptions}
              filterLabel="Filter by commodity"
              layout={layout}
              onLayoutChange={setLayout}
            />
            {layout === "table" ? (
              <FarmTable
                farms={pagination.items}
                commodityNames={commodityNames}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage={emptyMessage}
              />
            ) : (
              <FarmGrid
                farms={pagination.items}
                commodityNames={commodityNames}
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
      )}
      <FarmFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        farm={selectedFarm}
        commodities={commodities}
      />
      <FarmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        farm={farmToDelete}
      />
    </div>
  );
}
