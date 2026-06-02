/**
 * Generates an uppercase supply chain code from a display name.
 * Example: "Ghana Cocoa Export Chain" → "GHANA_COCOA_EXPORT_CHAIN"
 */
export function generateSupplyChainCodeFromName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}
