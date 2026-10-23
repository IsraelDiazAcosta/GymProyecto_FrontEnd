import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL, DEV_PC_IP } from "@/services/api";
import React, { useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

export const LoginForm: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { login, isAuthenticating, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email Required";
    } else if (!email.includes("@")) {
      errors.email = "Please, enter a valid email";
    }

    if (!password) {
      errors.password = "Password required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;
    await login(email, password);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Good to see you again. Please, enter your credentials to access at
          your rutine.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      <AppInput
        label="Enter your email"
        placeholder="example@gym.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (formErrors.email)
            setFormErrors((prev) => ({ ...prev, email: undefined }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={formErrors.email}
      />

      <AppInput
        label="Enter your password"
        placeholder="••••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (formErrors.password)
            setFormErrors((prev) => ({ ...prev, password: undefined }));
        }}
        isPassword
        error={formErrors.password}
      />

      <AppButton
        title="START!"
        onPress={handleLogin}
        loading={isAuthenticating}
        style={styles.submitButton}
      />

      <View
        style={[styles.infoBox, { backgroundColor: colors.backgroundElement }]}
      >
        <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>
          📡 Conexión API Backend:
        </Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
          {API_BASE_URL}
        </Text>
        <Text style={[styles.infoSubtext, { color: colors.textSecondary }]}>
          IP local PC: {DEV_PC_IP} (Ambos dispositivos deben estar en la misma
          red WiFi).
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    padding: Spacing.three,
  },
  header: {
    marginBottom: Spacing.four,
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: Spacing.one,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: "#fff1f0",
    borderColor: "#ffccc7",
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.two,
    marginBottom: Spacing.three,
  },
  errorBannerText: {
    color: "#cf1322",
    fontSize: 13,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: Spacing.two,
  },
  infoBox: {
    marginTop: Spacing.four,
    padding: Spacing.two,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  infoText: {
    fontSize: 12,
    fontFamily: "monospace",
    marginVertical: 2,
    fontWeight: "600",
  },
  infoSubtext: {
    fontSize: 11,
  },
});
