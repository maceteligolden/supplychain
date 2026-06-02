type BuildMockImageUrlInput = {
  code: string;
  imageFileName?: string;
};

/**
 * Builds a stub image URL for mock storage — no file is actually persisted.
 * Uses the commodity code for a stable path under /commodities/mock/.
 */
export function buildMockImageUrl(input: BuildMockImageUrlInput): string {
  const slug = input.code.toLowerCase().replace(/_/g, "-");

  if (input.imageFileName) {
    const extension = input.imageFileName.includes(".")
      ? input.imageFileName.split(".").pop()
      : "png";
    return `/commodities/mock/${slug}.${extension ?? "png"}`;
  }

  return `/commodities/${slug}.png`;
}
