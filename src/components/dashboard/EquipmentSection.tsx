import { Equipment } from "@/services/api";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { EQUIPMENT_TYPES } from "./AddEquipmentModal";
import { styles } from "./dashboardStyles";
import { DashboardColors } from "./types";

interface EquipmentSectionProps {
  colors: DashboardColors;
  equipmentList: Equipment[];
  onOpenAddEquipment: () => void;
  onEquipmentOptionsPress?: (item: Equipment) => void;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  colors,
  equipmentList,
  onOpenAddEquipment,
  onEquipmentOptionsPress,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  const handleTriggerOptions = (item: Equipment) => {
    try {
      Vibration.vibrate(50);
    } catch {}
    onEquipmentOptionsPress?.(item);
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case "plate_loaded":
        return "⚙️";
      case "pin_selected":
        return "🔩";
      case "cable":
        return "🔗";
      case "smith":
        return "🏗️";
      case "free_weight":
        return "🏋️";
      case "bodyweight":
        return "🤸";
      case "cardio":
        return "🏃";
      case "accessory":
        return "🪑";
      default:
        return "⚙️";
    }
  };

  // Filtrado por buscador y por tipo
  const filteredList = equipmentList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand &&
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedTypeFilter === "all" || item.equipment_type === selectedTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <View style={styles.section}>
      {/* Header con Título y Botón de Crear */}
      <View style={styles.headerWithBtn}>
        <Text
          style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}
        >
          Máquinas y Equipos
        </Text>
        <TouchableOpacity
          style={styles.adminActionBtn}
          onPress={onOpenAddEquipment}
          activeOpacity={0.8}
        >
          <Text style={styles.btnTextWhite}>+ Nueva Máquina</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador de Equipos */}
      <TextInput
        style={[
          eqStyles.searchInput,
          {
            backgroundColor: colors.backgroundElement,
            color: colors.text,
            borderColor: "rgba(150, 150, 150, 0.25)",
          },
        ]}
        placeholder="🔍 Buscar máquina, marca o pesa..."
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Chips de Filtro por Tipo */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 14 }}
      >
        <TouchableOpacity
          style={[
            eqStyles.filterChip,
            selectedTypeFilter === "all" && eqStyles.filterChipActive,
          ]}
          onPress={() => setSelectedTypeFilter("all")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              eqStyles.filterChipText,
              selectedTypeFilter === "all" && eqStyles.filterChipTextActive,
            ]}
          >
            Todos ({equipmentList.length})
          </Text>
        </TouchableOpacity>

        {EQUIPMENT_TYPES.map((type) => {
          const count = equipmentList.filter(
            (e) => e.equipment_type === type.value
          ).length;
          return (
            <TouchableOpacity
              key={type.value}
              style={[
                eqStyles.filterChip,
                selectedTypeFilter === type.value && eqStyles.filterChipActive,
              ]}
              onPress={() => setSelectedTypeFilter(type.value)}
              activeOpacity={0.7}
            >
              <Text style={{ marginRight: 4 }}>{type.icon}</Text>
              <Text
                style={[
                  eqStyles.filterChipText,
                  selectedTypeFilter === type.value &&
                    eqStyles.filterChipTextActive,
                ]}
              >
                {type.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lista de Máquinas / Equipos */}
      {filteredList.length > 0 ? (
        filteredList.map((eq) => {
          const icon = getEquipmentIcon(eq.equipment_type);
          return (
            <TouchableOpacity
              key={eq.id}
              style={[
                styles.card,
                eqStyles.eqCard,
                { backgroundColor: colors.backgroundElement },
              ]}
              onLongPress={() => handleTriggerOptions(eq)}
              delayLongPress={350}
              activeOpacity={0.88}
            >
              <View style={eqStyles.cardMainRow}>
                {/* Ícono de tipo */}
                <View style={eqStyles.iconCircle}>
                  <Text style={{ fontSize: 26 }}>{icon}</Text>
                </View>

                {/* Info del Equipo */}
                <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                  <Text
                    style={[eqStyles.eqName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {eq.name}
                  </Text>

                  <Text
                    style={[eqStyles.eqBrand, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    🏢 {eq.brand || "Marca Genérica"}
                  </Text>

                  {/* Badge de tipo de equipamiento */}
                  <View style={eqStyles.typeBadge}>
                    <Text style={eqStyles.typeBadgeText}>
                      {eq.equipment_type_display ||
                        EQUIPMENT_TYPES.find((t) => t.value === eq.equipment_type)
                          ?.label ||
                        eq.equipment_type}
                    </Text>
                  </View>
                </View>

                {/* Botón de opciones ⋮ */}
                <TouchableOpacity
                  style={eqStyles.optionsBtn}
                  onPress={() => handleTriggerOptions(eq)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      eqStyles.optionsText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    ⋮
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Guía de ajuste o notas técnicas si están presentes */}
              {Boolean(eq.setup_guide) && (
                <View style={eqStyles.setupGuideBox}>
                  <Text style={eqStyles.setupGuideLabel}>
                    🔧 Guía de ajuste:
                  </Text>
                  <Text
                    style={[
                      eqStyles.setupGuideText,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {eq.setup_guide}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={eqStyles.emptyBox}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>⚙️</Text>
          <Text style={[eqStyles.emptyTitle, { color: colors.text }]}>
            No se encontraron máquinas
          </Text>
          <Text
            style={[eqStyles.emptySubtitle, { color: colors.textSecondary }]}
          >
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}".`
              : "No hay equipos registrados en esta categoría."}
          </Text>
        </View>
      )}
    </View>
  );
};

const eqStyles = StyleSheet.create({
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#10b981",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },
  filterChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  eqCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardMainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(150, 150, 150, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  eqName: {
    fontSize: 17,
    fontWeight: "800",
  },
  eqBrand: {
    fontSize: 14,
    marginTop: 2,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  typeBadgeText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "700",
  },
  optionsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(150, 150, 150, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsText: {
    fontSize: 18,
    fontWeight: "800",
  },
  setupGuideBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.15)",
  },
  setupGuideLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 2,
  },
  setupGuideText: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
