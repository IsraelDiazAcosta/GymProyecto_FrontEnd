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
import { useAuth } from "@/context/AuthContext";
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
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
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
  const accentRef = useRef<AccentId>(accent);
  accentRef.current = accent;

  const webScheme = useRNColorScheme();

  useEffect(() => {
    if (isAuthLoading) return;
    let mounted = true;

    if (!isAuthenticated) {
      modeRef.current = DEFAULT_PREFERENCES.themeMode;
      accentRef.current = DEFAULT_PREFERENCES.accentId;
      setModeState(DEFAULT_PREFERENCES.themeMode);
      setAccentState(DEFAULT_PREFERENCES.accentId);
      applyNativeColorScheme(DEFAULT_PREFERENCES.themeMode);
      setIsHydrated(true);
      return () => {
        mounted = false;
      };
    }

    preferencesStorage
      .load()
      .then((loaded) => {
        if (!mounted) return;
        modeRef.current = loaded.themeMode;
        accentRef.current = loaded.accentId;
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
  }, [isAuthLoading, isAuthenticated, user?.id]);

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

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      const prevMode = modeRef.current;
      modeRef.current = nextMode;
      setModeState(nextMode);
      if (!isAuthenticated) return;
      preferencesStorage.save({ themeMode: nextMode }).catch((err) => {
        console.error("Failed to save theme mode preference", err);
        modeRef.current = prevMode;
        setModeState(prevMode);
      });
    },
    [isAuthenticated],
  );

  const setAccent = useCallback(
    (nextAccent: AccentId) => {
      const prevAccent = accentRef.current;
      accentRef.current = nextAccent;
      setAccentState(nextAccent);
      if (!isAuthenticated) return;
      preferencesStorage.save({ accentId: nextAccent }).catch((err) => {
        console.error("Failed to save accent color preference", err);
        accentRef.current = prevAccent;
        setAccentState(prevAccent);
      });
    },
    [isAuthenticated],
  );

  const resetAppearance = useCallback(() => {
    const prevMode = modeRef.current;
    const prevAccent = accentRef.current;
    modeRef.current = DEFAULT_PREFERENCES.themeMode;
    accentRef.current = DEFAULT_PREFERENCES.accentId;
    setModeState(DEFAULT_PREFERENCES.themeMode);
    setAccentState(DEFAULT_PREFERENCES.accentId);
    if (!isAuthenticated) return;
    preferencesStorage.resetAppearance().catch((err) => {
      console.error("Failed to reset appearance preferences", err);
      modeRef.current = prevMode;
      accentRef.current = prevAccent;
      setModeState(prevMode);
      setAccentState(prevAccent);
    });
  }, [isAuthenticated]);

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
