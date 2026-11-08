import { Exercise } from "@/services/api";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { styles } from "./dashboardStyles";
import { isExerciseCompatibleWithFocus } from "./muscleValidation";
import { DashboardColors } from "./types";

interface CatalogSectionProps {
  colors: DashboardColors;
  exercises: Exercise[];
  isStaff?: boolean;
  onOpenAddExercise: () => void;
  onOpenExerciseDetail: (exerciseId: string) => void;
  onExerciseOptionsPress?: (exercise: Exercise) => void;
}

const MUSCLE_FILTER_OPTIONS = [
  { value: "pecho", label: "Pecho" },
  { value: "espalda", label: "Espalda" },
  { value: "pierna", label: "Pierna" },
  { value: "hombro", label: "Hombro" },
  { value: "brazo", label: "Brazo" },
  { value: "core", label: "Core" },
];

// TAB 3: CATÁLOGO DE EJERCICIOS
export const CatalogSection: React.FC<CatalogSectionProps> = ({
  colors,
  exercises,
  isStaff,
  onOpenAddExercise,
  onOpenExerciseDetail,
  onExerciseOptionsPress,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] =
    useState<string>("all");

  const handleTriggerOptions = (ex: Exercise) => {
    try {
      Vibration.vibrate(50);
    } catch (e) {}
    onExerciseOptionsPress?.(ex);
  };

  // Filtrado reactivo por buscador de texto y por grupo muscular
  const filteredList = useMemo(() => {
    return exercises.filter((item) => {
      // 1. Filtro por buscador de texto (nombre, máquina o músculo)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.equipment_name &&
          item.equipment_name.toLowerCase().includes(q)) ||
        (item.primary_muscle &&
          item.primary_muscle.toLowerCase().includes(q)) ||
        (item.muscles &&
          item.muscles.some(
            (m) =>
              m.muscle_name.toLowerCase().includes(q) ||
              m.body_part.toLowerCase().includes(q),
          ));

      // 2. Filtro por grupo muscular
      const matchesMuscle =
        selectedMuscleFilter === "all" ||
        isExerciseCompatibleWithFocus(item, selectedMuscleFilter);

      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchQuery, selectedMuscleFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedMuscleFilter("all");
  };

  return (
    <View style={styles.section}>
      {/* Header con Título y Botón de Crear */}
      <View style={styles.headerWithBtn}>
        <Text
          style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}
        >
          Catálogo de Ejercicios
        </Text>
        {isStaff && (
          <TouchableOpacity
            style={styles.adminActionBtn}
            onPress={onOpenAddExercise}
            activeOpacity={0.8}
          >
            <Text style={styles.btnTextWhite}>+ Agregar ejercicio</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Buscador de Ejercicios */}
      <View style={catalogStyles.searchRow}>
        <TextInput
          style={[
            catalogStyles.searchInput,
            {
              backgroundColor: colors.backgroundElement,
              color: colors.text,
              borderColor: "rgba(150, 150, 150, 0.25)",
            },
          ]}
          placeholder="🔍 Buscar ejercicio, músculo o máquina..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={catalogStyles.clearSearchBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: "700" }}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chips de Filtro por Grupo Muscular */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 14 }}
      >
        <TouchableOpacity
          style={[
            catalogStyles.filterChip,
            selectedMuscleFilter === "all" && catalogStyles.filterChipActive,
          ]}
          onPress={() => setSelectedMuscleFilter("all")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              catalogStyles.filterChipText,
              selectedMuscleFilter === "all" &&
                catalogStyles.filterChipTextActive,
            ]}
          >
            Todos ({exercises.length})
          </Text>
        </TouchableOpacity>

        {MUSCLE_FILTER_OPTIONS.map((filter) => {
          const count = exercises.filter((ex) =>
            isExerciseCompatibleWithFocus(ex, filter.value),
          ).length;
          const isSelected = selectedMuscleFilter === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[
                catalogStyles.filterChip,
                isSelected && catalogStyles.filterChipActive,
              ]}
              onPress={() => setSelectedMuscleFilter(filter.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  catalogStyles.filterChipText,
                  isSelected && catalogStyles.filterChipTextActive,
                ]}
              >
                {filter.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lista de Ejercicios Filtrados */}
      {filteredList.length > 0 ? (
        filteredList.map((ex) => (
          <TouchableOpacity
            key={ex.id}
            style={[
              styles.exerciseCard,
              { backgroundColor: colors.backgroundElement },
            ]}
            onPress={() => onOpenExerciseDetail(ex.id)}
            onLongPress={() => handleTriggerOptions(ex)}
            delayLongPress={350}
            activeOpacity={0.85}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={[styles.exerciseName, { color: colors.text }]}
                numberOfLines={1}
              >
                {ex.name}
              </Text>

              <View style={catalogStyles.metaColumn}>
                <Text
                  style={[styles.exerciseInfo, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  ⚙️ {ex.equipment_name || "Sin máquina / Libre"}
                </Text>

                {ex.primary_muscle && (
                  <Text
                    style={[
                      catalogStyles.muscleBadgeText,
                      { color: "#10b981" },
                    ]}
                    numberOfLines={1}
                  >
                    {ex.primary_muscle}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <View style={styles.verMasBadge}>
                <Text style={styles.verMasText}>Ver Detalle ›</Text>
              </View>

              {/* Botón de opciones (⋮) */}
              <TouchableOpacity
                style={catalogStyles.optionsBtn}
                onPress={() => handleTriggerOptions(ex)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    catalogStyles.optionsText,
                    { color: colors.textSecondary },
                  ]}
                >
                  ⋮
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        /* Estado vacío si no hay coincidencias */
        <View style={catalogStyles.emptyBox}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🔍</Text>
          <Text style={[catalogStyles.emptyTitle, { color: colors.text }]}>
            No se encontraron ejercicios
          </Text>
          <Text
            style={[
              catalogStyles.emptySubtitle,
              { color: colors.textSecondary },
            ]}
          >
            No hay ejercicios que coincidan con tu búesqueda
          </Text>
          {(searchQuery.length > 0 || selectedMuscleFilter !== "all") && (
            <TouchableOpacity
              style={catalogStyles.clearFilterBtn}
              onPress={handleClearFilters}
              activeOpacity={0.8}
            >
              <Text style={catalogStyles.clearFilterText}>
                Limpiar Búsqueda y Filtros
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const catalogStyles = StyleSheet.create({
  searchRow: {
    position: "relative",
    justifyContent: "center",
    marginBottom: 10,
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingRight: 36,
    fontSize: 15,
  },
  clearSearchBtn: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 6,
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
  metaColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 2,
    gap: 2,
  },
  muscleBadgeText: {
    fontSize: 13,
    fontWeight: "600",
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
    marginBottom: 14,
  },
  clearFilterBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  clearFilterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
