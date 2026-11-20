import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { Exercise, Routine, WorkoutSessionItem } from "@/services/api";
import { DashboardColors, RoutineExerciseItem } from "../types";
import { RoutineCard } from "./RoutineCard";

export interface RoutineDetailViewProps {
  colors: DashboardColors;
  routine: Routine;
  routineExercises: RoutineExerciseItem[];
  exercises: Exercise[];
  isAdding: boolean;
  selectedExToAdd: string;
  setSelectedExToAdd: (id: string) => void;
  selectedExsToAdd: string[];
  setSelectedExsToAdd: (ids: string[]) => void;
  setsCount: string;
  setSetsCount: (value: string) => void;
  minReps: string;
  setMinReps: (value: string) => void;
  maxReps: string;
  setMaxReps: (value: string) => void;
  onStartAdding: () => void;
  onCancelAdding: () => void;
  onAddExercise: () => void;
  onUpdateRoutineExercise?: (
    routineExerciseId: string,
    setsCount: number,
    minReps: number,
    maxReps: number,
  ) => Promise<void>;
  onOptionsPress?: () => void;
  onDeleteRoutine?: (routine: Routine) => void;
  routineSessions: WorkoutSessionItem[];
  onBack: () => void;
}

const formatDurationHMS = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

export const RoutineDetailView: React.FC<RoutineDetailViewProps> = ({
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
  onUpdateRoutineExercise,
  onOptionsPress,
  onDeleteRoutine,
  routineSessions,
  onBack,
}) => {
  const { locale, t } = useLanguage();

  return (
    <>
      <Pressable
        onPress={onBack}
        style={[
          styles.backBtn,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={{ transform: [{ rotate: "180deg" }] }}>
          <GymIcon name="chevron-right" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.backBtnText, { color: colors.text }]}>
          {t("routines.backToMyRoutines")}
        </Text>
      </Pressable>

      <RoutineCard
        key={routine.id}
        colors={colors}
        routine={routine}
        routineExercises={routineExercises}
        exercises={exercises}
        isAdding={isAdding}
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
        onStartAdding={onStartAdding}
        onCancelAdding={onCancelAdding}
        onAddExercise={onAddExercise}
        onUpdateRoutineExercise={onUpdateRoutineExercise}
        onDeletePress={onDeleteRoutine ? () => onDeleteRoutine(routine) : undefined}
        onOptionsPress={onOptionsPress}
      />

      {/* Historial corto de sesiones de esta rutina */}
      <View
        style={[
          styles.historyCard,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.historyHeaderRow}>
          <View style={styles.historyTitleRow}>
            <GymIcon name="clock" size={16} color={colors.primary} />
            <Text style={[styles.historyTitle, { color: colors.text }]}>
              {t("routines.recentSessionsTitle")}
            </Text>
          </View>
          <View
            style={[
              styles.historyCountBadge,
              { backgroundColor: colors.primaryGlow },
            ]}
          >
            <Text
              style={[styles.historyCountText, { color: colors.primary }]}
            >
              {routineSessions.length}
            </Text>
          </View>
        </View>

        {routineSessions.length === 0 ? (
          <Text
            style={[styles.historyEmptyText, { color: colors.textSecondary }]}
          >
            {t("routines.noCompletedSessions")}
          </Text>
        ) : (
          <View style={styles.historyList}>
            {routineSessions.map((sessionItem, idx) => {
              const rawDate =
                sessionItem.ended_at ||
                sessionItem.end_time ||
                sessionItem.started_at ||
                sessionItem.start_time;
              const dateLabel = rawDate
                ? new Date(rawDate).toLocaleDateString(locale)
                : sessionItem.date || t("common.recent");
              const durationSec =
                typeof sessionItem.duration_seconds === "number"
                  ? sessionItem.duration_seconds
                  : (sessionItem.duration_minutes ?? 0) * 60;
              return (
                <View
                  key={sessionItem.id || `session-${idx}`}
                  style={[
                    styles.historyRow,
                    {
                      borderBottomColor: colors.borderSubtle,
                      borderBottomWidth:
                        idx === routineSessions.length - 1 ? 0 : 1,
                    },
                  ]}
                >
                  <View style={styles.historyDateCol}>
                    <GymIcon
                      name="calendar"
                      size={13}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[styles.historyDateText, { color: colors.text }]}
                    >
                      {dateLabel}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.historyDurationPill,
                      {
                        backgroundColor: colors.primaryGlow,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyDurationText,
                        { color: colors.primary },
                      ]}
                    >
                      {formatDurationHMS(durationSec)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  historyCard: {
    borderRadius: Radius.xl,
    padding: Spacing.three + 2,
    borderWidth: 1,
    gap: 10,
  },
  historyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  historyCountBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  historyCountText: {
    fontSize: 11,
    fontWeight: "800",
  },
  historyEmptyText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  historyList: {
    gap: 2,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
  },
  historyDateCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyDateText: {
    fontSize: 13,
    fontWeight: "700",
  },
  historyDurationPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  historyDurationText: {
    fontSize: 12,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
