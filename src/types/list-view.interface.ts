/** Supported list display layouts across ops list pages. */
export type ListViewLayout = "table" | "grid";

/** Option for list view filter dropdowns. */
export interface ListViewFilterOptionInterface {
  /** Filter value sent to onFilterChange. */
  value: string;
  /** Human-readable label shown in the select. */
  label: string;
}

/** Pagination metadata and current page slice for a list view. */
export interface PaginatedItemsInterface<T> {
  /** Items visible on the current page. */
  items: T[];
  /** Total items across all pages. */
  totalItems: number;
  /** Total number of pages. */
  totalPages: number;
  /** Active page number (1-based). */
  currentPage: number;
  /** Number of items per page. */
  pageSize: number;
  /** 1-based index of the first item on the page; 0 when empty. */
  rangeStart: number;
  /** 1-based index of the last item on the page; 0 when empty. */
  rangeEnd: number;
}
