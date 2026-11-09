import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  useColorScheme,
  View,
} from "react-native";

import { Colors, Radius, Spacing } from "@/constants/theme";
import { GymIcon, IconName } from "./GymIcon";

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: IconName;
}

/**
 * Campo de texto reutilizable con estética "Apex Emerald Gym".
 * Mantiene una jerarquía nativa estable (collapsable={false} y sin re-renderizado en onFocus)
 * para evitar que el teclado se cierre automáticamente en Android/iOS.
 */
export function AppInput({
  label,
  error,
  style,
  leftIcon,
  secureTextEntry,
  ...rest
}: AppInputProps) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [hidePassword, setHidePassword] = useState(Boolean(secureTextEntry));

  return (
    <View style={styles.container} collapsable={false}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <View
        collapsable={false}
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconWrap} pointerEvents="none">
            <GymIcon name={leftIcon} size={18} color={colors.primary} />
          </View>
        )}
        <TextInput
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry ? hidePassword : false}
          style={[
            styles.input,
            {
              color: colors.text,
            },
            style,
          ]}
          {...rest}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidePassword((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={10}
          >
            <GymIcon
              name={hidePassword ? "eye" : "eye-off"}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <GymIcon name="alert-triangle" size={13} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputWrapper: {
    minHeight: 50,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  leftIconWrap: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  eyeButton: {
    marginLeft: 8,
    padding: 4,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
