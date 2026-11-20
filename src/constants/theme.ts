/**
 * Sistema de Diseño y Paleta de Colores "Apex Emerald Gym"
 * Diseñado específicamente para una experiencia UX/UI deportiva de lujo en modo Dark y Light.
 */

import "@/global.css";
import { Platform } from "react-native";

export const Palette = {
  emerald: "#2C5A4B",        // Detalle sutil (acentos menores)
  emeraldBase: "#080C0A",    // Obsidiana profunda original
  emeraldCard: "#111815",    // Carbón esmeralda original
  emeraldSelected: "#1D332A",
  lilac: "#947DB5",          // Detalle secundario sutil
  lilacSoft: "rgba(148, 125, 181, 0.18)",
  lilacBorder: "rgba(148, 125, 181, 0.35)",
  volt: "#E6FF3A",           // Detalle acento puntual (chispas / indicadores menores)
  voltLight: "#EEFF6B",
  voltDark: "#C6DF20",
  voltGlow: "rgba(230, 255, 58, 0.14)",
  textLight: "#FFFFFF",
  textDark: "#FFFFFF",
  textOnVolt: "#FFFFFF",
  danger: "#F43F5E",
  dangerGlow: "rgba(244, 63, 94, 0.16)",
  warning: "#F59E0B",
  warningGlow: "rgba(245, 158, 11, 0.16)",
  overlay: "rgba(0, 0, 0, 0.75)",
} as const;

export type ThemeMode = "dark" | "light" | "system";
export type ResolvedThemeMode = "dark" | "light";
export type AccentId = "emerald" | "ocean" | "amber" | "violet" | "crimson";

export interface AccentPaletteVariant {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGlow: string;
  border: string;
  backgroundSelected: string;
  onPrimary: string;
}

export interface AccentPaletteConfig {
  id: AccentId;
  name: string;
  description: string;
  swatchDark: string;
  swatchLight: string;
  dark: AccentPaletteVariant;
  light: AccentPaletteVariant;
}

export interface ThemeColors {
  text: string;
  textSecondary: string;
  onPrimary: string;
  onAccent: string;
  background: string;
  backgroundElement: string;
  backgroundElevated: string;
  backgroundSelected: string;
  emerald: string;
  secondary: string;
  secondaryGlow: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGlow: string;
  accent: string;
  border: string;
  borderSubtle: string;
  danger: string;
  dangerGlow: string;
  warning: string;
  warningGlow: string;
  success: string;
  overlay: string;
  handleBar: string;
  toastSuccessBg: string;
  toastErrorBg: string;
  toastWarningBg: string;
  toastInfoBg: string;
}

export const ACCENT_PALETTES: Record<AccentId, AccentPaletteConfig> = {
  emerald: {
    id: "emerald",
    name: "Esmeralda",
    description: "Por defecto",
    swatchDark: "#10B981",
    swatchLight: "#047857",
    dark: {
      primary: "#10B981",
      primaryLight: "#34D399",
      primaryDark: "#059669",
      primaryGlow: "rgba(16, 185, 129, 0.16)",
      border: "rgba(52, 211, 153, 0.16)",
      backgroundSelected: "#1E1E1E",
      onPrimary: "#FFFFFF",
    },
    light: {
      primary: "#047857",
      primaryLight: "#10B981",
      primaryDark: "#065F46",
      primaryGlow: "rgba(4, 120, 87, 0.12)",
      border: "rgba(4, 120, 87, 0.24)",
      backgroundSelected: "#D1FAE5",
      onPrimary: "#FFFFFF",
    },
  },
  ocean: {
    id: "ocean",
    name: "Azul Océano",
    description: "Fresco y técnico",
    swatchDark: "#3B82F6",
    swatchLight: "#1D4ED8",
    dark: {
      primary: "#3B82F6",
      primaryLight: "#60A5FA",
      primaryDark: "#2563EB",
      primaryGlow: "rgba(59, 130, 246, 0.16)",
      border: "rgba(96, 165, 250, 0.20)",
      backgroundSelected: "#15243D",
      onPrimary: "#FFFFFF",
    },
    light: {
      primary: "#1D4ED8",
      primaryLight: "#3B82F6",
      primaryDark: "#1E40AF",
      primaryGlow: "rgba(29, 78, 216, 0.11)",
      border: "rgba(29, 78, 216, 0.24)",
      backgroundSelected: "#DBEAFE",
      onPrimary: "#FFFFFF",
    },
  },
  amber: {
    id: "amber",
    name: "Naranja Energía",
    description: "Potencia y dinamismo",
    swatchDark: "#EA580C",
    swatchLight: "#C2410C",
    dark: {
      primary: "#EA580C",
      primaryLight: "#FB923C",
      primaryDark: "#C2410C",
      primaryGlow: "rgba(234, 88, 12, 0.18)",
      border: "rgba(251, 146, 60, 0.22)",
      backgroundSelected: "#331D12",
      onPrimary: "#FFFFFF",
    },
    light: {
      primary: "#C2410C",
      primaryLight: "#EA580C",
      primaryDark: "#9A3412",
      primaryGlow: "rgba(194, 65, 12, 0.11)",
      border: "rgba(194, 65, 12, 0.24)",
      backgroundSelected: "#FFEDD5",
      onPrimary: "#FFFFFF",
    },
  },
  violet: {
    id: "violet",
    name: "Morado Eléctrico",
    description: "Moderno y deportivo",
    swatchDark: "#8B5CF6",
    swatchLight: "#6D28D9",
    dark: {
      primary: "#8B5CF6",
      primaryLight: "#A78BFA",
      primaryDark: "#7C3AED",
      primaryGlow: "rgba(139, 92, 246, 0.18)",
      border: "rgba(167, 139, 250, 0.22)",
      backgroundSelected: "#251B3D",
      onPrimary: "#FFFFFF",
    },
    light: {
      primary: "#6D28D9",
      primaryLight: "#8B5CF6",
      primaryDark: "#5B21B6",
      primaryGlow: "rgba(109, 40, 217, 0.11)",
      border: "rgba(109, 40, 217, 0.24)",
      backgroundSelected: "#EDE9FE",
      onPrimary: "#FFFFFF",
    },
  },
  crimson: {
    id: "crimson",
    name: "Rojo Carmesí",
    description: "Intensidad máxima",
    swatchDark: "#F43F5E",
    swatchLight: "#BE123C",
    dark: {
      primary: "#F43F5E",
      primaryLight: "#FB7185",
      primaryDark: "#E11D48",
      primaryGlow: "rgba(244, 63, 94, 0.18)",
      border: "rgba(251, 113, 133, 0.22)",
      backgroundSelected: "#35161F",
      onPrimary: "#FFFFFF",
    },
    light: {
      primary: "#BE123C",
      primaryLight: "#E11D48",
      primaryDark: "#9F1239",
      primaryGlow: "rgba(190, 18, 60, 0.11)",
      border: "rgba(190, 18, 60, 0.24)",
      backgroundSelected: "#FFE4E6",
      onPrimary: "#FFFFFF",
    },
  },
};

