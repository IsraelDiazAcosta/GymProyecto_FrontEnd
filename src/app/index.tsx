import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoginForm } from "@/components/auth/LoginForm";
import { GymDashboard } from "@/components/dashboard/GymDashboard";
import { GymIcon } from "@/components/ui/GymIcon";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function HomeScreen() {
  const { user, isLoading } = useAuth();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.centerContainer}>
          <View
            style={[
              styles.loaderBadge,
              {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.border,
              },
            ]}
          >
            <GymIcon name="dumbbell" size={32} color={colors.primary} />
          </View>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Sincronizando plataforma deportiva...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (user) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <GymDashboard />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS === "ios"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={[styles.kicker, { color: colors.primary }]}>
              SISTEMA INTELIGENTE DE ENTRENAMIENTO
            </Text>
            <Text style={[styles.brandTitle, { color: colors.text }]}>
              GYM PROYECTO
            </Text>
          </View>

          <LoginForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  loaderBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: Spacing.one,
  },
  headerBlock: {
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
});
