import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";

import HomeScreen from "@/app/index";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AppThemeProvider, useAppTheme } from "@/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { resolvedMode, colors } = useAppTheme();

  const navigationTheme = useMemo(() => {
    const base = resolvedMode === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.backgroundElement,
        text: colors.text,
        border: colors.borderSubtle,
        primary: colors.primary,
      },
    };
  }, [resolvedMode, colors]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={resolvedMode === "dark" ? "light" : "dark"} animated />
      <AnimatedSplashOverlay />
      <HomeScreen />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <LanguageProvider>
          <RootLayoutContent />
        </LanguageProvider>
      </AppThemeProvider>
    </AuthProvider>
  );
}
