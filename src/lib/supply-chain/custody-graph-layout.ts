/** Fixed visual width of custody graph nodes (px). */
export const CUSTODY_NODE_WIDTH = 208;

/** Horizontal gap between adjacent node columns (px). */
export const CUSTODY_COLUMN_GAP = 48;

/** Vertical gap between stacked nodes in a column (px). */
export const CUSTODY_ROW_GAP = 32;

/** Estimated base node height before wrapping (px). */
export const CUSTODY_NODE_BASE_HEIGHT = 88;

/** Approximate pixels per wrapped subtitle/label line. */
export const CUSTODY_LINE_HEIGHT = 18;

/** Characters that roughly fit on one line inside a custody node. */
export const CUSTODY_CHARS_PER_LINE = 28;

/** Column pitch = node width + gap (keeps consistent space on both sides). */
export const CUSTODY_COLUMN_PITCH = CUSTODY_NODE_WIDTH + CUSTODY_COLUMN_GAP;

/**
 * Estimates node height from label/subtitle length so row spacing can grow
 * with wrapped text while keeping a consistent gap between boxes.
 */
export function estimateCustodyNodeHeight(input: {
  label: string;
  subtitle?: string;
}): number {
  const labelLines = Math.max(
    1,
    Math.ceil(input.label.length / CUSTODY_CHARS_PER_LINE),
  );
  const subtitleLines = input.subtitle
    ? Math.max(1, Math.ceil(input.subtitle.length / CUSTODY_CHARS_PER_LINE))
    : 0;

  const wrappedExtra = Math.max(0, labelLines - 1) * CUSTODY_LINE_HEIGHT;
  const subtitleExtra = subtitleLines * CUSTODY_LINE_HEIGHT;

  return CUSTODY_NODE_BASE_HEIGHT + wrappedExtra + subtitleExtra;
}

/** Converts column/row indices into React Flow pixel positions. */
export function toCustodyFlowPosition(
  column: number,
  rowOffsetY: number,
): { x: number; y: number } {
  return {
    x: column * CUSTODY_COLUMN_PITCH,
    y: rowOffsetY,
  };
}
