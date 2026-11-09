import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GymIcon, IconName } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { DashboardColors, TabType } from "./types";

interface DashboardTabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  colors: DashboardColors;
}

const TABS: { key: TabType; label: string; icon: IconName }[] = [
  { key: "routines", label: "Rutinas", icon: "layers" },
  { key: "tracking", label: "Progreso", icon: "trending-up" },
  { key: "catalog", label: "Catálogo", icon: "book-open" },
  { key: "equipment", label: "Máquinas", icon: "cog" },
  { key: "profile", label: "Perfil", icon: "user" },
];

/**
 * Barra de navegación principal con iconos vectoriales y pestaña activa con brillo Esmeralda.
 */
export function DashboardTabBar({
  activeTab,
  onSelectTab,
  colors,
}: DashboardTabBarProps) {
  return (
    <View
      style={[
        styles.barContainer,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const iconColor = isActive ? "#FFFFFF" : colors.textSecondary;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={[
              styles.tabItem,
              isActive && {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 4,
              },
            ]}
          >
            <GymIcon
              name={tab.icon}
              size={18}
              color={iconColor}
              strokeWidth={isActive ? 2.4 : 2}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? "#FFFFFF" : colors.textSecondary,
                  fontWeight: isActive ? "800" : "600",
                },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    borderRadius: Radius.xl,
    padding: 5,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: Radius.lg,
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
});
