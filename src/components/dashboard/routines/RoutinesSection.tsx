import { Radius } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import {
  Exercise,
  ProgressionItem,
  Routine,
  WorkoutSessionItem,
} from "@/services/api";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { isExerciseCompatibleWithFocus } from "../muscleValidation";
import { DashboardColors, RoutineExerciseItem } from "../types";
import { CreateRoutineCard } from "./CreateRoutineCard";
import { MyRoutinesSubTab } from "./MyRoutinesSubTab";
import { RoutineDetailView } from "./RoutineDetailView";

export interface RoutinesSectionProps {
  colors: DashboardColors;
  routinesSubTab: "mis_rutinas" | "crear";
  setRoutinesSubTab: (tab: "mis_rutinas" | "crear") => void;
  selectedRoutineId: string | null;
  setSelectedRoutineId: (id: string | null) => void;
  routines: Routine[];
  exercises: Exercise[];
  getExercisesOfRoutine: (routine?: Routine) => RoutineExerciseItem[];
  // Crear rutina props
  newRoutineTitle: string;
  setNewRoutineTitle: (title: string) => void;
  newRoutineFocus: string;
  setNewRoutineFocus: (focus: string) => void;
  newRoutineExerciseIds: string[];
  setNewRoutineExerciseIds: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenSelectExercises: () => void;
  onCreateRoutine: () => void;
  // Weekly attendance props
  trainedDayFlags: number[];
  todayWeekIndex: number;
  trainedCount: number;
  // Routine detail / card actions
  selectedRoutineForAdd: string | null;
  setSelectedRoutineForAdd: (id: string | null) => void;
  selectedExToAdd: string;
  setSelectedExToAdd: (id: string) => void;
  selectedExsToAdd: string[];
  setSelectedExsToAdd: (ids: string[]) => void;
  setsCount: string;
  setSetsCount: (v: string) => void;
  minReps: string;
  setMinReps: (v: string) => void;
  maxReps: string;
  setMaxReps: (v: string) => void;
  onAddExerciseToRoutine: (routineId: string) => void;
  onUpdateRoutineExercise?: (
    routineExerciseId: string,
    setsCount: number,
    minReps: number,
    maxReps: number,
  ) => Promise<void>;
  onOpenRoutineOptions?: (routine: Routine) => void;
  onDeleteRoutine?: (routine: Routine) => void;
  routineSessions: WorkoutSessionItem[];
  // Tracking chart props in Mis Rutinas
  trackingRoutineId: string;
  trackingExerciseId: string;
  marcaHistory: ProgressionItem[];
  currentRoutineExercises: { id: string; name: string }[];
  onTrackingSelectRoutine: (routineId: string) => void;
  onTrackingSelectExercise: (exerciseId: string) => void;
}

