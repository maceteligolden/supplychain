/**
 * Filters items by a case-insensitive substring match against searchable text.
 */
export function filterItemsBySearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string,
): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) =>
    getSearchableText(item).toLowerCase().includes(normalizedQuery),
  );
}

/**
 * Filters items when a specific field value is selected; "all" returns the full list.
 */
export function filterItemsByField<T>(
  items: T[],
  filterValue: string,
  getFieldValue: (item: T) => string,
): T[] {
  if (filterValue === "all") {
    return items;
  }

  return items.filter((item) => getFieldValue(item) === filterValue);
}
