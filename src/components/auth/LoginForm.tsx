import React, { useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

/**
 * Formulario de acceso con diseño deportivo de lujo "Apex Emerald Gym",
 * iconos vectoriales integrados y manejo de foco de teclado estable.
 */
export function LoginForm() {
  const { login, error, isAuthenticating, clearError } = useAuth();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError("Por favor ingresa tu correo o nombre de usuario.");
      return;
    }

    if (!password) {
      setLocalError("Por favor ingresa tu contraseña.");
      return;
    }

    await login(email.trim(), password);
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
        },
      ]}
    >
      {/* Cabecera de marca con emblema vectorial */}
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
            APEX PERFORMANCE
          </Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        Bienvenido al Club
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Inicia sesión para gestionar tus rutinas, catálogo biomecánico y récords
        de fuerza (1RM).
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

      <AppInput
        label="Correo o Usuario"
        placeholder="ej. atleta@gym.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        leftIcon="mail"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (localError) setLocalError(null);
        }}
      />

      <AppInput
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        autoCapitalize="none"
        leftIcon="lock"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (localError) setLocalError(null);
        }}
        onSubmitEditing={handleSubmit}
      />

      <AppButton
        title="Entrar al Gimnasio"
        icon="chevron-right"
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
