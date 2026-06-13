/**
 * Compact typography scale (scaled ~87.5% from enterprise defaults).
 * Base html font-size is 14px; sizes below are in rem relative to that base.
 */

export const fontSize = {
  "display-lg": ["1.875rem", { lineHeight: "2.25rem", fontWeight: "700" }],
  display: ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
  h1: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
  h2: ["1.125rem", { lineHeight: "1.625rem", fontWeight: "600" }],
  h3: ["1rem", { lineHeight: "1.5rem", fontWeight: "600" }],
  body: ["0.875rem", { lineHeight: "1.375rem", fontWeight: "400" }],
  "body-sm": ["0.8125rem", { lineHeight: "1.25rem", fontWeight: "400" }],
  caption: ["0.75rem", { lineHeight: "1.125rem", fontWeight: "400" }],
} as const;

/** Root font size for compact density */
export const baseFontSize = "14px";
