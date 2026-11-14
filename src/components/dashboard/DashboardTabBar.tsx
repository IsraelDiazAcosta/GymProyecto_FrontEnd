import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GymIcon, IconName } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { DashboardColors, TabType } from "./types";

interface DashboardTabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  colors: DashboardColors;
}

const TABS: { key: TabType; label: string; icon: IconName }[] = [
  { key: "equipment", label: "Máquinas", icon: "cog" },
  { key: "catalog", label: "Catálogo", icon: "book-open" },
  { key: "routines", label: "Rutinas", icon: "layers" },
  { key: "tracking", label: "Progreso", icon: "trending-up" },
  { key: "profile", label: "Perfil", icon: "user" },
];

export function DashboardTabBar({
  activeTab,
  onSelectTab,
  colors,
}: DashboardTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomWrapper,
        {
          backgroundColor: colors.backgroundElement,
          borderTopColor: colors.borderSubtle,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.barContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const iconColor = isActive ? colors.onPrimary : colors.textSecondary;

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
                    color: isActive ? colors.onPrimary : colors.textSecondary,
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
    </View>
  );
}

const styles = StyleSheet.create({
  bottomWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingHorizontal: Spacing.two,
    zIndex: 50,
  },
  barContainer: {
    flexDirection: "row",
    gap: 4,
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
