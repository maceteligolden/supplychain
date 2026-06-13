"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";

type CommodityThumbnailProps = {
  name: string;
  imageUrl: string;
  className?: string;
};

/**
 * Renders a commodity image when available, otherwise a neutral placeholder.
 */
export function CommodityThumbnail({
  name,
  imageUrl,
  className = "object-cover",
}: CommodityThumbnailProps): React.JSX.Element {
  if (!imageUrl) {
    return <ImageIcon className="text-muted-foreground size-6" aria-hidden />;
  }

  return <Image src={imageUrl} alt={name} fill className={className} unoptimized />;
}
