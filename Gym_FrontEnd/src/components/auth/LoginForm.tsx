import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { API_BASE_URL, DEV_PC_IP } from '@/services/api';
import { Colors, Spacing } from '@/constants/theme';

export const LoginForm: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { login, isAuthenticating, error, clearError } = useAuth();

  const [email, setEmail] = useState('admin@gym.com');
  const [password, setPassword] = useState('Admin123!');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!email.includes('@')) {
      errors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      errors.password = 'La contraseña es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;
    await login(email, password);
  };

  const fillAdmin = () => {
    setEmail('admin@gym.com');
    setPassword('Admin123!');
    setFormErrors({});
    clearError();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>¡Bienvenido de nuevo!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ingresa tus credenciales para acceder a tus rutinas y entrenamientos.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      ) : null}

      <AppInput
        label="Correo Electrónico"
        placeholder="ejemplo@gym.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={formErrors.email}
      />

      <AppInput
        label="Contraseña"
        placeholder="••••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
        }}
        isPassword
        error={formErrors.password}
      />

      <AppButton
        title="Iniciar Sesión"
        onPress={handleLogin}
        loading={isAuthenticating}
        style={styles.submitButton}
      />

      <View style={styles.quickFillContainer}>
        <Text style={[styles.quickFillLabel, { color: colors.textSecondary }]}>
          ¿Quieres probar rápido?
        </Text>
        <TouchableOpacity style={styles.quickFillButton} onPress={fillAdmin}>
          <Text style={styles.quickFillButtonText}>⚡ Autocompletar Admin</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.backgroundElement }]}>
        <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>
          📡 Conexión API Backend:
        </Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
          {API_BASE_URL}
        </Text>
        <Text style={[styles.infoSubtext, { color: colors.textSecondary }]}>
          IP local PC: {DEV_PC_IP} (Ambos dispositivos deben estar en la misma red WiFi).
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    padding: Spacing.three,
  },
  header: {
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: '#fff1f0',
    borderColor: '#ffccc7',
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.two,
    marginBottom: Spacing.three,
  },
  errorBannerText: {
    color: '#cf1322',
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: Spacing.two,
  },
  quickFillContainer: {
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  quickFillLabel: {
    fontSize: 12,
    marginBottom: Spacing.one,
  },
  quickFillButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    backgroundColor: '#fff7e6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffd591',
  },
  quickFillButtonText: {
    color: '#d46b08',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: Spacing.four,
    padding: Spacing.two,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginVertical: 2,
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: 11,
  },
});

