import AsyncStorage from "@react-native-async-storage/async-storage";

import { ACCENT_PALETTES, AccentId, ThemeMode } from "@/constants/theme";
import { LanguageMode } from "@/i18n/types";

const PREFERENCES_KEY = "@apex_gym_preferences";

export interface AppPreferences {
  version: 1;
  themeMode: ThemeMode;
  accentId: AccentId;
  language: LanguageMode;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  version: 1,
  themeMode: "dark",
  accentId: "emerald",
  language: "es",
};

export function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === "dark" || value === "light" || value === "system";
}

export function isValidAccentId(value: unknown): value is AccentId {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(ACCENT_PALETTES, value)
  );
}

export function isValidLanguageMode(value: unknown): value is LanguageMode {
  return value === "es" || value === "en" || value === "system";
}

function sanitizePreferences(raw: unknown): AppPreferences {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PREFERENCES };
  }
  const obj = raw as Record<string, unknown>;
  return {
    version: 1,
    themeMode: isValidThemeMode(obj.themeMode)
      ? obj.themeMode
      : DEFAULT_PREFERENCES.themeMode,
    accentId: isValidAccentId(obj.accentId)
      ? obj.accentId
      : DEFAULT_PREFERENCES.accentId,
    language: isValidLanguageMode(obj.language)
      ? obj.language
      : DEFAULT_PREFERENCES.language,
  };
}

export const preferencesStorage = {
  async load(): Promise<AppPreferences> {
    try {
      const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (!raw) {
        return { ...DEFAULT_PREFERENCES };
      }
      const parsed: unknown = JSON.parse(raw);
      return sanitizePreferences(parsed);
    } catch (e) {
      console.error("Error loading app preferences", e);
      return { ...DEFAULT_PREFERENCES };
    }
  },

  async save(
    partial: Partial<Omit<AppPreferences, "version">>,
  ): Promise<AppPreferences> {
    const current = await preferencesStorage.load();
    const next: AppPreferences = {
      version: 1,
      themeMode: isValidThemeMode(partial.themeMode)
        ? partial.themeMode
        : current.themeMode,
      accentId: isValidAccentId(partial.accentId)
        ? partial.accentId
        : current.accentId,
      language: isValidLanguageMode(partial.language)
        ? partial.language
        : current.language,
    };

    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Error saving app preferences", e);
    }
    return next;
  },

  async resetAppearance(): Promise<AppPreferences> {
    const current = await preferencesStorage.load();
    const next: AppPreferences = {
      version: 1,
      themeMode: DEFAULT_PREFERENCES.themeMode,
      accentId: DEFAULT_PREFERENCES.accentId,
      language: current.language,
    };
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Error resetting appearance preferences", e);
    }
    return next;
  },
};