export const ACCENT_LIST: AccentPaletteConfig[] = [
  ACCENT_PALETTES.emerald,
  ACCENT_PALETTES.ocean,
  ACCENT_PALETTES.amber,
  ACCENT_PALETTES.violet,
  ACCENT_PALETTES.crimson,
];

const DARK_BASE: Omit<ThemeColors, keyof AccentPaletteVariant> = {
  text: "#FFFFFF",                     // Letras siempre en blanco
  textSecondary: "#A3A3A3",            // Gris neutro puro para subtítulos
  onAccent: "#FFFFFF",
  background: "#0A0A0A",               // Negro carbón profundo sin matiz verdoso
  backgroundElement: "#141414",        // Negro carbón neutro para tarjetas principales
  backgroundElevated: "#1F1F1F",       // Superficie elevada neutra para inputs y modales
  emerald: Palette.emerald,            // #2C5A4B reservado para detalles menores
  secondary: Palette.lilac,            // #947DB5 reservado para detalles menores
  secondaryGlow: Palette.lilacSoft,
  accent: Palette.volt,                // #E6FF3A reservado para pequeños acentos
  borderSubtle: "rgba(255, 255, 255, 0.09)",
  danger: Palette.danger,
  dangerGlow: Palette.dangerGlow,
  warning: Palette.warning,
  warningGlow: Palette.warningGlow,
  success: "#10B981",
  overlay: Palette.overlay,
  handleBar: "rgba(255, 255, 255, 0.22)",
  toastSuccessBg: "#1A1A1A",
  toastErrorBg: "#2A1219",
  toastWarningBg: "#291E0C",
  toastInfoBg: "#1A1A1A",
};

const LIGHT_BASE: Omit<ThemeColors, keyof AccentPaletteVariant> = {
  text: "#0F172A",
  textSecondary: "#475569",
  onAccent: "#FFFFFF",
  background: "#F4F6F8",
  backgroundElement: "#FFFFFF",
  backgroundElevated: "#EEF1F5",
  emerald: "#065F46",
  secondary: "#6D28D9",
  secondaryGlow: "rgba(109, 40, 217, 0.12)",
  accent: "#B45309",
  borderSubtle: "rgba(15, 23, 42, 0.10)",
  danger: "#DC2626",
  dangerGlow: "rgba(220, 38, 38, 0.11)",
  warning: "#B45309",
  warningGlow: "rgba(180, 83, 9, 0.12)",
  success: "#047857",
  overlay: "rgba(15, 23, 42, 0.50)",
  handleBar: "rgba(15, 23, 42, 0.18)",
  toastSuccessBg: "#ECFDF5",
  toastErrorBg: "#FFF1F2",
  toastWarningBg: "#FFFBEB",
  toastInfoBg: "#F8FAFC",
};

/**
 * Combina el modo de pantalla resuelto (`dark` | `light`) con la paleta de acento elegida.
 * En modo oscuro utiliza superficies negras/gris carbón neutras (sin tinte verdoso).
 */
export function buildThemeColors(
  mode: ResolvedThemeMode,
  accent: AccentId = "emerald",
): ThemeColors {
  const base = mode === "dark" ? DARK_BASE : LIGHT_BASE;
  const accentVariant = (ACCENT_PALETTES[accent] ?? ACCENT_PALETTES.emerald)[
    mode
  ];
  return {
    ...base,
    ...accentVariant,
  };
}

export const Colors: Record<ResolvedThemeMode, ThemeColors> = {
  dark: buildThemeColors("dark", "emerald"),
  light: buildThemeColors("light", "emerald"),
};

export type ThemeColor = keyof ThemeColors;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
