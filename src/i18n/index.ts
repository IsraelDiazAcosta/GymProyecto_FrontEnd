import { ACCENT_PALETTES, AccentId } from "@/constants/theme";
import { en } from "./en";
import { es, TranslationDictionary, TranslationKey } from "./es";
import { LanguageMode, ResolvedLanguage, TranslationParams } from "./types";

export type {
  LanguageMode,
  ResolvedLanguage,
  TranslationDictionary,
  TranslationKey,
  TranslationParams,
};

export const DICTIONARIES: Record<ResolvedLanguage, TranslationDictionary> = {
  es,
  en,
};

export const LOCALE_MAP: Record<ResolvedLanguage, string> = {
  es: "es-ES",
  en: "en-US",
};

export const WEEK_DAYS_BY_LANG: Record<ResolvedLanguage, readonly string[]> = {
  es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export const MONTHS_SHORT_BY_LANG: Record<
  ResolvedLanguage,
  readonly string[]
> = {
  es: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

export function detectSystemLanguage(): ResolvedLanguage {
  try {
    const resolvedLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (
      typeof resolvedLocale === "string" &&
      resolvedLocale.toLowerCase().startsWith("en")
    ) {
      return "en";
    }
  } catch {
    // Safe fallback if Intl is not available
  }
  return "es";
}

export function translate(
  lang: ResolvedLanguage,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const dict = DICTIONARIES[lang] ?? DICTIONARIES.es;
  let template = dict[key] ?? DICTIONARIES.es[key] ?? String(key);
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      template = template.replace(
        new RegExp(`\\{\\{${paramKey}\\}\\}`, "g"),
        String(paramValue),
      );
    }
  }
  return template;
}

export function getExperienceLevelLabel(
  lang: ResolvedLanguage,
  value?: string | null,
): string {
  switch (value) {
    case "beginner":
      return translate(lang, "options.experience.beginner");
    case "intermediate":
      return translate(lang, "options.experience.intermediate");
    case "advanced":
      return translate(lang, "options.experience.advanced");
    default:
      return value || translate(lang, "options.experience.beginner");
  }
}

export function getTrainingGoalLabel(
  lang: ResolvedLanguage,
  value?: string | null,
): string {
  switch (value) {
    case "hypertrophy":
      return translate(lang, "options.goal.hypertrophy");
    case "strength":
      return translate(lang, "options.goal.strength");
    case "weight_loss":
      return translate(lang, "options.goal.weight_loss");
    case "endurance":
      return translate(lang, "options.goal.endurance");
    case "general_fitness":
      return translate(lang, "options.goal.general_fitness");
    default:
      return value || translate(lang, "options.goal.hypertrophy");
  }
}

export function getEquipmentTypeLabel(
  lang: ResolvedLanguage,
  value?: string | null,
  fallback?: string | null,
): string {
  switch (value) {
    case "plate_loaded":
      return translate(lang, "options.equipment.plate_loaded");
    case "pin_selected":
      return translate(lang, "options.equipment.pin_selected");
    case "cable":
      return translate(lang, "options.equipment.cable");
    case "smith":
      return translate(lang, "options.equipment.smith");
    case "free_weight":
      return translate(lang, "options.equipment.free_weight");
    case "bodyweight":
      return translate(lang, "options.equipment.bodyweight");
    case "cardio":
      return translate(lang, "options.equipment.cardio");
    case "accessory":
      return translate(lang, "options.equipment.accessory");
    default:
      return fallback || value || translate(lang, "common.machineFallback");
  }
}

export function getMuscleFocusLabel(
  lang: ResolvedLanguage,
  value?: string | null,
): string {
  const normalized = (value || "").toLowerCase().trim();
  switch (normalized) {
    case "pecho":
      return translate(lang, "options.focus.pecho");
    case "espalda":
      return translate(lang, "options.focus.espalda");
    case "pierna":
      return translate(lang, "options.focus.pierna");
    case "hombro":
      return translate(lang, "options.focus.hombro");
    case "brazo":
      return translate(lang, "options.focus.brazo");
    case "core":
      return translate(lang, "options.focus.core");
    case "fullbody":
      return translate(lang, "options.focus.fullbody");
    default:
      return value || translate(lang, "options.focus.fullbody");
  }
}

export function getAccentMeta(
  lang: ResolvedLanguage,
  accentId: AccentId,
): { name: string; description: string } {
  const fallback = ACCENT_PALETTES[accentId] ?? ACCENT_PALETTES.emerald;
  switch (accentId) {
    case "emerald":
      return {
        name: translate(lang, "settings.accent.emerald.name"),
        description: translate(lang, "settings.accent.emerald.desc"),
      };
    case "ocean":
      return {
        name: translate(lang, "settings.accent.ocean.name"),
        description: translate(lang, "settings.accent.ocean.desc"),
      };
    case "amber":
      return {
        name: translate(lang, "settings.accent.amber.name"),
        description: translate(lang, "settings.accent.amber.desc"),
      };
    case "violet":
      return {
        name: translate(lang, "settings.accent.violet.name"),
        description: translate(lang, "settings.accent.violet.desc"),
      };
    case "crimson":
      return {
        name: translate(lang, "settings.accent.crimson.name"),
        description: translate(lang, "settings.accent.crimson.desc"),
      };
    default:
      return { name: fallback.name, description: fallback.description };
  }
}
