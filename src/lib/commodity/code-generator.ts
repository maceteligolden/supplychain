/**
 * Generates an uppercase commodity code from a display name.
 * Example: "Gum Arabic" → "GUM_ARABIC"
 */
export function generateCommodityCodeFromName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}
