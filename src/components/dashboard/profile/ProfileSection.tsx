import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { DashboardColors } from "../types";

export interface ProfileSectionProps {
  colors: DashboardColors;
  showAdminUsers: boolean;
  adminUsers: any[];
  onLoadAdminUsers: () => void;
}

/**
 * Sección de Perfil y Administración con insignia vectorial de rol,
 * directorio de atletas y cierre de sesión seguro.
 */
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  colors,
  showAdminUsers,
  adminUsers,
  onLoadAdminUsers,
}) => {
  const { user, logout } = useAuth();
  const initial = (user?.username || user?.email || "A")[0].toUpperCase();

  return (
    <View style={styles.sectionColumn}>
      <AnimatedCard
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View
          style={[
            styles.avatarCircle,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
        >
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>

        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.username || "Atleta"}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user?.email || "Sin correo registrado"}
        </Text>

        <View
          style={[
            styles.rolePill,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <GymIcon
            name={user?.is_staff ? "shield" : "user"}
            size={14}
            color={colors.primary}
          />
          <Text style={[styles.rolePillText, { color: colors.primary }]}>
            {user?.is_staff
              ? "Administrador del Gimnasio"
              : "Atleta Registrado"}
          </Text>
        </View>

        {user?.is_staff && (
          <View style={styles.adminPanel}>
            <Pressable
              onPress={onLoadAdminUsers}
              style={[
                styles.adminToggleBtn,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <GymIcon name="users" size={16} color={colors.primary} />
              <Text style={[styles.adminToggleText, { color: colors.primary }]}>
                {showAdminUsers
                  ? "Ocultar Directorio de Usuarios"
                  : "Auditar Directorio de Usuarios (API)"}
              </Text>
            </Pressable>

            {showAdminUsers && (
              <View style={styles.usersList}>
                {adminUsers.map((u, idx) => (
                  <View
                    key={u.id ?? idx}
                    style={[
                      styles.userRow,
                      {
                        backgroundColor: colors.backgroundElevated,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.userIconBadge,
                        { backgroundColor: colors.primaryGlow },
                      ]}
                    >
                      <GymIcon
                        name={u.is_staff ? "shield" : "user"}
                        size={15}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.userItemEmail, { color: colors.text }]}>
                        {u.email || u.username}
                      </Text>
                      <Text
                        style={[
                          styles.userItemStatus,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Estado: {u.status || "Activo"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <AppButton
          title="Cerrar Sesión"
          icon="log-out"
          variant="danger"
          onPress={logout}
          style={{ width: "100%", marginTop: 12 }}
        />
      </AnimatedCard>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionColumn: {
    gap: Spacing.three,
  },
  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },
  userName: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: "600",
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginTop: 4,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: "800",
  },
  adminPanel: {
    width: "100%",
    marginTop: 10,
    gap: 10,
  },
  adminToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  adminToggleText: {
    fontSize: 13,
    fontWeight: "800",
  },
  usersList: {
    gap: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  userIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  userItemEmail: {
    fontSize: 13,
    fontWeight: "800",
  },
  userItemStatus: {
    fontSize: 11,
    marginTop: 1,
  },
});
