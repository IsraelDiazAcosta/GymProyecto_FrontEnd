import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/theme';

export const UserProfileCard: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Sesión Activa
          </Text>
          <Text style={[styles.email, { color: colors.text }]}>{user.email}</Text>
        </View>

        <View
          style={[
            styles.badge,
            { backgroundColor: user.is_staff ? '#ff6b00' : '#4b5563' },
          ]}>
          <Text style={styles.badgeText}>
            {user.is_staff ? '🛡️ Administrador' : '👤 Atleta'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Nivel
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {user.experience_level || 'Principiante'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Peso
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {user.current_weight ? `${user.current_weight} kg` : '--'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Estatura
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {user.height ? `${user.height} cm` : '--'}
          </Text>
        </View>
      </View>

      <AppButton
        title="Cerrar Sesión"
        variant="outline"
        onPress={logout}
        style={styles.logoutButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginVertical: Spacing.three,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.three,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  logoutButton: {
    marginTop: Spacing.two,
  },
});

