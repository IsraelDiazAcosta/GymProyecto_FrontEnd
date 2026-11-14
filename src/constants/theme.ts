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

const originalDarkTheme = {
  text: "#FFFFFF",                     // Letras siempre en blanco
  textSecondary: "#9CA3AF",            // Gris neutro limpio para subtítulos
  onPrimary: "#FFFFFF",                // Texto siempre blanco sobre botones y chips activos
  onAccent: "#FFFFFF",
  background: "#080C0A",               // Obsidiana profunda con matiz bosque (original)
  backgroundElement: "#111815",        // Carbón esmeralda para tarjetas principales (original)
  backgroundElevated: "#18221E",       // Superficie elevada para inputs y modales (original)
  backgroundSelected: "#1D332A",       // Superficie activa con tinte esmeralda (original)
  emerald: Palette.emerald,            // #2C5A4B reservado para detalles menores
  secondary: Palette.lilac,            // #947DB5 reservado para detalles menores
  secondaryGlow: Palette.lilacSoft,
  primary: "#10B981",                  // Verde Esmeralda Neón original (Principal)
  primaryLight: "#34D399",             // Menta luminoso para detalles y bordes activos
  primaryDark: "#059669",              // Esmeralda intenso
  primaryGlow: "rgba(16, 185, 129, 0.16)",
  accent: Palette.volt,                // #E6FF3A reservado para pequeños acentos
  border: "rgba(52, 211, 153, 0.16)",
  borderSubtle: "rgba(255, 255, 255, 0.07)",
  danger: Palette.danger,
  dangerGlow: Palette.dangerGlow,
  warning: Palette.warning,
  warningGlow: Palette.warningGlow,
  success: "#10B981",
  overlay: Palette.overlay,
} as const;

export const Colors = {
  light: originalDarkTheme,
  dark: originalDarkTheme,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
