import type { PaginatedItemsInterface } from "@/types/list-view.interface";

/**
 * Slices a list into a single page and returns pagination metadata.
 */
export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedItemsInterface<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    rangeStart,
    rangeEnd,
  };
}
