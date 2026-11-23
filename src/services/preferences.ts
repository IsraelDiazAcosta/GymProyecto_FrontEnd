import { api, UserSettingsUpdatePayload } from "@/services/api";
import { ACCENT_PALETTES, AccentId, ThemeMode } from "@/constants/theme";
import { LanguageMode } from "@/i18n/types";

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

function mapServerSettings(raw: unknown): AppPreferences {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PREFERENCES };
  }
  const obj = raw as Record<string, unknown>;
  return {
    version: 1,
    themeMode: isValidThemeMode(obj.theme_mode)
      ? obj.theme_mode
      : DEFAULT_PREFERENCES.themeMode,
    accentId: isValidAccentId(obj.accent_color)
      ? obj.accent_color
      : DEFAULT_PREFERENCES.accentId,
    language: isValidLanguageMode(obj.language)
      ? obj.language
      : DEFAULT_PREFERENCES.language,
  };
}

let inflightLoad: Promise<AppPreferences> | null = null;

/**
 * Manages persistent user appearance and language settings via the backend API.
 */
export const preferencesStorage = {
  async load(): Promise<AppPreferences> {
    if (!inflightLoad) {
      inflightLoad = api
        .getUserSettings()
        .then((res) => mapServerSettings(res))
        .catch((err) => {
          console.error("Error loading user settings from server", err);
          return { ...DEFAULT_PREFERENCES };
        })
        .finally(() => {
          inflightLoad = null;
        });
    }
    return inflightLoad;
  },

  async save(
    partial: Partial<Omit<AppPreferences, "version">>,
  ): Promise<AppPreferences> {
    const payload: UserSettingsUpdatePayload = {};
    if (isValidThemeMode(partial.themeMode)) {
      payload.theme_mode = partial.themeMode;
    }
    if (isValidAccentId(partial.accentId)) {
      payload.accent_color = partial.accentId;
    }
    if (isValidLanguageMode(partial.language)) {
      payload.language = partial.language;
    }

    const updated = await api.updateUserSettings(payload);
    return mapServerSettings(updated);
  },

  async resetAppearance(): Promise<AppPreferences> {
    const updated = await api.updateUserSettings({
      theme_mode: DEFAULT_PREFERENCES.themeMode,
      accent_color: DEFAULT_PREFERENCES.accentId,
    });
    return mapServerSettings(updated);
  },
};
