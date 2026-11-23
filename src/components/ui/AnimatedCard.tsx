import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * Card container with touch micro-interaction support.
 * When used as a form container (without `onPress`), it renders a stable `View`
 * with `collapsable={false}` so nested `TextInput` fields never lose
 * keyboard focus on Android/iOS.
 */
export function AnimatedCard({
  children,
  style,
  onPress,
  disabled = false,
}: AnimatedCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress || disabled) return;
    Animated.spring(scale, {
      toValue: 0.985,
      damping: 15,
      stiffness: 250,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress || disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      damping: 15,
      stiffness: 250,
      useNativeDriver: true,
    }).start();
  };

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={style}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View collapsable={false} style={style}>
      {children}
    </View>
  );
}
