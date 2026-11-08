import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface AnimatedToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const AnimatedToast: React.FC<AnimatedToastProps> = ({
  toast,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (toast) {
      // Entrada animada con resorte y fade
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 90,
          friction: 8,
        }),
      ]).start();

      // Desvanecimiento automático después de 3.2 segundos
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3400);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-120);
      opacity.setValue(0);
      scale.setValue(0.92);
    }
  }, [toast]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
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
      onDismiss();
    });
  };

  if (!toast) return null;

  const getTheme = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: "🚀",
          accentColor: "#10b981",
          bgColor: "#064e3b",
          borderColor: "#059669",
          textColor: "#ecfdf5",
          subColor: "#a7f3d0",
        };
      case "error":
        return {
          icon: "⚠️",
          accentColor: "#f43f5e",
          bgColor: "#881337",
          borderColor: "#e11d48",
          textColor: "#fff1f2",
          subColor: "#fecdd3",
        };
      case "warning":
        return {
          icon: "⚡",
          accentColor: "#f59e0b",
          bgColor: "#78350f",
          borderColor: "#d97706",
          textColor: "#fef3c7",
          subColor: "#fde68a",
        };
      case "info":
      default:
        return {
          icon: "💡",
          accentColor: "#3b82f6",
          bgColor: "#1e3a8a",
          borderColor: "#2563eb",
          textColor: "#eff6ff",
          subColor: "#bfdbfe",
        };
    }
  };

  const theme = getTheme();

  return (
    <Animated.View
      style={[
        toastStyles.container,
        {
          top: Math.max(insets.top, 16) + 4,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[
          toastStyles.card,
          {
            backgroundColor: theme.bgColor,
            borderColor: theme.borderColor,
          },
        ]}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        <View style={toastStyles.leftBar}>
          <Text style={toastStyles.icon}>{theme.icon}</Text>
        </View>

        <View style={toastStyles.content}>
          <Text style={[toastStyles.title, { color: theme.textColor }]}>
            {toast.title}
          </Text>
          {Boolean(toast.message) && (
            <Text style={[toastStyles.message, { color: theme.subColor }]}>
              {toast.message}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={handleDismiss} style={toastStyles.closeBtn}>
          <Text style={[toastStyles.closeText, { color: theme.subColor }]}>
            ✕
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const toastStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: "center",
  },
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  leftBar: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 18,
    fontWeight: "500",
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
  closeText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
