/**
 * Supply chain design tokens — single source of truth for color values.
 * Compact enterprise palette (sustainability-focused green primary).
 */

export const palette = {
  primary: "#2F6F4F",
  primaryHover: "#255A40",
  primaryLight: "#E8F4EE",
  background: "#FFFFFF",
  backgroundSecondary: "#F7F8FA",
  backgroundTertiary: "#F1F3F5",
  border: "#E4E7EC",
  textPrimary: "#101828",
  textSecondary: "#475467",
  textMuted: "#98A2B3",
  success: "#12B76A",
  warning: "#F79009",
  error: "#F04438",
  info: "#2E90FA",
} as const;

export const brand = {
  primary: {
    50: "#E8F4EE",
    100: "#D1E9DD",
    200: "#A3D3BB",
    300: "#75BD99",
    400: "#4A9A73",
    500: "#2F6F4F",
    600: "#255A40",
    700: "#1C4532",
    800: "#133024",
    900: "#0A1B16",
    DEFAULT: palette.primary,
    foreground: "#FFFFFF",
  },
  secondary: {
    DEFAULT: palette.backgroundSecondary,
    foreground: palette.textPrimary,
  },
  accent: {
    DEFAULT: palette.primaryLight,
    foreground: palette.primary,
  },
  destructive: {
    DEFAULT: palette.error,
    foreground: "#FFFFFF",
  },
  warning: {
    DEFAULT: palette.warning,
    foreground: palette.textPrimary,
  },
  success: {
    DEFAULT: palette.success,
    foreground: "#FFFFFF",
  },
  info: {
    DEFAULT: palette.info,
    foreground: "#FFFFFF",
  },
} as const;

export const neutral = {
  50: palette.background,
  100: palette.backgroundSecondary,
  200: palette.backgroundTertiary,
  300: palette.border,
  400: palette.textMuted,
  500: palette.textSecondary,
  600: palette.textSecondary,
  700: palette.textPrimary,
  800: palette.textPrimary,
  900: palette.textPrimary,
} as const;

export const semantic = {
  background: palette.background,
  foreground: palette.textPrimary,
  muted: palette.backgroundTertiary,
  "muted-foreground": palette.textMuted,
  "text-secondary": palette.textSecondary,
  border: palette.border,
  ring: palette.primary,
} as const;

export const colors = {
  palette,
  brand,
  neutral,
  semantic,
} as const;
