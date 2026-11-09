import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

import { Colors, Radius } from "@/constants/theme";
import { GymIcon, IconName } from "./GymIcon";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: IconName;
}

/**
 * Botón reutilizable con estética "Apex Emerald Gym", soporte de iconos vectoriales
 * y micro-animación de rebote elástico al presionar.
 */
export function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  icon,
}: AppButtonProps) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const isDisabled = disabled || loading;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primaryLight,
          borderWidth: 1,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: scheme === "dark" ? 0.35 : 0.22,
          shadowRadius: 12,
          elevation: 5,
        };
      case "secondary":
        return {
          backgroundColor: colors.backgroundSelected,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case "danger":
        return {
          backgroundColor: colors.danger,
          borderColor: colors.danger,
          borderWidth: 1,
          shadowColor: colors.danger,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 4,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case "primary":
      case "danger":
        return "#FFFFFF";
      case "secondary":
        return colors.primary;
      case "outline":
        return colors.text;
    }
  };

  const contentColor = getTextColor();

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          getVariantStyle(),
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={contentColor} size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon && <GymIcon name={icon} size={18} color={contentColor} />}
            <Text style={[styles.text, { color: contentColor }]}>{title}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
