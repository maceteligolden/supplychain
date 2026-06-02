/** Default number of rows per page on ops list views. */
export const LIST_VIEW_DEFAULT_PAGE_SIZE = 10;

/** Allowed page-size options for list pagination controls. */
export const LIST_VIEW_PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;

export type ListViewPageSize = (typeof LIST_VIEW_PAGE_SIZE_OPTIONS)[number];
