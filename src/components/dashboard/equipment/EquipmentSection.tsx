import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";

import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GymIcon, IconName } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { Equipment } from "@/services/api";
import { DashboardColors } from "../types";
import { EQUIPMENT_TYPES } from "./AddEquipmentModal";

export interface EquipmentSectionProps {
  colors: DashboardColors;
  equipmentList: Equipment[];
  onOpenAddEquipment: () => void;
  onEquipmentOptionsPress?: (item: Equipment) => void;
}

export const getEquipmentIconName = (type?: string): IconName => {
  switch (type) {
    case "plate_loaded":
      return "cog";
    case "pin_selected":
      return "sliders";
    case "cable":
      return "activity";
    case "smith":
      return "layers";
    case "free_weight":
      return "dumbbell";
    case "bodyweight":
      return "user";
    case "cardio":
      return "flame";
    default:
      return "target";
  }
};

/**
 * Inventario de máquinas y equipos del gimnasio con búsqueda instantánea,
 * filtros por categoría biomecánica e iconos vectoriales.
 */
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
      Vibration.vibrate(45);
    } catch {}
    onEquipmentOptionsPress?.(item);
  };

  const filteredEquipment = equipmentList.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedTypeFilter === "all" ||
      item.equipment_type === selectedTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <AnimatedCard
      style={[
        styles.containerCard,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      {/* Cabecera */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.kickerRow}>
            <GymIcon name="cog" size={14} color={colors.primary} />
            <Text style={[styles.kickerText, { color: colors.primary }]}>
              EQUIPAMIENTO DEPORTIVO
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Máquinas y Equipos
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {equipmentList.length} equipo
            {equipmentList.length === 1 ? "" : "s"} registrados en el gimnasio
          </Text>
        </View>

        <Pressable
          onPress={onOpenAddEquipment}
          style={[
            styles.addBtn,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
        >
          <GymIcon name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Nueva</Text>
        </Pressable>
      </View>

      {/* Buscador */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <GymIcon name="search" size={17} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar máquina, polea, marca..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <GymIcon name="x" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Filtros por categoría */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        <Pressable
          onPress={() => setSelectedTypeFilter("all")}
          style={[
            styles.filterChip,
            {
              backgroundColor:
                selectedTypeFilter === "all"
                  ? colors.primary
                  : colors.backgroundElevated,
              borderColor:
                selectedTypeFilter === "all"
                  ? colors.primaryLight
                  : colors.borderSubtle,
            },
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              {
                color:
                  selectedTypeFilter === "all"
                    ? "#FFFFFF"
                    : colors.textSecondary,
              },
            ]}
          >
            Todas ({equipmentList.length})
          </Text>
        </Pressable>

        {EQUIPMENT_TYPES.map((t) => {
          const isSelected = selectedTypeFilter === t.value;
          return (
            <Pressable
              key={t.value}
              onPress={() => setSelectedTypeFilter(t.value)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : colors.backgroundElevated,
                  borderColor: isSelected
                    ? colors.primaryLight
                    : colors.borderSubtle,
                },
              ]}
            >
              <GymIcon
                name={t.icon}
                size={13}
                color={isSelected ? "#FFFFFF" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: isSelected ? "#FFFFFF" : colors.textSecondary,
                  },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Listado */}
      {filteredEquipment.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="cog" size={28} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No se encontraron máquinas
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Intenta cambiar el filtro o registra una nueva máquina con el botón
            superior.
          </Text>
        </View>
      ) : (
        <View style={styles.listColumn}>
          {filteredEquipment.map((item) => (
            <Pressable
              key={item.id}
              onLongPress={() => handleTriggerOptions(item)}
              delayLongPress={380}
              style={[
                styles.equipCard,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <GymIcon
                    name={getEquipmentIconName(item.equipment_type)}
                    size={20}
                    color={colors.primary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.equipName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <View style={styles.badgesRow}>
                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor: colors.primaryGlow,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          { color: colors.primary },
                        ]}
                      >
                        {item.type_display || item.equipment_type}
                      </Text>
                    </View>
                    {Boolean(item.brand) && (
                      <Text
                        style={[
                          styles.brandText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        • {item.brand}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.rightMeta}>
                  {typeof item.exercises_count === "number" && (
                    <View
                      style={[
                        styles.countBadge,
                        { backgroundColor: colors.backgroundElement },
                      ]}
                    >
                      <Text
                        style={[styles.countNumber, { color: colors.primary }]}
                      >
                        {item.exercises_count}
                      </Text>
                      <Text
                        style={[
                          styles.countLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        ejerc.
                      </Text>
                    </View>
                  )}

                  {onEquipmentOptionsPress && (
                    <Pressable
                      onPress={() => onEquipmentOptionsPress(item)}
                      hitSlop={10}
                      style={styles.moreBtn}
                    >
                      <GymIcon
                        name="more-vertical"
                        size={17}
                        color={colors.textSecondary}
                      />
                    </Pressable>
                  )}
                </View>
              </View>

              {Boolean(item.description) && (
                <Text
                  style={[styles.descText, { color: colors.textSecondary }]}
                >
                  {item.description}
                </Text>
              )}

              {Boolean(item.setup_guide) && (
                <View
                  style={[
                    styles.setupBox,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.setupHeader}>
                    <GymIcon name="sliders" size={12} color={colors.primary} />
                    <Text
                      style={[styles.setupLabel, { color: colors.primary }]}
                    >
                      GUÍA DE AJUSTE
                    </Text>
                  </View>
                  <Text style={[styles.setupText, { color: colors.text }]}>
                    {item.setup_guide}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  containerCard: {
    borderRadius: Radius.xl,
    padding: Spacing.three + 2,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  kickerText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "800",
  },
  listColumn: {
    gap: 10,
  },
  equipCard: {
    borderRadius: Radius.lg,
    padding: 13,
    borderWidth: 1,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  equipName: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  brandText: {
    fontSize: 12,
    fontWeight: "600",
  },
  rightMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countBadge: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  countNumber: {
    fontSize: 14,
    fontWeight: "900",
  },
  countLabel: {
    fontSize: 9,
    fontWeight: "700",
  },
  moreBtn: {
    padding: 6,
  },
  descText: {
    fontSize: 13,
    lineHeight: 18,
  },
  setupBox: {
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
  },
  setupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  setupLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  setupText: {
    fontSize: 12,
    lineHeight: 17,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
});
