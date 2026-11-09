import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { Exercise, Routine } from "@/services/api";
import { isExerciseCompatibleWithFocus } from "../muscleValidation";
import { DashboardColors, RoutineExerciseItem } from "../types";
import { RoutineAddExerciseForm } from "./RoutineAddExerciseForm";
import { SelectExerciseModal } from "./SelectExerciseModal";

export interface RoutineCardProps {
  colors: DashboardColors;
  routine: Routine;
  routineExercises: RoutineExerciseItem[];
  exercises: Exercise[];
  isAdding: boolean;
  selectedExToAdd: string;
  setSelectedExToAdd: (id: string) => void;
  selectedExsToAdd?: string[];
  setSelectedExsToAdd?: (ids: string[]) => void;
  setsCount: string;
  setSetsCount: (value: string) => void;
  minReps: string;
  setMinReps: (value: string) => void;
  maxReps: string;
  setMaxReps: (value: string) => void;
  onStartAdding: () => void;
  onCancelAdding: () => void;
  onAddExercise: () => void;
  onOptionsPress?: () => void;
}

/**
 * Tarjeta de rutina con diseño deportivo "Apex Emerald Gym", iconos vectoriales
 * y listado estructurado de series/repeticiones.
 */
export const RoutineCard: React.FC<RoutineCardProps> = ({
  colors,
  routine,
  routineExercises,
  exercises,
  isAdding,
  selectedExToAdd,
  setSelectedExToAdd,
  selectedExsToAdd,
  setSelectedExsToAdd,
  setsCount,
  setSetsCount,
  minReps,
  setMinReps,
  maxReps,
  setMaxReps,
  onStartAdding,
  onCancelAdding,
  onAddExercise,
  onOptionsPress,
}) => {
  const [selectModalVisible, setSelectModalVisible] = useState(false);

  const effectiveSelectedIds =
    selectedExsToAdd && selectedExsToAdd.length > 0
      ? selectedExsToAdd
      : selectedExToAdd
        ? [selectedExToAdd]
        : [];

  const selectedExercisesDetails = exercises.filter((ex) =>
    effectiveSelectedIds.includes(ex.id),
  );

  const routineFocus = routine.focus || (routine as any).muscle_focus;
  const routineTitle = routine.title || (routine as any).name || "Rutina";

  const incompatibleExercises = routineFocus
    ? routineExercises.filter((item) => {
        const catalogEx = exercises.find(
          (e) =>
            e.id === item.id ||
            e.name.toLowerCase() === item.name.toLowerCase(),
        );
        return !isExerciseCompatibleWithFocus(
          catalogEx || item.name,
          routineFocus,
          catalogEx?.primary_muscle,
        );
      })
    : [];

  const handleLongPress = () => {
    if (onOptionsPress) {
      Vibration.vibrate(45);
      onOptionsPress();
    }
  };

  const handleRemoveSelectedId = (idToRemove: string) => {
    const updated = effectiveSelectedIds.filter((id) => id !== idToRemove);
    if (setSelectedExsToAdd) {
      setSelectedExsToAdd(updated);
    }
    setSelectedExToAdd(updated[0] || "");
  };

  return (
    <AnimatedCard>
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={380}
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        {/* Cabecera de la rutina */}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.routineBadge,
              {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.border,
              },
            ]}
          >
            <GymIcon name="layers" size={20} color={colors.primary} />
          </View>

          <View style={styles.titleColumn}>
            <Text style={[styles.routineTitle, { color: colors.text }]}>
              {routineTitle}
            </Text>
            <View style={styles.badgesRow}>
              {Boolean(routineFocus) && (
                <View
                  style={[
                    styles.focusPill,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <GymIcon name="target" size={11} color={colors.primary} />
                  <Text style={[styles.focusPillText, { color: colors.primary }]}>
                    {String(routineFocus).toUpperCase()}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.countPill,
                  { backgroundColor: colors.backgroundElevated },
                ]}
              >
                <Text
                  style={[styles.countPillText, { color: colors.textSecondary }]}
                >
                  {routineExercises.length} ejercicio
                  {routineExercises.length === 1 ? "" : "s"}
                </Text>
              </View>
            </View>
          </View>

          {onOptionsPress && (
            <Pressable
              onPress={onOptionsPress}
              hitSlop={10}
              style={[
                styles.moreBtn,
                { backgroundColor: colors.backgroundElevated },
              ]}
            >
              <GymIcon
                name="more-vertical"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

        {/* Alerta de compatibilidad muscular */}
        {incompatibleExercises.length > 0 && (
          <View
            style={[
              styles.warningBanner,
              {
                backgroundColor: "rgba(245, 158, 11, 0.12)",
                borderColor: "rgba(245, 158, 11, 0.35)",
              },
            ]}
          >
            <GymIcon name="alert-triangle" size={16} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.warning }]}>
              {incompatibleExercises.length} ejercicio(s) fuera del enfoque de{" "}
              {routineFocus?.toUpperCase()}:{" "}
              {incompatibleExercises.map((e) => e.name).join(", ")}.
            </Text>
          </View>
        )}

        {/* Listado de ejercicios */}
        <View style={styles.exerciseList}>
          {routineExercises.length === 0 ? (
            <View
              style={[
                styles.emptyContainer,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <GymIcon name="dumbbell" size={18} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Sin ejercicios asignados todavía
              </Text>
            </View>
          ) : (
            routineExercises.map((ex, index) => (
              <View
                key={`${routine.id}-${ex.routineExerciseId || ex.id}-${index}`}
                style={[
                  styles.exerciseRow,
                  {
                    borderBottomColor: colors.borderSubtle,
                    borderBottomWidth:
                      index === routineExercises.length - 1 ? 0 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.indexBadge,
                    { backgroundColor: colors.primaryGlow },
                  ]}
                >
                  <Text style={[styles.indexText, { color: colors.primary }]}>
                    {index + 1}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.exerciseName, { color: colors.text }]}>
                    {ex.name}
                  </Text>
                  <View style={styles.exerciseMetaRow}>
                    <GymIcon
                      name="activity"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.exerciseMetaText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {ex.setsCount ?? 4} series × {ex.minReps ?? 8}-
                      {ex.maxReps ?? 12} reps
                    </Text>
                    {Boolean(ex.equipmentName) && (
                      <Text
                        style={[
                          styles.exerciseEquipText,
                          { color: colors.primary },
                        ]}
                      >
                        • {ex.equipmentName}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Botón o formulario para anexar ejercicios */}
        {!isAdding ? (
          <Pressable
            onPress={onStartAdding}
            style={[
              styles.addTriggerBtn,
              {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.border,
              },
            ]}
          >
            <GymIcon name="plus" size={16} color={colors.primary} />
            <Text style={[styles.addTriggerText, { color: colors.primary }]}>
              Agregar Ejercicios a la Rutina
            </Text>
          </Pressable>
        ) : (
          <RoutineAddExerciseForm
            colors={colors}
            effectiveSelectedIds={effectiveSelectedIds}
            selectedExercisesDetails={selectedExercisesDetails}
            setsCount={setsCount}
            setSetsCount={setSetsCount}
            minReps={minReps}
            setMinReps={setMinReps}
            maxReps={maxReps}
            setMaxReps={setMaxReps}
            onOpenModal={() => setSelectModalVisible(true)}
            onRemoveSelectedId={handleRemoveSelectedId}
            onConfirmAdd={onAddExercise}
            onCancel={onCancelAdding}
          />
        )}

        <SelectExerciseModal
          visible={selectModalVisible}
          colors={colors}
          exercises={exercises}
          routineFocus={routineFocus}
          multiSelect={true}
          selectedExerciseIds={effectiveSelectedIds}
          onConfirmSelection={(ids) => {
            if (setSelectedExsToAdd) {
              setSelectedExsToAdd(ids);
            }
            setSelectedExToAdd(ids[0] || "");
          }}
          onSelect={(id) => {
            setSelectedExToAdd(id);
            if (setSelectedExsToAdd) {
              setSelectedExsToAdd([id]);
            }
          }}
          onClose={() => setSelectModalVisible(false)}
        />
      </Pressable>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.three + 2,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routineBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleColumn: {
    flex: 1,
    gap: 4,
  },
  routineTitle: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  focusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  focusPillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  moreBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  exerciseList: {
    marginTop: 2,
  },
  emptyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: 12,
    fontWeight: "900",
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },
  exerciseMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  exerciseMetaText: {
    fontSize: 12,
    fontWeight: "600",
  },
  exerciseEquipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  addTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: 2,
  },
  addTriggerText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
