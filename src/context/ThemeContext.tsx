import * as SystemUI from "expo-system-ui";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Appearance,
  AppState,
  Platform,
  useColorScheme as useRNColorScheme,
} from "react-native";

import {
  AccentId,
  buildThemeColors,
  Colors,
  ResolvedThemeMode,
  ThemeColors,
  ThemeMode,
} from "@/constants/theme";
import { DEFAULT_PREFERENCES, preferencesStorage } from "@/services/preferences";

export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  systemScheme: ResolvedThemeMode;
  accent: AccentId;
  colors: ThemeColors;
  isHydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentId) => void;
  resetAppearance: () => void;
}

const DEFAULT_SYSTEM_SCHEME: ResolvedThemeMode = "dark";

const fallbackContextValue: ThemeContextValue = {
  mode: DEFAULT_PREFERENCES.themeMode,
  resolvedMode: "dark",
  systemScheme: DEFAULT_SYSTEM_SCHEME,
  accent: DEFAULT_PREFERENCES.accentId,
  colors: Colors.dark,
  isHydrated: false,
  setMode: () => undefined,
  setAccent: () => undefined,
  resetAppearance: () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(fallbackContextValue);

function normalizeScheme(scheme?: string | null): ResolvedThemeMode {
  return scheme === "light" ? "light" : "dark";
}

function applyNativeColorScheme(mode: ThemeMode): void {
  if (Platform.OS === "web") return;
  if (typeof Appearance.setColorScheme !== "function") return;
  try {
    Appearance.setColorScheme(mode === "system" ? "auto" : mode);
  } catch {
    // Silently ignore if the platform or native version does not support programmatic override
  }
}

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(
    DEFAULT_PREFERENCES.themeMode,
  );
  const [accent, setAccentState] = useState<AccentId>(
    DEFAULT_PREFERENCES.accentId,
  );
  const [nativeSystemScheme, setNativeSystemScheme] =
    useState<ResolvedThemeMode>(() =>
      normalizeScheme(Appearance.getColorScheme()),
    );
  const [isHydrated, setIsHydrated] = useState(false);

  const modeRef = useRef<ThemeMode>(mode);
  modeRef.current = mode;

  const webScheme = useRNColorScheme();

  useEffect(() => {
    let mounted = true;

    preferencesStorage
      .load()
      .then((loaded) => {
        if (!mounted) return;
        modeRef.current = loaded.themeMode;
        setModeState(loaded.themeMode);
        setAccentState(loaded.accentId);
        applyNativeColorScheme(loaded.themeMode);
        if (loaded.themeMode === "system" && Platform.OS !== "web") {
          setNativeSystemScheme(normalizeScheme(Appearance.getColorScheme()));
        }
        setIsHydrated(true);
      })
      .catch(() => {
        if (!mounted) return;
        setIsHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const appearanceSub = Appearance.addChangeListener(({ colorScheme }) => {
      if (modeRef.current === "system") {
        setNativeSystemScheme(normalizeScheme(colorScheme));
      }
    });

    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && modeRef.current === "system") {
        setNativeSystemScheme(normalizeScheme(Appearance.getColorScheme()));
      }
    });

    return () => {
      appearanceSub.remove();
      appStateSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    applyNativeColorScheme(mode);
    if (mode === "system" && Platform.OS !== "web") {
      setNativeSystemScheme(normalizeScheme(Appearance.getColorScheme()));
    }
  }, [mode, isHydrated]);

  const systemScheme: ResolvedThemeMode =
    Platform.OS === "web" ? normalizeScheme(webScheme) : nativeSystemScheme;

  const resolvedMode: ResolvedThemeMode =
    mode === "system" ? systemScheme : mode;

  const colors = useMemo(
    () => buildThemeColors(resolvedMode, accent),
    [resolvedMode, accent],
  );

  useEffect(() => {
    if (Platform.OS === "web") return;
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
  }, [colors.background]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    modeRef.current = nextMode;
    setModeState(nextMode);
    preferencesStorage.save({ themeMode: nextMode }).catch(() => undefined);
  }, []);

  const setAccent = useCallback((nextAccent: AccentId) => {
    setAccentState(nextAccent);
    preferencesStorage.save({ accentId: nextAccent }).catch(() => undefined);
  }, []);

  const resetAppearance = useCallback(() => {
    modeRef.current = DEFAULT_PREFERENCES.themeMode;
    setModeState(DEFAULT_PREFERENCES.themeMode);
    setAccentState(DEFAULT_PREFERENCES.accentId);
    preferencesStorage.resetAppearance().catch(() => undefined);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      systemScheme,
      accent,
      colors,
      isHydrated,
      setMode,
      setAccent,
      resetAppearance,
    }),
    [
      mode,
      resolvedMode,
      systemScheme,
      accent,
      colors,
      isHydrated,
      setMode,
      setAccent,
      resetAppearance,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
