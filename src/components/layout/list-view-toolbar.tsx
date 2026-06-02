"use client";

import { LayoutGridIcon, ListIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  ListViewFilterOptionInterface,
  ListViewLayout,
} from "@/types/list-view.interface";

export interface ListViewToolbarProps {
  /** Current search query. */
  searchValue: string;
  /** Called when the search input changes. */
  onSearchChange: (value: string) => void;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
  /** Current filter value. */
  filterValue: string;
  /** Called when the filter selection changes. */
  onFilterChange: (value: string) => void;
  /** Options for the filter dropdown. */
  filterOptions: ListViewFilterOptionInterface[];
  /** Accessible label for the filter control. */
  filterLabel?: string;
  /** Current list layout. */
  layout: ListViewLayout;
  /** Called when the user switches layout. */
  onLayoutChange: (layout: ListViewLayout) => void;
}

/**
 * ListViewToolbar
 *
 * Standard list controls — search, filter, and table/grid layout switcher.
 * Reuse on any ops list page (commodities, farms, batches, etc.).
 */
export function ListViewToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = "Filter",
  layout,
  onLayoutChange,
}: ListViewToolbarProps): React.JSX.Element {
  return (
    <div className="gap-card flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={searchValue}
          onChange={(event): void => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search list"
          className="pl-8"
        />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Select
          value={filterValue}
          onValueChange={(value): void => {
            if (value !== null) {
              onFilterChange(value);
            }
          }}
        >
          <SelectTrigger aria-label={filterLabel} className="w-[180px]">
            <SelectValue placeholder={filterLabel} />
          </SelectTrigger>
          <SelectContent align="end">
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div
          className="border-border flex rounded-lg border p-0.5"
          role="group"
          aria-label="Layout"
        >
          <Button
            type="button"
            variant={layout === "table" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-pressed={layout === "table"}
            aria-label="Table layout"
            className={cn("rounded-md", layout === "table" && "shadow-sm")}
            onClick={(): void => onLayoutChange("table")}
          >
            <ListIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant={layout === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-pressed={layout === "grid"}
            aria-label="Grid layout"
            className={cn("rounded-md", layout === "grid" && "shadow-sm")}
            onClick={(): void => onLayoutChange("grid")}
          >
            <LayoutGridIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
