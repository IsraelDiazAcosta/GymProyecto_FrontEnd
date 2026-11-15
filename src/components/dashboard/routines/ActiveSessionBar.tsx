import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { WorkoutSessionItem } from "@/services/api";
import { DashboardColors } from "../types";

const defaultFormatDurationHMS = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

export interface ActiveSessionBarProps {
  colors: DashboardColors;
  activeSession: WorkoutSessionItem | null;
  elapsedSeconds: number;
  sessionActionLoading: boolean;
  finishedSummaryDuration: number | null;
  onStartPress?: () => void;
  onStartSessionPress?: () => void;
  onCancelSession: () => void;
  onFinishPress?: () => void;
  onFinishSessionPress?: () => void;
  onDismissFinishedSummary?: () => void;
  onDismissFinishedBanner?: () => void;
  formatDurationHMS?: (totalSeconds: number) => string;
}

export const ActiveSessionBar: React.FC<ActiveSessionBarProps> = ({
  colors,
  activeSession,
  elapsedSeconds,
  finishedSummaryDuration,
  sessionActionLoading,
  onStartPress,
  onStartSessionPress,
  onCancelSession,
  onFinishPress,
  onFinishSessionPress,
  onDismissFinishedSummary,
  onDismissFinishedBanner,
  formatDurationHMS = defaultFormatDurationHMS,
}) => {
  const handleStart = onStartPress || onStartSessionPress || (() => {});
  const handleFinish = onFinishPress || onFinishSessionPress || (() => {});
  const handleDismiss =
    onDismissFinishedSummary || onDismissFinishedBanner || (() => {});

  return (
    <View style={styles.sessionStickyWrap}>
      {activeSession ? (
        <View
          style={[
            styles.sessionBarActive,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.primary,
            },
          ]}
        >
          <View style={styles.sessionActiveTopRow}>
            <View style={styles.sessionInfoCol}>
              <View style={styles.sessionLiveRow}>
                <View
                  style={[
                    styles.sessionLiveDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
                <Text
                  style={[styles.sessionLiveLabel, { color: colors.primary }]}
                >
                  SESIÓN EN CURSO
                </Text>
              </View>
              <Text
                style={[styles.sessionRoutineName, { color: colors.text }]}
                numberOfLines={1}
              >
                {activeSession.routine_title ||
                  activeSession.title ||
                  "Rutina"}
              </Text>
            </View>

            <View
              style={[
                styles.timerBadge,
                {
                  backgroundColor: colors.primaryGlow,
                  borderColor: colors.border,
                },
              ]}
            >
              <GymIcon name="clock" size={14} color={colors.primary} />
              <Text style={[styles.timerText, { color: colors.primary }]}>
                {formatDurationHMS(elapsedSeconds)}
              </Text>
            </View>
          </View>

          <View style={styles.sessionActionsRow}>
            <Pressable
              onPress={onCancelSession}
              disabled={sessionActionLoading}
              style={[
                styles.cancelSessionBtn,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <GymIcon name="x" size={14} color={colors.textSecondary} />
              <Text
                style={[
                  styles.cancelSessionText,
                  { color: colors.textSecondary },
                ]}
              >
                Cancelar sesión
              </Text>
            </Pressable>

            <Pressable
              onPress={handleFinish}
              disabled={sessionActionLoading}
              style={[
                styles.finishSessionBtn,
                { backgroundColor: colors.primary },
              ]}
            >
              <GymIcon name="check" size={14} color={colors.onPrimary} />
              <Text
                style={[
                  styles.finishSessionText,
                  { color: colors.onPrimary },
                ]}
              >
                Finalizar
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <View
            style={[
              styles.sessionBarIdle,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <View style={styles.sessionIdleLeft}>
              <View
                style={[
                  styles.sessionIdleIcon,
                  {
                    backgroundColor: colors.primaryGlow,
                    borderColor: colors.border,
                  },
                ]}
              >
                <GymIcon name="play" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.sessionIdleTitle, { color: colors.text }]}
                >
                  Entrenamiento de hoy
                </Text>
                <Text
                  style={[
                    styles.sessionIdleSub,
                    { color: colors.textSecondary },
                  ]}
                >
                  Inicia el cronómetro al comenzar tu rutina
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleStart}
              disabled={sessionActionLoading}
              style={[
                styles.startSessionBtn,
                { backgroundColor: colors.primary },
              ]}
            >
              <GymIcon name="play" size={13} color={colors.onPrimary} />
              <Text
                style={[
                  styles.startSessionText,
                  { color: colors.onPrimary },
                ]}
              >
                Iniciar rutina
              </Text>
            </Pressable>
          </View>

          {finishedSummaryDuration !== null && (
            <View
              style={[
                styles.summarySessionBanner,
                {
                  backgroundColor: colors.primaryGlow,
                  borderColor: colors.border,
                },
              ]}
            >
              <GymIcon
                name="check-circle"
                size={16}
                color={colors.primary}
              />
              <Text
                style={[
                  styles.summarySessionText,
                  { color: colors.primary },
                ]}
              >
                Sesión completada • Duración total:{" "}
                {formatDurationHMS(finishedSummaryDuration)}
              </Text>
              <Pressable
                onPress={handleDismiss}
                hitSlop={8}
              >
                <GymIcon name="x" size={15} color={colors.primary} />
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sessionStickyWrap: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: 2,
  },
  sessionBarIdle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  sessionIdleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  sessionIdleIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionIdleTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  sessionIdleSub: {
    fontSize: 11,
    marginTop: 1,
  },
  startSessionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: Radius.pill,
  },
  startSessionText: {
    fontSize: 12,
    fontWeight: "900",
  },
  sessionBarActive: {
    padding: 12,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    gap: 10,
  },
  sessionActiveTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sessionInfoCol: {
    flex: 1,
    gap: 2,
  },
  sessionLiveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sessionLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  sessionLiveLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  sessionRoutineName: {
    fontSize: 15,
    fontWeight: "900",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  timerText: {
    fontSize: 15,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  sessionActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  cancelSessionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  cancelSessionText: {
    fontSize: 12,
    fontWeight: "800",
  },
  finishSessionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: Radius.md,
  },
  finishSessionText: {
    fontSize: 12,
    fontWeight: "900",
  },
  summarySessionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  summarySessionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
});
