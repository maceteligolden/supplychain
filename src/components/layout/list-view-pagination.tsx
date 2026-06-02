"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LIST_VIEW_DEFAULT_PAGE_SIZE,
  LIST_VIEW_PAGE_SIZE_OPTIONS,
  type ListViewPageSize,
} from "@/config/list-view";

export interface ListViewPaginationProps {
  /** Active page number (1-based). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total items across all pages. */
  totalItems: number;
  /** 1-based index of the first visible item; 0 when empty. */
  rangeStart: number;
  /** 1-based index of the last visible item; 0 when empty. */
  rangeEnd: number;
  /** Current page size. */
  pageSize: number;
  /** Called when the user changes page. */
  onPageChange: (page: number) => void;
  /** Called when the user changes rows per page. */
  onPageSizeChange: (pageSize: ListViewPageSize) => void;
}

/**
 * ListViewPagination
 *
 * Standard pagination footer for ops list pages — range summary, page-size
 * selector, and previous/next navigation.
 */
export function ListViewPagination({
  currentPage,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ListViewPaginationProps): React.JSX.Element {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="gap-card flex flex-col border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        {totalItems === 0
          ? "No results"
          : `Showing ${rangeStart}–${rangeEnd} of ${totalItems}`}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value): void => {
              if (value !== null) {
                onPageSizeChange(Number(value) as ListViewPageSize);
              }
            }}
          >
            <SelectTrigger aria-label="Rows per page" className="w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {LIST_VIEW_PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-muted-foreground px-1 text-sm whitespace-nowrap">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="First page"
            disabled={!canGoPrevious}
            onClick={(): void => onPageChange(1)}
          >
            <ChevronsLeftIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={!canGoPrevious}
            onClick={(): void => onPageChange(currentPage - 1)}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={!canGoNext}
            onClick={(): void => onPageChange(currentPage + 1)}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Last page"
            disabled={!canGoNext}
            onClick={(): void => onPageChange(totalPages)}
          >
            <ChevronsRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Default page size re-export for list views that initialize state. */
export { LIST_VIEW_DEFAULT_PAGE_SIZE };
