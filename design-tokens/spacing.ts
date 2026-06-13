/**
 * Spacing scale — layout tokens used across pages via Tailwind utilities.
 * Values are absolute px so they stay consistent regardless of root font-size.
 */

export const spacing = {
  /** Page/main padding — 24px */
  page: "24px",
  /** Vertical gap between major sections — 40px */
  section: "40px",
  /** Gap within cards, form groups, headers — 16px */
  card: "16px",
  /** Tight inline gaps — 10px */
  tight: "10px",
  /** Grid gap between cards/tiles — 20px */
  grid: "20px",
} as const;
