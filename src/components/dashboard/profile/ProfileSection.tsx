import { Image } from "expo-image";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { EXPERIENCE_LEVELS, resolveMediaUrl } from "@/services/api";
import { DashboardColors } from "../types";
import { EditProfileForm } from "./EditProfileForm";

const formatDecimal = (v?: number | string | null) => {
  const n = Number(v);
  return v === null || v === undefined || v === "" || !Number.isFinite(n)
    ? null
    : n;
};

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
  const [isEditing, setIsEditing] = useState(false);
  const initial = (user?.username || user?.email || "A")[0].toUpperCase();
  const avatarUrl = resolveMediaUrl(user?.avatar);

  const weight = formatDecimal(user?.current_weight);
  const height = formatDecimal(user?.height);
  const bmi =
    weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(1) : null;
  const levelLabel =
    EXPERIENCE_LEVELS.find((l) => l.value === user?.experience_level)?.label ??
    "Principiante";
  const favoritesCount = user?.favorite_exercises?.length ?? 0;

  const stats = [
    { icon: "award" as const, label: "Nivel", value: levelLabel },
    {
      icon: "activity" as const,
      label: "Peso",
      value: weight ? `${weight} kg` : "--",
    },
    {
      icon: "trending-up" as const,
      label: "Estatura",
      value: height ? `${height} cm` : "--",
    },
    { icon: "target" as const, label: "IMC", value: bmi ?? "--" },
  ];

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
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.avatarInitial}>{initial}</Text>
          )}
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

        {user && isEditing ? (
          <EditProfileForm
            colors={colors}
            user={user}
            onCancel={() => setIsEditing(false)}
            onSaved={() => setIsEditing(false)}
          />
        ) : (
          <>
            <View style={styles.statsGrid}>
              {stats.map((s) => (
                <View
                  key={s.label}
                  style={[
                    styles.statItem,
                    {
                      backgroundColor: colors.backgroundElevated,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <GymIcon name={s.icon} size={16} color={colors.primary} />
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    {s.label}
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {s.value}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.bioBox,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Biografía / Objetivos
              </Text>
              <Text style={[styles.bioText, { color: colors.text }]}>
                {user?.bio?.trim() || "Aún no has escrito tus objetivos."}
              </Text>
            </View>

            <View style={styles.favoritesRow}>
              <GymIcon name="sparkles" size={14} color={colors.accent} />
              <Text
                style={[styles.favoritesText, { color: colors.textSecondary }]}
              >
                {favoritesCount === 1
                  ? "1 ejercicio favorito"
                  : `${favoritesCount} ejercicios favoritos`}
              </Text>
            </View>

            <AppButton
              title="Editar Perfil"
              icon="edit"
              variant="secondary"
              onPress={() => setIsEditing(true)}
              style={{ width: "100%" }}
            />
          </>
        )}

        {user?.is_staff && !isEditing && (
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
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  statItem: {
    flexGrow: 1,
    flexBasis: "45%",
    alignItems: "center",
    gap: 3,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "900",
  },
  bioBox: {
    width: "100%",
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  favoritesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  favoritesText: {
    fontSize: 12,
    fontWeight: "700",
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
