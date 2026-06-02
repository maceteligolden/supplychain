import type { Config } from "tailwindcss";

import { brand, neutral, semantic } from "./design-tokens/colors";

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
        border: semantic.border,
        ring: semantic.ring,
      },
      spacing: {
        page: "1.5rem",
        section: "3rem",
        card: "1rem",
      },
      maxWidth: {
        content: "72rem",
        prose: "65ch",
      },
    },
  },
};

export default config;
