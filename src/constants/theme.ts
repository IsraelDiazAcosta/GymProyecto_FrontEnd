/**
 * Sistema de Diseño y Paleta de Colores "Apex Emerald Gym"
 * Diseñado específicamente para una experiencia UX/UI deportiva de lujo en modo Dark y Light.
 */

import "@/global.css";
import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#0B1712",               // Verde bosque ultra oscuro para lectura nítida
    textSecondary: "#52665D",      // Gris salvia atlético para subtítulos
    background: "#F2F6F4",         // Alabastro menta suave (fondo general)
    backgroundElement: "#FFFFFF",  // Blanco puro para tarjetas y superficies
    backgroundElevated: "#E6EFEA", // Superficie elevada / inputs / chips inactivos
    backgroundSelected: "#D0E8DC", // Selección suave esmeralda
    primary: "#059669",            // Esmeralda atlético principal
    primaryLight: "#10B981",       // Esmeralda brillante
    primaryDark: "#047857",        // Esmeralda profundo (hover/active)
    primaryGlow: "rgba(5, 150, 105, 0.12)",
    accent: "#65A30D",             // Verde Lima Volt para récords (1RM)
    border: "rgba(5, 150, 105, 0.16)",
    borderSubtle: "rgba(11, 23, 18, 0.08)",
    danger: "#E11D48",
    dangerGlow: "rgba(225, 29, 72, 0.12)",
    warning: "#D97706",
    success: "#059669",
    overlay: "rgba(9, 13, 11, 0.55)",
  },
  dark: {
    text: "#F3F8F5",               // Blanco alabastro fresco
    textSecondary: "#8CA399",      // Gris salvia metálico
    background: "#080C0A",         // Obsidiana profunda con matiz bosque
    backgroundElement: "#111815",  // Carbón esmeralda para tarjetas principales
    backgroundElevated: "#18221E", // Superficie elevada para inputs y modales
    backgroundSelected: "#1D332A", // Superficie activa con tinte esmeralda
    primary: "#10B981",            // Verde Esmeralda Neón (Principal)
    primaryLight: "#34D399",       // Menta luminoso para detalles y bordes activos
    primaryDark: "#059669",        // Esmeralda intenso
    primaryGlow: "rgba(16, 185, 129, 0.16)",
    accent: "#A3E635",             // Lima Volt energético para 1RM y progreso
    border: "rgba(52, 211, 153, 0.16)",
    borderSubtle: "rgba(255, 255, 255, 0.07)",
    danger: "#F43F5E",
    dangerGlow: "rgba(244, 63, 94, 0.16)",
    warning: "#F59E0B",
    success: "#10B981",
    overlay: "rgba(0, 0, 0, 0.75)",
  },
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
