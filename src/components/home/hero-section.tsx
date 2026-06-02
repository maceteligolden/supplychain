"use client";

import { useAtomValue } from "jotai";

import { Button } from "@/components/ui/button";
import { appMetaAtom } from "@/store/atoms";

export interface HeroSectionProps {
  /** Optional override for the primary call-to-action label. */
  ctaLabel?: string;
  /** Optional callback when the primary CTA is clicked. */
  onCtaClick?: () => void;
}

/**
 * HeroSection
 *
 * Landing hero that reads global app metadata from Jotai and renders a primary
 * CTA. Keeps marketing copy centralized in `appMetaAtom` while allowing page-
 * level overrides for the button label and click handler.
 */
export function HeroSection({
  ctaLabel = "Get started",
  onCtaClick,
}: HeroSectionProps): React.JSX.Element {
  const appMeta = useAtomValue(appMetaAtom);

  function handleCtaClick(): void {
    onCtaClick?.();
  }

  return (
    <section className="gap-section px-page py-section flex flex-col items-center text-center">
      <p className="text-brand-primary-600 text-sm font-medium tracking-wide uppercase">
        Supply chain platform
      </p>
      <h1 className="text-foreground max-w-prose text-4xl font-bold tracking-tight">
        {appMeta.appName}
      </h1>
      <p className="text-muted-foreground max-w-prose text-lg">{appMeta.tagline}</p>
      <Button size="lg" onClick={handleCtaClick}>
        {ctaLabel}
      </Button>
    </section>
  );
}
