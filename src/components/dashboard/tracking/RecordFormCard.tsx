import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { Routine } from "@/services/api";
import { DashboardColors, RoutineExerciseItem } from "../types";

export interface RecordFormCardProps {
  colors: DashboardColors;
  routines: Routine[];
  trackingRoutineId: string;
  trackingExerciseId: string;
  currentRoutineExercises: RoutineExerciseItem[];
  onSelectRoutine: (routineId: string) => void;
  onSelectExercise: (exerciseId: string) => void;
  recordWeight: string;
  setRecordWeight: (value: string) => void;
  recordReps: string;
  setRecordReps: (value: string) => void;
  recordRpe: string;
  setRecordRpe: (value: string) => void;
  savingRecord: boolean;
  onSave: () => void;
  lastSavedSummary: string | null;
  lockedRoutineTitle?: string | null;
}

/**
 * Card for logging a new lift record (Weight, Reps, and RPE)
 * and automatically calculating 1RM using the Brzycki formula.
 */
export const RecordFormCard: React.FC<RecordFormCardProps> = ({
  colors,
  routines,
  trackingRoutineId,
  trackingExerciseId,
  currentRoutineExercises,
  onSelectRoutine,
  onSelectExercise,
  recordWeight,
  setRecordWeight,
  recordReps,
  setRecordReps,
  recordRpe,
  setRecordRpe,
  savingRecord,
  onSave,
  lastSavedSummary,
  lockedRoutineTitle,
}) => {
  const { t } = useLanguage();
  const isRoutineLocked = Boolean(lockedRoutineTitle);

  return (
    <AnimatedCard
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <GymIcon name="flame" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("tracking.formTitle")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isRoutineLocked
              ? t("tracking.formSubtitleActive")
              : t("tracking.formSubtitle")}
          </Text>
        </View>
      </View>

      <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
        {isRoutineLocked
          ? t("tracking.activeSessionRoutineStep")
          : t("tracking.step1Routine")}
      </Text>
      {isRoutineLocked ? (
        <View
          style={[
            styles.lockedRoutineBox,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.lockedRoutineHeader}>
            <GymIcon name="lock" size={14} color={colors.primary} />
            <Text
              style={[styles.lockedRoutineText, { color: colors.primary }]}
              numberOfLines={1}
            >
              {lockedRoutineTitle}
            </Text>
          </View>
          <Text style={[styles.lockedHintText, { color: colors.textSecondary }]}>
            {t("tracking.activeSessionLockedHint")}
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {routines.map((r, idx) => {
            const active = trackingRoutineId === r.id;
            return (
              <Pressable
                key={`${r.id}-${idx}`}
                onPress={() => onSelectRoutine(r.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : colors.backgroundElevated,
                    borderColor: active
                      ? colors.primaryLight
                      : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? colors.onPrimary : colors.textSecondary },
                  ]}
                >
                  {r.title || (r as any).name || t("common.routineFallback")}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
        {t("tracking.step2Exercise")}
      </Text>
      {currentRoutineExercises.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {Array.from(
            new Map(currentRoutineExercises.map((e) => [e.id, e])).values(),
          ).map((ex, idx) => {
            const active = trackingExerciseId === ex.id;
            return (
              <Pressable
                key={`${ex.id}-${idx}`}
                onPress={() => onSelectExercise(ex.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : colors.backgroundElevated,
                    borderColor: active
                      ? colors.primaryLight
                      : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? colors.onPrimary : colors.textSecondary },
                  ]}
                >
                  {ex.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.emptyNotice,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="info" size={15} color={colors.textSecondary} />
          <Text style={[styles.emptyNoticeText, { color: colors.textSecondary }]}>
            {t("tracking.noRoutineExercises")}
          </Text>
        </View>
      )}

      <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
        {t("tracking.step3Data")}
      </Text>
      <View style={styles.inputsRow}>
        <View style={styles.inputCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            {t("tracking.weightLabel")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
            placeholder="80"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={recordWeight}
            onChangeText={setRecordWeight}
          />
        </View>

        <View style={styles.inputCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            {t("tracking.repsLabel")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
            placeholder="8"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={recordReps}
            onChangeText={setRecordReps}
          />
        </View>

        <View style={styles.inputCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            {t("tracking.rpeLabel")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
            placeholder="9"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={recordRpe}
            onChangeText={setRecordRpe}
          />
        </View>
      </View>

      <AppButton
        title={t("tracking.saveMarcaBtn")}
        icon="check"
        onPress={onSave}
        loading={savingRecord}
        disabled={currentRoutineExercises.length === 0 || !trackingExerciseId}
      />

      {lastSavedSummary && (
        <View
          style={[
            styles.summaryBanner,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <GymIcon name="check-circle" size={16} color={colors.primary} />
          <Text style={[styles.summaryText, { color: colors.primary }]}>
            {lastSavedSummary}
          </Text>
        </View>
      )}
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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 2,
  },
  lockedRoutineBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  lockedRoutineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  lockedRoutineText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
  },
  lockedHintText: {
    fontSize: 11,
    fontWeight: "600",
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  emptyNoticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  inputsRow: {
    flexDirection: "row",
    gap: 8,
  },
  inputCol: {
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  input: {
    height: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  summaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
});
