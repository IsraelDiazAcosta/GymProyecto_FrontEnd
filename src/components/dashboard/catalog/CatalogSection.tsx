import React, { useEffect, useMemo, useState } from "react";
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
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { api, Exercise } from "@/services/api";
import { isExerciseCompatibleWithFocus } from "../muscleValidation";
import { DashboardColors } from "../types";

export interface CatalogSectionProps {
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

/**
 * Sección de Catálogo de Ejercicios con buscador reactivo, chips de grupo muscular
 * y disposición estrictamente vertical de metadatos (Máquina arriba, Músculo abajo).
 */
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
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const handleLongPress = (ex: Exercise) => {
    if (!isStaff || !onExerciseOptionsPress) return;
    try {
      Vibration.vibrate(45);
    } catch {}
    onExerciseOptionsPress(ex);
  };
  useEffect(() => {
  const loadFavorites = async () => {
    try {
      const profile = await api.getProfile();

      setFavoriteIds(
        (profile.favorite_exercises || []).map(String)
      );
    } catch (error) {
      console.error(error);
    }
  };

  loadFavorites();
}, []);

const toggleFavorite = async (exerciseId: string) => {
  const updatedFavorites = favoriteIds.includes(exerciseId)
    ? favoriteIds.filter((id) => id !== exerciseId)
    : [...favoriteIds, exerciseId];

  setFavoriteIds(updatedFavorites);

  try {
    await api.updateProfile({
      favorite_exercises: updatedFavorites,
    });
  } catch (error) {
    console.error(error);
  }
};

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return exercises.filter((ex) => {
      if (selectedMuscleFilter !== "all") {
        const matchesMuscle = isExerciseCompatibleWithFocus(
          ex.name,
          selectedMuscleFilter,
          ex.primary_muscle,
        );
        if (!matchesMuscle) return false;
      }
      if (
        showFavoritesOnly &&
        !favoriteIds.includes(ex.id)
      ) {
        return false;
      }
      if (!query) return true;

      const matchName = ex.name?.toLowerCase().includes(query);
      const matchEquip = ex.equipment_name?.toLowerCase().includes(query);
      const matchMuscle = ex.primary_muscle?.toLowerCase().includes(query);

      return Boolean(matchName || matchEquip || matchMuscle);
    });
    }, [
  exercises,
  searchQuery,
  selectedMuscleFilter,
  showFavoritesOnly,
  favoriteIds,
]);
  

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
            <GymIcon name="book-open" size={14} color={colors.primary} />
            <Text style={[styles.kickerText, { color: colors.primary }]}>
              BIBLIOTECA BIOMECÁNICA
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Catálogo de Ejercicios
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {filteredExercises.length} de {exercises.length} ejercicio
            {exercises.length === 1 ? "" : "s"} disponibles
          </Text>
        </View>

        {isStaff && (
          <Pressable
            onPress={onOpenAddExercise}
            style={[
              styles.addBtn,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
          >
            <GymIcon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Nuevo</Text>
          </Pressable>
        )}
      </View>

      {/* Barra de búsqueda */}
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
          placeholder="Buscar por nombre, máquina o músculo..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <GymIcon name="x" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      <View
  style={{
    flexDirection: "row",
    gap: 8,
  }}
>
  <Pressable
    onPress={() => setShowFavoritesOnly(false)}
    style={[
      styles.filterChip,
      {
        backgroundColor: !showFavoritesOnly
          ? colors.primary
          : colors.backgroundElevated,
      },
    ]}
  >
    <Text
      style={[
        styles.filterChipText,
        {
          color: !showFavoritesOnly
            ? "#FFFFFF"
            : colors.textSecondary,
        },
      ]}
    >
      Todos
    </Text>
  </Pressable>

  <Pressable
    onPress={() => setShowFavoritesOnly(true)}
    style={[
      styles.filterChip,
      {
        backgroundColor: showFavoritesOnly
          ? colors.primary
          : colors.backgroundElevated,
      },
    ]}
  >
    <GymIcon
      name="award"
      size={12}
      color={
        showFavoritesOnly
          ? "#FFFFFF"
          : colors.textSecondary
      }
    />

    <Text
      style={[
        styles.filterChipText,
        {
          color: showFavoritesOnly
            ? "#FFFFFF"
            : colors.textSecondary,
        },
      ]}
    >
      Favoritos
    </Text>
  </Pressable>
</View>
      {/* Chips de filtro muscular */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        <Pressable
          onPress={() => setSelectedMuscleFilter("all")}
          style={[
            styles.filterChip,
            {
              backgroundColor:
                selectedMuscleFilter === "all"
                  ? colors.primary
                  : colors.backgroundElevated,
              borderColor:
                selectedMuscleFilter === "all"
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
                  selectedMuscleFilter === "all"
                    ? "#FFFFFF"
                    : colors.textSecondary,
              },
            ]}
          >
            Todos ({exercises.length})
          </Text>
        </Pressable>

        {MUSCLE_FILTER_OPTIONS.map((opt) => {
          const isSelected = selectedMuscleFilter === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() =>
                setSelectedMuscleFilter(isSelected ? "all" : opt.value)
              }
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
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: isSelected ? "#FFFFFF" : colors.textSecondary,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Lista de ejercicios */}
      {filteredExercises.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="search" size={28} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Sin coincidencias
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {exercises.length === 0
              ? "Aún no hay ejercicios cargados en el catálogo."
              : "No se encontraron ejercicios con los filtros actuales."}
          </Text>
        </View>
      ) : (
        <View style={styles.listColumn}>
          {filteredExercises.map((ex) => (
            <Pressable
              key={ex.id}
              onPress={() => onOpenExerciseDetail(ex.id)}
              onLongPress={() => handleLongPress(ex)}
              delayLongPress={380}
              style={[
                styles.exerciseItem,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: colors.primaryGlow,
                    borderColor: colors.border,
                  },
                ]}
              >
                <GymIcon name="dumbbell" size={20} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.exerciseName, { color: colors.text }]}>
                  {ex.name}
                </Text>

                {/* Orden estrictamente uno debajo del otro: Máquina arriba, Grupo muscular abajo */}
                <View style={styles.metaColumn}>
                  <View style={styles.metaLine}>
                    <GymIcon
                      name="cog"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.metaEquipText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {ex.equipment_name
                        ? `Máquina: ${ex.equipment_name}`
                        : "Peso Libre / General"}
                    </Text>
                  </View>

                  {Boolean(ex.primary_muscle) && (
                    <View
                      style={[
                        styles.muscleBadge,
                        {
                          backgroundColor: colors.primaryGlow,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <GymIcon name="target" size={11} color={colors.primary} />
                      <Text
                        style={[
                          styles.muscleBadgeText,
                          { color: colors.primary },
                        ]}
                      >
                        {ex.primary_muscle}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.rightActions}>
              <Pressable
                  onPress={() => toggleFavorite(ex.id)}
                  hitSlop={10}
                >
                  <GymIcon
                    name="award"
                    size={18}
                    color={
                      favoriteIds.includes(ex.id)
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                </Pressable>
                <View
                  style={[
                    styles.detailBadge,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.detailBadgeText, { color: colors.primary }]}
                  >
                    Ficha
                  </Text>
                  <GymIcon
                    name="chevron-right"
                    size={13}
                    color={colors.primary}
                  />
                </View>

                {isStaff && onExerciseOptionsPress && (
                  <Pressable
                    onPress={() => onExerciseOptionsPress(ex)}
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
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  metaColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaEquipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  muscleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  muscleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  moreBtn: {
    padding: 6,
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
