import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAppTheme } from "@/context/ThemeContext";

type AuthMode = "login" | "register";

/**
 * Login and basic registration form styled with "Apex Emerald Gym",
 * switchable tabs, vector icons, and stable keyboard focus handling.
 */
export function LoginForm() {
  const { login, register, error, isAuthenticating, clearError } = useAuth();
  const { colors, resolvedMode } = useAppTheme();
  const { t } = useLanguage();

  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSwitchMode = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async () => {
    setLocalError(null);
    clearError();

    if (mode === "login") {
      if (!email.trim()) {
        setLocalError(t("auth.emailRequired"));
        return;
      }

      if (!password) {
        setLocalError(t("auth.passwordRequired"));
        return;
      }

      await login(email.trim(), password);
      return;
    }

    if (!username.trim()) {
      setLocalError(t("auth.usernameRequired"));
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setLocalError(t("auth.emailInvalid"));
      return;
    }

    if (password.length < 6) {
      setLocalError(t("auth.passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t("auth.passwordsMismatch"));
      return;
    }

    await register({
      username: username.trim(),
      email: cleanEmail.toLowerCase(),
      password,
      password_confirm: confirmPassword,
    });
  };

  const displayError = localError || error;

  return (
    <View
      collapsable={false}
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.border,
          shadowOpacity: resolvedMode === "dark" ? 0.18 : 0.08,
        },
      ]}
    >
      {/* Brand header with vector emblem */}
      <View style={styles.brandHeader}>
        <View
          style={[
            styles.logoBadge,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <GymIcon name="dumbbell" size={28} color={colors.primary} />
        </View>
        <View style={[styles.statusPill, { backgroundColor: colors.primaryGlow }]}>
          <GymIcon name="zap" size={13} color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.primary }]}>
            {t("auth.apexPill")}
          </Text>
        </View>
      </View>

      {/* Login / Register tabs */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        {(
          [
            { key: "login", label: t("auth.tabLogin") },
            { key: "register", label: t("auth.tabRegister") },
          ] as const
        ).map((tab) => {
          const active = mode === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleSwitchMode(tab.key)}
              disabled={isAuthenticating}
              style={[
                styles.tabBtn,
                active && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: active ? colors.onPrimary : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {mode === "login" ? t("auth.welcomeTitle") : t("auth.registerTitle")}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {mode === "login"
          ? t("auth.welcomeSubtitle")
          : t("auth.registerSubtitle")}
      </Text>

      {displayError ? (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor: colors.dangerGlow,
              borderColor: colors.danger + "55",
            },
          ]}
        >
          <GymIcon name="alert-triangle" size={18} color={colors.danger} />
          <Text style={[styles.errorBannerText, { color: colors.danger }]}>
            {displayError}
          </Text>
        </View>
      ) : null}

      {mode === "register" && (
        <AppInput
          label={t("auth.usernameLabel")}
          placeholder={t("auth.usernamePlaceholder")}
          autoCapitalize="words"
          autoCorrect={false}
          leftIcon="user"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            if (localError) setLocalError(null);
            if (error) clearError();
          }}
        />
      )}

      <AppInput
        label={
          mode === "login" ? t("auth.emailOrUserLabel") : t("auth.emailLabel")
        }
        placeholder={
          mode === "login"
            ? t("auth.emailOrUserPlaceholder")
            : t("auth.emailPlaceholder")
        }
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        leftIcon="mail"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (localError) setLocalError(null);
          if (error) clearError();
        }}
      />

      <AppInput
        label={t("auth.passwordLabel")}
        placeholder={
          mode === "login" ? "••••••••" : t("auth.passwordMinPlaceholder")
        }
        secureTextEntry
        autoCapitalize="none"
        leftIcon="lock"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (localError) setLocalError(null);
          if (error) clearError();
        }}
        onSubmitEditing={mode === "login" ? handleSubmit : undefined}
      />

      {mode === "register" && (
        <AppInput
          label={t("auth.confirmPasswordLabel")}
          placeholder={t("auth.confirmPasswordPlaceholder")}
          secureTextEntry
          autoCapitalize="none"
          leftIcon="lock"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (localError) setLocalError(null);
            if (error) clearError();
          }}
          onSubmitEditing={handleSubmit}
        />
      )}

      <AppButton
        title={mode === "login" ? t("auth.loginBtn") : t("auth.registerBtn")}
        icon={mode === "login" ? "chevron-right" : "check"}
        onPress={handleSubmit}
        loading={isAuthenticating}
        style={styles.submitButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 4,
    gap: 6,
    marginBottom: Spacing.three,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "800",
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.four,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: Spacing.three,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  submitButton: {
    marginTop: Spacing.two,
  },
});
