import { LoginForm } from "@/components/auth/LoginForm";
import { GymDashboard } from "@/components/dashboard/GymDashboard";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { user, isLoading } = useAuth();

  // 1. Mientras verifica si hay token/sesión guardada
  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#ff6b00" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando sesión...
        </Text>
      </View>
    );
  }

  // 2. Renderizado según estado de autenticación
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        {user ? (
          // Si el usuario está logueado -> Muestra el Dashboard completo
          <GymDashboard />
        ) : (
          // Si no está logueado -> Muestra el formulario de inicio de sesión
          <View style={styles.loginContainer}>
            <View style={styles.brandingHeader}></View>
            <LoginForm />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.two,
    fontSize: 14,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },
  brandingHeader: {
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  brandEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    marginTop: 2,
    textAlign: "center",
  },
});
