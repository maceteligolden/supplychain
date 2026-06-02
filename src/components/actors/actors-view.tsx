"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";

import { ActorDeleteDialog } from "@/components/actors/actor-delete-dialog";
import { ActorFormDialog } from "@/components/actors/actor-form-dialog";
import { ActorGrid } from "@/components/actors/actor-grid";
import { ActorTable } from "@/components/actors/actor-table";
import {
  LIST_VIEW_DEFAULT_PAGE_SIZE,
  ListViewPagination,
} from "@/components/layout/list-view-pagination";
import { ListViewToolbar } from "@/components/layout/list-view-toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACTOR_STATUSES,
  ACTOR_STATUS_LABELS,
  ACTOR_TYPES,
  ACTOR_TYPE_LABELS,
} from "@/config/actor-types";
import type { ListViewPageSize } from "@/config/list-view";
import { filterItemsByField, filterItemsBySearch } from "@/lib/list-view/filter-items";
import { paginateItems } from "@/lib/list-view/paginate-items";
import type { ActorInterface } from "@/types/actor.interface";
import type { ListViewLayout } from "@/types/list-view.interface";

export interface ActorsViewProps {
  actors: ActorInterface[];
}

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  ...ACTOR_TYPES.map((type) => ({
    value: type,
    label: ACTOR_TYPE_LABELS[type],
  })),
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...ACTOR_STATUSES.map((status) => ({
    value: status,
    label: ACTOR_STATUS_LABELS[status],
  })),
];

/**
 * ActorsView
 *
 * Client shell for actor management — searchable/filterable paginated list.
 */
export function ActorsView({ actors }: ActorsViewProps): React.JSX.Element {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [layout, setLayout] = useState<ListViewLayout>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<ListViewPageSize>(
    LIST_VIEW_DEFAULT_PAGE_SIZE,
  );
  const [selectedActor, setSelectedActor] = useState<ActorInterface | undefined>(
    undefined,
  );
  const [actorToDelete, setActorToDelete] = useState<ActorInterface | null>(null);

  const filteredActors = useMemo(() => {
    const searched = filterItemsBySearch(actors, searchQuery, (actor) =>
      `${actor.name} ${actor.code} ${actor.address.city} ${actor.address.country}`.trim(),
    );
    const byType = filterItemsByField(searched, typeFilter, (actor) => actor.type);
    return filterItemsByField(byType, statusFilter, (actor) => actor.status);
  }, [actors, searchQuery, typeFilter, statusFilter]);

  const pagination = useMemo(
    () => paginateItems(filteredActors, currentPage, pageSize),
    [filteredActors, currentPage, pageSize],
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 || typeFilter !== "all" || statusFilter !== "all";
  const emptyMessage = hasActiveFilters
    ? "No actors match your search or filter."
    : "No actors yet. Add your first actor to get started.";

  function handleCreate(): void {
    setSelectedActor(undefined);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function handleEdit(actor: ActorInterface): void {
    setSelectedActor(actor);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function handleDelete(actor: ActorInterface): void {
    setActorToDelete(actor);
    setDeleteOpen(true);
  }

  return (
    <div className="gap-section flex flex-col">
      <PageHeader
        title="Actors"
        description="Manage collection centres, processors, and other supply chain participants."
        actions={
          <Button onClick={handleCreate}>
            <PlusIcon className="size-4" />
            Add actor
          </Button>
        }
      />
      <Card>
        <CardContent className="gap-card flex flex-col pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <ListViewToolbar
              searchValue={searchQuery}
              onSearchChange={(value): void => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              searchPlaceholder="Search by name, code, or location…"
              filterValue={typeFilter}
              onFilterChange={(value): void => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}
              filterOptions={TYPE_FILTER_OPTIONS}
              filterLabel="Filter by type"
              layout={layout}
              onLayoutChange={setLayout}
            />
            <Select
              value={statusFilter}
              onValueChange={(value): void => {
                if (value !== null) {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }
              }}
            >
              <SelectTrigger aria-label="Filter by status" className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent align="end">
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {layout === "table" ? (
            <ActorTable
              actors={pagination.items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage={emptyMessage}
            />
          ) : (
            <ActorGrid
              actors={pagination.items}
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
      <ActorFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        actor={selectedActor}
      />
      <ActorDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        actor={actorToDelete}
      />
    </div>
  );
}