export const RoutinesSection: React.FC<RoutinesSectionProps> = ({
  colors,
  routinesSubTab,
  setRoutinesSubTab,
  selectedRoutineId,
  setSelectedRoutineId,
  routines,
  exercises,
  getExercisesOfRoutine,
  newRoutineTitle,
  setNewRoutineTitle,
  newRoutineFocus,
  setNewRoutineFocus,
  newRoutineExerciseIds,
  setNewRoutineExerciseIds,
  onOpenSelectExercises,
  onCreateRoutine,
  selectedRoutineForAdd,
  setSelectedRoutineForAdd,
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
  onAddExerciseToRoutine,
  onUpdateRoutineExercise,
  onOpenRoutineOptions,
  onDeleteRoutine,
  routineSessions,
  trackingRoutineId,
  trackingExerciseId,
  marcaHistory,
  currentRoutineExercises,
  onTrackingSelectRoutine,
  onTrackingSelectExercise,
}) => {
  const { t } = useLanguage();
  const selectedRoutineDetail = selectedRoutineId
    ? routines.find((r) => r.id === selectedRoutineId) || null
    : null;

  return (
    <>
      {/* Selector de sub-pestañas: Crear / Mis Rutinas */}
      <View
        style={[
          styles.subTabBar,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        {(
          [
            { key: "mis_rutinas", label: t("routines.subTabMyRoutines") },
            { key: "crear", label: t("routines.subTabCreate") },
          ] as const
        ).map((subTab) => {
          const active = routinesSubTab === subTab.key;
          return (
            <Pressable
              key={subTab.key}
              onPress={() => {
                setRoutinesSubTab(subTab.key);
                if (subTab.key === "mis_rutinas") {
                  setSelectedRoutineId(null);
                }
              }}
              style={[
                styles.subTabBtn,
                active && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.subTabText,
                  {
                    color: active ? colors.onPrimary : colors.textSecondary,
                  },
                ]}
              >
                {subTab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* SUB-PESTAÑA: CREAR */}
      {routinesSubTab === "crear" && (
        <>
          <CreateRoutineCard
            colors={colors}
            newRoutineTitle={newRoutineTitle}
            setNewRoutineTitle={setNewRoutineTitle}
            newRoutineFocus={newRoutineFocus}
            setNewRoutineFocus={setNewRoutineFocus}
            selectedExercises={exercises.filter(
              (ex) =>
                newRoutineExerciseIds.includes(ex.id) &&
                isExerciseCompatibleWithFocus(ex, newRoutineFocus),
            )}
            onOpenSelectExercises={onOpenSelectExercises}
            onRemoveExercise={(id) =>
              setNewRoutineExerciseIds((prev) => prev.filter((x) => x !== id))
            }
            onCreate={onCreateRoutine}
          />
        </>
      )}

      {/* SUB-PESTAÑA: MIS RUTINAS (LISTA COMPACTA) */}
      {routinesSubTab === "mis_rutinas" && !selectedRoutineDetail && (
        <MyRoutinesSubTab
          colors={colors}
          routines={routines}
          exercises={exercises}
          getExercisesOfRoutine={getExercisesOfRoutine}
          onSelectRoutine={(routineId) => setSelectedRoutineId(routineId)}
          onOpenRoutineOptions={onOpenRoutineOptions}
          onDeleteRoutine={onDeleteRoutine}
          onUpdateRoutineExercise={onUpdateRoutineExercise}
          onGoToCreate={() => setRoutinesSubTab("crear")}
          trackingRoutineId={trackingRoutineId}
          trackingExerciseId={trackingExerciseId}
          marcaHistory={marcaHistory}
          currentRoutineExercises={currentRoutineExercises}
          onTrackingSelectRoutine={onTrackingSelectRoutine}
          onTrackingSelectExercise={onTrackingSelectExercise}
        />
      )}

      {/* SUB-PESTAÑA: MIS RUTINAS (DETALLE DE RUTINA SELECCIONADA) */}
      {routinesSubTab === "mis_rutinas" && selectedRoutineDetail && (
        <RoutineDetailView
          colors={colors}
          routine={selectedRoutineDetail}
          routineExercises={getExercisesOfRoutine(selectedRoutineDetail)}
          exercises={exercises}
          isAdding={selectedRoutineForAdd === selectedRoutineDetail.id}
          selectedExToAdd={selectedExToAdd}
          setSelectedExToAdd={setSelectedExToAdd}
          selectedExsToAdd={selectedExsToAdd}
          setSelectedExsToAdd={setSelectedExsToAdd}
          setsCount={setsCount}
          setSetsCount={setSetsCount}
          minReps={minReps}
          setMinReps={setMinReps}
          maxReps={maxReps}
          setMaxReps={setMaxReps}
          onStartAdding={() => {
            setSelectedRoutineForAdd(selectedRoutineDetail.id);
            const firstCompatible = exercises.find((ex) =>
              isExerciseCompatibleWithFocus(ex, selectedRoutineDetail.focus),
            );
            setSelectedExToAdd(firstCompatible ? firstCompatible.id : "");
            setSelectedExsToAdd(firstCompatible ? [firstCompatible.id] : []);
          }}
          onCancelAdding={() => {
            setSelectedRoutineForAdd(null);
            setSelectedExsToAdd([]);
            setSelectedExToAdd("");
          }}
          onAddExercise={() => onAddExerciseToRoutine(selectedRoutineDetail.id)}
          onUpdateRoutineExercise={onUpdateRoutineExercise}
          onOptionsPress={() => onOpenRoutineOptions?.(selectedRoutineDetail)}
          onDeleteRoutine={onDeleteRoutine}
          routineSessions={routineSessions}
          onBack={() => {
            setSelectedRoutineId(null);
            if (selectedRoutineForAdd) {
              setSelectedRoutineForAdd(null);
              setSelectedExsToAdd([]);
              setSelectedExToAdd("");
            }
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  subTabBar: {
    flexDirection: "row",
    padding: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  subTabText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
