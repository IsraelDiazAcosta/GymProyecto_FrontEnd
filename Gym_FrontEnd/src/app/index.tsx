import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { UserProfileCard } from '@/components/auth/UserProfileCard';
import { Colors, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { user, isLoading } = useAuth();

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          <View style={styles.brandingHeader}>
            <Text style={styles.brandEmoji}>🏋️</Text>
            <Text style={[styles.brandTitle, { color: colors.text }]}>
              Gym Proyect
            </Text>
            <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
              Gestión de Rutinas, Catálogo de Máquinas y Progresión
            </Text>
          </View>

          {user ? (
            <View style={styles.loggedInContainer}>
              <UserProfileCard />
              
              <View style={[styles.nextStepsCard, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.nextStepsTitle, { color: colors.text }]}>
                  🚀 Sesión Conectada a Django API
                </Text>
                <Text style={[styles.nextStepsText, { color: colors.textSecondary }]}>
                  Tu autenticación con tokens JWT está funcionando. Los siguientes pasos serán cargar las rutinas de este usuario y el catálogo de máquinas en las siguientes pantallas.
                </Text>
              </View>
            </View>
          ) : (
            <LoginForm />
          )}

        </ScrollView>
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
  scrollContent: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.two,
    fontSize: 14,
  },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  brandEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
  },
  loggedInContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  nextStepsCard: {
    borderRadius: 14,
    padding: Spacing.three,
    marginTop: Spacing.three,
    maxWidth: 420,
    width: '100%',
  },
  nextStepsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  nextStepsText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
