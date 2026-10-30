import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors, TabType } from "./types";

interface DashboardTabBarProps {
  colors: DashboardColors;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenCatalog: () => void;
}

// BARRA DE NAVEGACIÓN SUPERIOR (TABS DEPORTIVAS)
export const DashboardTabBar: React.FC<DashboardTabBarProps> = ({
  colors,
  activeTab,
  setActiveTab,
  onOpenCatalog,
}) => {
  return (
    <View
      style={[styles.tabBar, { backgroundColor: colors.backgroundElement }]}
    >
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "routines" && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab("routines")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "routines" && styles.tabTextActive,
          ]}
        >
          Rutinas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "tracking" && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab("tracking")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "tracking" && styles.tabTextActive,
          ]}
        >
          Marcas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "catalog" && styles.tabButtonActive,
        ]}
        onPress={() => {
          setActiveTab("catalog");
          onOpenCatalog();
        }}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "catalog" && styles.tabTextActive,
          ]}
        >
          Catálogo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "profile" && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab("profile")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "profile" && styles.tabTextActive,
          ]}
        >
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
};
