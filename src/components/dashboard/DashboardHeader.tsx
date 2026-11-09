import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { DashboardColors } from "./types";

interface DashboardHeaderProps {
  username: string;
  isAdmin: boolean;
  routinesCount: number;
  exercisesCount: number;
  colors: DashboardColors;
}

/**
 * Cabecera superior de lujo del Dashboard con saludo dinámico, insignia de rol
 * e indicadores rápidos del gimnasio.
 */
export function DashboardHeader({
  username,
  isAdmin,
  routinesCount,
  exercisesCount,
  colors,
}: DashboardHeaderProps) {
  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.leftColumn}>
        <View style={styles.brandRow}>
          <View
            style={[
              styles.brandBadge,
              {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.border,
              },
            ]}
          >
            <GymIcon name="dumbbell" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.brandKicker, { color: colors.primary }]}>
            APEX GYM HUB
          </Text>
        </View>
        <Text style={[styles.greetingText, { color: colors.text }]} numberOfLines={1}>
          Hola, {username}
        </Text>
      </View>

      <View style={styles.rightPills}>
        <View
          style={[
            styles.statPill,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="layers" size={13} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.text }]}>
            {routinesCount}
          </Text>
        </View>

        <View
          style={[
            styles.statPill,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="book-open" size={13} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.text }]}>
            {exercisesCount}
          </Text>
        </View>

        <View
          style={[
            styles.roleBadge,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <GymIcon
            name={isAdmin ? "shield" : "user"}
            size={13}
            color={colors.primary}
          />
          <Text style={[styles.roleText, { color: colors.primary }]}>
            {isAdmin ? "Admin" : "Atleta"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  leftColumn: {
    flex: 1,
    gap: 2,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brandKicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  rightPills: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  statText: {
    fontSize: 12,
    fontWeight: "800",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
