import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  isPassword?: boolean;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  isPassword = false,
  style,
  ...props
}) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: error ? '#ff4d4f' : isFocused ? '#ff6b00' : 'transparent',
          },
        ]}>
        <TextInput
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}>
            <Text style={[styles.eyeText, { color: colors.textSecondary }]}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeButton: {
    paddingLeft: Spacing.two,
  },
  eyeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginTop: Spacing.one,
  },
});

