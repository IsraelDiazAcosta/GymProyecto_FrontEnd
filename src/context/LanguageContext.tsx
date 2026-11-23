import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import {
  detectSystemLanguage,
  LanguageMode,
  LOCALE_MAP,
  ResolvedLanguage,
  translate,
  TranslationKey,
  TranslationParams,
} from "@/i18n";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_PREFERENCES, preferencesStorage } from "@/services/preferences";

export interface LanguageContextValue {
  languageMode: LanguageMode;
  language: ResolvedLanguage;
  systemLanguage: ResolvedLanguage;
  locale: string;
  isHydrated: boolean;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  setLanguageMode: (mode: LanguageMode) => void;
  resetLanguage: () => void;
}

const fallbackLanguageContext: LanguageContextValue = {
  languageMode: DEFAULT_PREFERENCES.language,
  language: "es",
  systemLanguage: "es",
  locale: LOCALE_MAP.es,
  isHydrated: false,
  t: (key, params) => translate("es", key, params),
  setLanguageMode: () => undefined,
  resetLanguage: () => undefined,
};

const LanguageContext = createContext<LanguageContextValue>(
  fallbackLanguageContext,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const [languageMode, setLanguageModeState] = useState<LanguageMode>(
    DEFAULT_PREFERENCES.language,
  );
  const [systemLanguage, setSystemLanguage] = useState<ResolvedLanguage>(() =>
    detectSystemLanguage(),
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const modeRef = useRef<LanguageMode>(languageMode);
  modeRef.current = languageMode;

  useEffect(() => {
    if (isAuthLoading) return;
    let mounted = true;

    if (!isAuthenticated) {
      modeRef.current = DEFAULT_PREFERENCES.language;
      setLanguageModeState(DEFAULT_PREFERENCES.language);
      setIsHydrated(true);
      return () => {
        mounted = false;
      };
    }

    preferencesStorage
      .load()
      .then((loaded) => {
        if (!mounted) return;
        modeRef.current = loaded.language;
        setLanguageModeState(loaded.language);
        if (loaded.language === "system") {
          setSystemLanguage(detectSystemLanguage());
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
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && modeRef.current === "system") {
        setSystemLanguage(detectSystemLanguage());
      }
    });
    return () => sub.remove();
  }, []);

  const language: ResolvedLanguage =
    languageMode === "system" ? systemLanguage : languageMode;

  const locale = LOCALE_MAP[language];

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      translate(language, key, params),
    [language],
  );

  const setLanguageMode = useCallback(
    (nextMode: LanguageMode) => {
      const prevMode = modeRef.current;
      modeRef.current = nextMode;
      if (nextMode === "system") {
        setSystemLanguage(detectSystemLanguage());
      }
      setLanguageModeState(nextMode);
      if (!isAuthenticated) return;
      preferencesStorage.save({ language: nextMode }).catch((err) => {
        console.error("Failed to save language preference", err);
        modeRef.current = prevMode;
        if (prevMode === "system") {
          setSystemLanguage(detectSystemLanguage());
        }
        setLanguageModeState(prevMode);
      });
    },
    [isAuthenticated],
  );

  const resetLanguage = useCallback(() => {
    const prevMode = modeRef.current;
    modeRef.current = DEFAULT_PREFERENCES.language;
    setLanguageModeState(DEFAULT_PREFERENCES.language);
    if (!isAuthenticated) return;
    preferencesStorage
      .save({ language: DEFAULT_PREFERENCES.language })
      .catch((err) => {
        console.error("Failed to reset language preference", err);
        modeRef.current = prevMode;
        if (prevMode === "system") {
          setSystemLanguage(detectSystemLanguage());
        }
        setLanguageModeState(prevMode);
      });
  }, [isAuthenticated]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      languageMode,
      language,
      systemLanguage,
      locale,
      isHydrated,
      t,
      setLanguageMode,
      resetLanguage,
    }),
    [
      languageMode,
      language,
      systemLanguage,
      locale,
      isHydrated,
      t,
      setLanguageMode,
      resetLanguage,
    ],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
