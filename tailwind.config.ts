import type { Config } from "tailwindcss";

import { brand, neutral, semantic } from "./design-tokens/colors";
import { radii } from "./design-tokens/radii";
import { spacing } from "./design-tokens/spacing";
import { fontSize } from "./design-tokens/typography";

/**
 * Tailwind theme extension. All colors must be defined here — never use
 * arbitrary values like bg-[#fff] or w-[13px] in component class names.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: brand,
        neutral: neutral,
        background: semantic.background,
        foreground: semantic.foreground,
        muted: semantic.muted,
        "muted-foreground": semantic["muted-foreground"],
        "text-secondary": semantic["text-secondary"],
        border: semantic.border,
        ring: semantic.ring,
        "primary-hover": "var(--primary-hover)",
        "primary-light": "var(--primary-light)",
        "surface-secondary": "var(--surface-secondary)",
        "surface-tertiary": "var(--surface-tertiary)",
        success: "var(--success)",
        warning: "var(--warning)",
        info: "var(--info)",
      },
      spacing: {
        page: spacing.page,
        section: spacing.section,
        card: spacing.card,
        tight: spacing.tight,
        grid: spacing.grid,
      },
      fontSize,
      borderRadius: {
        control: radii.control,
        card: radii.card,
      },
      maxWidth: {
        content: "72rem",
        prose: "65ch",
      },
    },
  },
};

export default config;
