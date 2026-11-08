import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardColors, TabType } from "./types";

interface DashboardTabBarProps {
  colors: DashboardColors;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenCatalog: () => void;
}

// BARRA DE NAVEGACIÓN INFERIOR (SUBSTITUYE HOME Y EXPLORE)
export const DashboardTabBar: React.FC<DashboardTabBarProps> = ({
  colors,
  activeTab,
  setActiveTab,
  onOpenCatalog,
}) => {
  const insets = useSafeAreaInsets();

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "routines", label: "Rutinas", icon: "📋" },
    { key: "tracking", label: "Marcas", icon: "📈" },
    { key: "catalog", label: "Catálogo", icon: "📖" },
    { key: "equipment", label: "Máquinas", icon: "⚙️" },
    { key: "profile", label: "Perfil", icon: "👤" },
  ];

  return (
    <View
      style={[
        barStyles.container,
        {
          backgroundColor: colors.backgroundElement,
          borderTopColor: "rgba(150, 150, 150, 0.15)",
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={barStyles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab(tab.key);
              if (tab.key === "catalog") {
                onOpenCatalog();
              }
            }}
          >
            <View style={barStyles.iconWrapper}>
              <Text
                style={[
                  barStyles.iconText,
                  isActive && barStyles.iconTextActive,
                ]}
              >
                {tab.icon}
              </Text>
            </View>

            <Text
              style={[
                barStyles.labelText,
                { color: isActive ? "#10b981" : colors.textSecondary },
                isActive && barStyles.labelTextActive,
              ]}
            >
              {tab.label}
            </Text>

            {isActive ? (
              <View style={barStyles.activeIndicator} />
            ) : (
              <View style={barStyles.inactiveIndicator} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const barStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: 1,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconWrapper: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 21,
  },
  iconTextActive: {
    transform: [{ scale: 1.15 }],
  },
  labelText: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  labelTextActive: {
    fontWeight: "800",
    color: "#10b981",
  },
  activeIndicator: {
    width: 20,
    height: 3,
    backgroundColor: "#10b981",
    borderRadius: 2,
    marginTop: 3,
  },
  inactiveIndicator: {
    width: 20,
    height: 3,
    backgroundColor: "transparent",
    marginTop: 3,
  },
});
