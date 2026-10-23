import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Spacing } from '@/constants/theme';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled && variant === 'primary') return '#ff9e59';
    switch (variant) {
      case 'primary':
        return '#ff6b00'; // Naranja energético de gimnasio
      case 'secondary':
        return '#4b5563';
      case 'danger':
        return '#dc2626';
      case 'outline':
        return 'transparent';
      default:
        return '#ff6b00';
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return '#ff6b00';
    return '#ffffff';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineBorder,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginVertical: Spacing.one,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: '#ff6b00',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

