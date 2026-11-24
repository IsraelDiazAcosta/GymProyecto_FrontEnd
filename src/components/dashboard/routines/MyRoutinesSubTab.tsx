import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { Exercise, ProgressionItem, Routine } from "@/services/api";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { RMTrackingChart } from "../tracking/RMTrackingChart";
import { DashboardColors, RoutineExerciseItem } from "../types";
import { RoutineCard } from "./RoutineCard";

export interface MyRoutinesSubTabProps {
  colors: DashboardColors;
  routines: Routine[];
  exercises: Exercise[];
  getExercisesOfRoutine: (routine?: Routine) => RoutineExerciseItem[];
  onSelectRoutine: (routineId: string) => void;
  onOpenRoutineOptions?: (routine: Routine) => void;
  onDeleteRoutine?: (routine: Routine) => void;
  onUpdateRoutineExercise?: (
    routineExerciseId: string,
    setsCount: number,
    minReps: number,
    maxReps: number,
  ) => Promise<void>;
  onGoToCreate: () => void;
  trackingRoutineId: string;
  trackingExerciseId: string;
  recordHistory: ProgressionItem[];
  currentRoutineExercises: { id: string; name: string }[];
  onTrackingSelectRoutine: (routineId: string) => void;
  onTrackingSelectExercise: (exerciseId: string) => void;
}

export const MyRoutinesSubTab: React.FC<MyRoutinesSubTabProps> = ({
  colors,
  routines,
  exercises,
  getExercisesOfRoutine,
  onSelectRoutine,
  onOpenRoutineOptions,
  onDeleteRoutine,
  onUpdateRoutineExercise,
  onGoToCreate,
  trackingRoutineId,
  trackingExerciseId,
  recordHistory,
  currentRoutineExercises,
  onTrackingSelectRoutine,
  onTrackingSelectExercise,
}) => {
  const { t } = useLanguage();

  if (routines.length === 0) {
    return (
      <View
        style={[
          styles.emptyStateCard,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View
          style={[
            styles.emptyIconBadge,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <GymIcon name="layers" size={26} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {t("routines.emptyTitle")}
        </Text>
        <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
          {t("routines.emptyMessage")}
        </Text>
        <AppButton
          title={t("routines.goToCreateBtn")}
          icon="plus"
          onPress={onGoToCreate}
          style={{ width: "100%" }}
        />
      </View>
    );
  }

  return (
    <>
      <RMTrackingChart
        colors={colors}
        routines={routines}
        trackingRoutineId={trackingRoutineId}
        trackingExerciseId={trackingExerciseId}
        recordHistory={recordHistory}
        exercises={currentRoutineExercises}
        onSelectRoutine={onTrackingSelectRoutine}
        onSelectExercise={onTrackingSelectExercise}
      />

      {routines.map((routine, idx) => (
        <RoutineCard
          key={`${routine.id}-${idx}`}
          colors={colors}
          routine={routine}
          routineExercises={getExercisesOfRoutine(routine)}
          exercises={exercises}
          isAdding={false}
          selectedExToAdd=""
          setSelectedExToAdd={() => {}}
          selectedExsToAdd={[]}
          setSelectedExsToAdd={() => {}}
          setsCount=""
          setSetsCount={() => {}}
          minReps=""
          setMinReps={() => {}}
          maxReps=""
          setMaxReps={() => {}}
          onStartAdding={() => {}}
          onCancelAdding={() => {}}
          onAddExercise={() => {}}
          onUpdateRoutineExercise={onUpdateRoutineExercise}
          onDeletePress={
            onDeleteRoutine ? () => onDeleteRoutine(routine) : undefined
          }
          onOptionsPress={
            onOpenRoutineOptions
              ? () => onOpenRoutineOptions(routine)
              : undefined
          }
          compact={true}
          onPress={() => onSelectRoutine(routine.id)}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  emptyStateCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  emptyIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 4,
  },
});
