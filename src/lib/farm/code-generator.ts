/**
 * Generates an uppercase farm code from a display name.
 * Example: "Ashanti Cocoa Farm" → "ASHANTI_COCOA_FARM"
 */
export function generateFarmCodeFromName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}
