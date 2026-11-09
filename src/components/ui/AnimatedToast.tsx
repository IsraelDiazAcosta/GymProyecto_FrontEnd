import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Colors, Radius } from "@/constants/theme";
import { GymIcon, IconName } from "./GymIcon";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastConfig {
  visible: boolean;
  type: ToastType;
  title: string;
  message: string;
}

interface AnimatedToastProps {
  toast: ToastConfig;
  onHide: () => void;
}

const TOAST_THEMES: Record<
  ToastType,
  {
    accent: string;
    bgDark: string;
    bgLight: string;
    icon: IconName;
  }
> = {
  success: {
    accent: "#10B981",
    bgDark: "#0D261D",
    bgLight: "#ECFDF5",
    icon: "check-circle",
  },
  error: {
    accent: "#F43F5E",
    bgDark: "#2A1219",
    bgLight: "#FFF1F2",
    icon: "x-circle",
  },
  warning: {
    accent: "#F59E0B",
    bgDark: "#291E0C",
    bgLight: "#FFFBEB",
    icon: "alert-triangle",
  },
  info: {
    accent: "#34D399",
    bgDark: "#10241E",
    bgLight: "#F0FDF4",
    icon: "sparkles",
  },
};

export function AnimatedToast({ toast, onHide }: AnimatedToastProps) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];

  const translateY = useRef(new Animated.Value(-130)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (toast.visible) {
      progress.setValue(1);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 75,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 85,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(progress, {
        toValue: 0,
        duration: 3800,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        dismissToast();
      }, 3800);

      return () => clearTimeout(timer);
    }
  }, [toast.visible, toast.title, toast.message]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -130,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!toast.visible) return null;

  const theme = TOAST_THEMES[toast.type];
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Pressable
        onPress={dismissToast}
        style={[
          styles.container,
          {
            backgroundColor: scheme === "dark" ? theme.bgDark : theme.bgLight,
            borderColor: theme.accent + "55",
          },
        ]}
      >
        <View style={styles.contentRow}>
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: theme.accent + "22",
                borderColor: theme.accent + "45",
              },
            ]}
          >
            <GymIcon name={theme.icon} size={20} color={theme.accent} />
          </View>

          <View style={styles.textColumn}>
            <Text style={[styles.title, { color: colors.text }]}>
              {toast.title}
            </Text>
            <Text
              style={[styles.message, { color: colors.textSecondary }]}
              numberOfLines={3}
            >
              {toast.message}
            </Text>
          </View>

          <Pressable
            onPress={dismissToast}
            style={styles.closeBtn}
            hitSlop={10}
          >
            <GymIcon name="x" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: theme.accent,
                width: progressWidth,
              },
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 52,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: 500,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 12,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  closeBtn: {
    padding: 4,
  },
  progressTrack: {
    height: 3,
    width: "100%",
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  progressBar: {
    height: "100%",
  },
});
