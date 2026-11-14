import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { AnimatedToast } from "@/components/ui/AnimatedToast";
import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useGymDashboardData } from "@/hooks/useGymDashboardData";
import { api, WorkoutSessionItem } from "@/services/api";

import { AddExerciseModal } from "./catalog/AddExerciseModal";
import { CatalogSection } from "./catalog/CatalogSection";
import { ExerciseDetailModal } from "./catalog/ExerciseDetailModal";
import { DashboardHeader } from "./DashboardHeader";
import { dashboardStyles } from "./dashboardStyles";
import { DashboardTabBar } from "./DashboardTabBar";
import { AddEquipmentModal } from "./equipment/AddEquipmentModal";
import { EquipmentSection } from "./equipment/EquipmentSection";
import { ConfirmDeleteModal } from "./modals/ConfirmDeleteModal";
import { EditItemModal } from "./modals/EditItemModal";
import { ItemActionSheet } from "./modals/ItemActionSheet";
import { isExerciseCompatibleWithFocus } from "./muscleValidation";
import { ProfileSection } from "./profile/ProfileSection";
import { CreateRoutineCard } from "./routines/CreateRoutineCard";
import { RoutineCard } from "./routines/RoutineCard";
import { SelectExerciseModal } from "./routines/SelectExerciseModal";
import { MarcaFormCard } from "./tracking/MarcaFormCard";
import {
  MarcaHistoryList,
  RoutineSessionHistorySection,
} from "./tracking/MarcaHistoryList";
import { RMTrackingChart } from "./tracking/RMTrackingChart";

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

const formatDurationHMS = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

const computeElapsedSeconds = (session: WorkoutSessionItem | null) => {
  if (!session) return 0;
  const raw = session.started_at || session.start_time;
  const startMs = new Date(raw).getTime();
  if (isNaN(startMs)) return 0;
  return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
};

/**
 * Vista principal del Dashboard del Gimnasio ("Apex Emerald Gym").
 * Arquitectura modularizada y desacoplada mediante `useGymDashboardData` y subcarpetas por dominio.
 */
export const GymDashboard: React.FC = () => {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const { user } = useAuth();

  const vm = useGymDashboardData();
  const [routinesSubTab, setRoutinesSubTab] = useState<"crear" | "mis_rutinas">(
    "mis_rutinas",
  );
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(
    null,
  );
  const [trainedDayFlags, setTrainedDayFlags] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);
  const [activeSession, setActiveSession] = useState<WorkoutSessionItem | null>(
    null,
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSelectRoutineToStart, setShowSelectRoutineToStart] =
    useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [finishedSummaryDuration, setFinishedSummaryDuration] = useState<
    number | null
  >(null);
  const [routineHistoryList, setRoutineHistoryList] = useState<
    WorkoutSessionItem[]
  >([]);
  const [sessionActionLoading, setSessionActionLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nowLocal = new Date();
  const todayWeekIndex = (nowLocal.getDay() + 6) % 7;
  const trainedCount = trainedDayFlags.reduce((acc, val) => acc + val, 0);

  const loadWeeklyAndHistory = useCallback(async () => {
    try {
      const now = new Date();
      const currentDayIdx = (now.getDay() + 6) % 7;
      const monday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - currentDayIdx,
        0,
        0,
        0,
        0,
      );
      const sundayEnd = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + 6,
        23,
        59,
        59,
        999,
      );
      const toLocalKey = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const [weekSessions, allHistory] = await Promise.all([
        api.getRoutineSessionHistory({
          desde: monday.toISOString(),
          hasta: sundayEnd.toISOString(),
        }),
        api.getRoutineSessionHistory(),
      ]);

      const trainedSet = new Set<string>();
      (weekSessions || []).forEach((item) => {
        const raw =
          item.ended_at ||
          item.end_time ||
          item.started_at ||
          item.start_time ||
          (item.date ? `${item.date}T00:00:00` : "");
        if (!raw) return;
        const dt = new Date(raw);
        if (!isNaN(dt.getTime()) && dt >= monday && dt <= sundayEnd) {
          trainedSet.add(toLocalKey(dt));
        }
      });

      const flags = WEEK_DAYS.map((_, idx) => {
        const d = new Date(
          monday.getFullYear(),
          monday.getMonth(),
          monday.getDate() + idx,
          0,
          0,
          0,
          0,
        );
        return trainedSet.has(toLocalKey(d)) ? 1 : 0;
      });
      setTrainedDayFlags(flags);
      setRoutineHistoryList(allHistory || []);
    } catch {
      // Silenciar fallos puntuales de red sin alterar el flujo principal
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const restoreActiveSession = async () => {
      try {
        const active = await api.getActiveRoutineSession();
        if (!cancelled && active && active.status === "active") {
          setActiveSession(active);
          setElapsedSeconds(computeElapsedSeconds(active));
        }
      } catch {}
    };
    restoreActiveSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const startTimer = () => {
      stopTimer();
      if (!activeSession) return;
      setElapsedSeconds(computeElapsedSeconds(activeSession));
      timerRef.current = setInterval(() => {
        setElapsedSeconds(computeElapsedSeconds(activeSession));
      }, 1000);
    };

    if (!activeSession) {
      stopTimer();
      setElapsedSeconds(0);
      return;
    }

    if (AppState.currentState === "active") {
      startTimer();
    }

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        startTimer();
      } else {
        stopTimer();
      }
    });

    return () => {
      stopTimer();
      sub.remove();
    };
  }, [activeSession]);

  useEffect(() => {
    if (vm.activeTab !== "routines") return;
    loadWeeklyAndHistory();
  }, [vm.activeTab, routinesSubTab, loadWeeklyAndHistory]);

  const handleStartRoutineSession = async (routineId: string) => {
    try {
      setSessionActionLoading(true);
      const started = await api.startRoutineSession(routineId);
      setFinishedSummaryDuration(null);
      setActiveSession(started);
      setElapsedSeconds(computeElapsedSeconds(started));
      setShowSelectRoutineToStart(false);
    } catch {
      // Silenciar error puntual
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleConfirmFinishSession = async () => {
    try {
      setSessionActionLoading(true);
      const fallbackElapsed = computeElapsedSeconds(activeSession);
      const finished = await api.finishRoutineSession();
      const finalDuration = finished.duration_seconds ?? fallbackElapsed;
      setActiveSession(null);
      setElapsedSeconds(0);
      setShowFinishConfirm(false);
      setFinishedSummaryDuration(finalDuration);
      await loadWeeklyAndHistory();
    } catch {
      // Silenciar error puntual
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleCancelRoutineSession = async () => {
    try {
      setSessionActionLoading(true);
      await api.cancelRoutineSession();
      setActiveSession(null);
      setElapsedSeconds(0);
    } catch {
      // Silenciar error puntual
    } finally {
      setSessionActionLoading(false);
    }
  };

  useEffect(() => {
    if (
      vm.toast.visible &&
      vm.toast.type === "success" &&
      vm.toast.title === "Rutina Creada"
    ) {
      vm.setNewRoutineTitle("");
      vm.setNewRoutineExerciseIds([]);
      vm.setNewRoutineFocus("fullbody");
      setSelectedRoutineId(null);
      setRoutinesSubTab("mis_rutinas");
    }
  }, [vm.toast]);

  const selectedRoutineDetail = selectedRoutineId
    ? vm.routines.find((r) => r.id === selectedRoutineId) || null
    : null;

  const currentRoutineObj = vm.routines.find(
    (r) => r.id === vm.trackingRoutineId,
  );
  const currentRoutineExercises = vm.getExercisesOfRoutine(currentRoutineObj);

  const selectedRoutineSessions = selectedRoutineDetail
    ? routineHistoryList
        .filter(
          (s) =>
            s.routine_id === selectedRoutineDetail.id ||
            s.routine === selectedRoutineDetail.id ||
            (typeof s.routine === "object" &&
              s.routine?.id === selectedRoutineDetail.id),
        )
        .slice(0, 5)
    : [];

  return (
    <View
      style={[
        dashboardStyles.mainWrapper,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Cabecera superior con resumen y rol */}
      <DashboardHeader
        username={user?.username || "Atleta"}
        isAdmin={Boolean(user?.is_staff)}
        routinesCount={vm.routines.length}
        exercisesCount={vm.exercises.length}
        colors={colors}
      />

      {vm.loading && (
        <View style={localStyles.loadingBar}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      )}

      {/* Barra fija de sesión activa en la parte superior de Rutinas */}
      {vm.activeTab === "routines" && (
        <View style={localStyles.sessionStickyWrap}>
          {activeSession ? (
            <View
              style={[
                localStyles.sessionBarActive,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.primary,
                },
              ]}
            >
              <View style={localStyles.sessionActiveTopRow}>
                <View style={localStyles.sessionInfoCol}>
                  <View style={localStyles.sessionLiveRow}>
                    <View
                      style={[
                        localStyles.sessionLiveDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                    <Text
                      style={[
                        localStyles.sessionLiveLabel,
                        { color: colors.primary },
                      ]}
                    >
                      SESIÓN EN CURSO
                    </Text>
                  </View>
                  <Text
                    style={[
                      localStyles.sessionRoutineName,
                      { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {activeSession.routine_title ||
                      activeSession.title ||
                      "Rutina"}
                  </Text>
                </View>

                <View
                  style={[
                    localStyles.timerBadge,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <GymIcon name="clock" size={14} color={colors.primary} />
                  <Text
                    style={[localStyles.timerText, { color: colors.primary }]}
                  >
                    {formatDurationHMS(elapsedSeconds)}
                  </Text>
                </View>
              </View>

              <View style={localStyles.sessionActionsRow}>
                <Pressable
                  onPress={handleCancelRoutineSession}
                  disabled={sessionActionLoading}
                  style={[
                    localStyles.cancelSessionBtn,
                    {
                      backgroundColor: colors.backgroundElevated,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <GymIcon name="x" size={14} color={colors.textSecondary} />
                  <Text
                    style={[
                      localStyles.cancelSessionText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Cancelar sesión
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowFinishConfirm(true)}
                  disabled={sessionActionLoading}
                  style={[
                    localStyles.finishSessionBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <GymIcon name="check" size={14} color={colors.onPrimary} />
                  <Text
                    style={[
                      localStyles.finishSessionText,
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
                  localStyles.sessionBarIdle,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View style={localStyles.sessionIdleLeft}>
                  <View
                    style={[
                      localStyles.sessionIdleIcon,
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
                      style={[
                        localStyles.sessionIdleTitle,
                        { color: colors.text },
                      ]}
                    >
                      Entrenamiento de hoy
                    </Text>
                    <Text
                      style={[
                        localStyles.sessionIdleSub,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Inicia el cronómetro al comenzar tu rutina
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setShowSelectRoutineToStart(true)}
                  disabled={sessionActionLoading}
                  style={[
                    localStyles.startSessionBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <GymIcon name="play" size={13} color={colors.onPrimary} />
                  <Text
                    style={[
                      localStyles.startSessionText,
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
                    localStyles.summarySessionBanner,
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
                      localStyles.summarySessionText,
                      { color: colors.primary },
                    ]}
                  >
                    Sesión completada • Duración total:{" "}
                    {formatDurationHMS(finishedSummaryDuration)}
                  </Text>
                  <Pressable
                    onPress={() => setFinishedSummaryDuration(null)}
                    hitSlop={8}
                  >
                    <GymIcon name="x" size={15} color={colors.primary} />
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <ScrollView
        style={dashboardStyles.scrollArea}
        contentContainerStyle={dashboardStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ==================== TAB 1: RUTINAS ==================== */}
        {vm.activeTab === "routines" && (
          <View style={dashboardStyles.sectionBlock}>
            {/* Selector de sub-pestañas: Crear / Mis Rutinas */}
            <View
              style={[
                localStyles.subTabBar,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              {(
                [
                  { key: "crear", label: "Crear" },
                  { key: "mis_rutinas", label: "Mis Rutinas" },
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
                      localStyles.subTabBtn,
                      active && { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        localStyles.subTabText,
                        {
                          color: active
                            ? colors.onPrimary
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      {subTab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {routinesSubTab === "crear" && (
              <>
                <CreateRoutineCard
                  colors={colors}
                  newRoutineTitle={vm.newRoutineTitle}
                  setNewRoutineTitle={vm.setNewRoutineTitle}
                  newRoutineFocus={vm.newRoutineFocus}
                  setNewRoutineFocus={vm.setNewRoutineFocus}
                  selectedExercises={vm.exercises.filter(
                    (ex) =>
                      vm.newRoutineExerciseIds.includes(ex.id) &&
                      isExerciseCompatibleWithFocus(ex, vm.newRoutineFocus),
                  )}
                  onOpenSelectExercises={() => vm.setShowNewRoutineModal(true)}
                  onRemoveExercise={(id) =>
                    vm.setNewRoutineExerciseIds((prev) =>
                      prev.filter((x) => x !== id),
                    )
                  }
                  onCreate={vm.handleCreateRoutine}
                />

                {/* Gráfica semanal de asistencia */}
                <View
                  style={[
                    localStyles.weeklyCard,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <View style={localStyles.weeklyHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <View style={localStyles.weeklyKickerRow}>
                        <GymIcon
                          name="calendar"
                          size={14}
                          color={colors.primary}
                        />
                        <Text
                          style={[
                            localStyles.weeklyKicker,
                            { color: colors.primary },
                          ]}
                        >
                          ASISTENCIA SEMANAL
                        </Text>
                      </View>
                      <Text
                        style={[localStyles.weeklyTitle, { color: colors.text }]}
                      >
                        Entrenamientos de la semana
                      </Text>
                    </View>

                    <View
                      style={[
                        localStyles.weeklyCountBadge,
                        {
                          backgroundColor: colors.primaryGlow,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          localStyles.weeklyCountText,
                          { color: colors.primary },
                        ]}
                      >
                        {trainedCount}/7 días
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      localStyles.weeklyChartBox,
                      {
                        backgroundColor: colors.backgroundElevated,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <View style={localStyles.weeklyBarsRow}>
                      {WEEK_DAYS.map((dayLabel, idx) => {
                        const val = trainedDayFlags[idx] || 0;
                        const isTrained = val === 1;
                        const isToday = idx === todayWeekIndex;
                        return (
                          <View key={dayLabel} style={localStyles.weeklyBarCol}>
                            <Text
                              style={[
                                localStyles.weeklyBarValue,
                                {
                                  color: isTrained
                                    ? colors.primary
                                    : colors.textSecondary,
                                },
                              ]}
                            >
                              {val}
                            </Text>
                            <View
                              style={[
                                localStyles.weeklyBarTrack,
                                {
                                  backgroundColor: colors.backgroundElement,
                                  borderColor: isToday
                                    ? colors.primary
                                    : colors.borderSubtle,
                                  borderWidth: isToday ? 1.5 : 1,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  localStyles.weeklyBarFill,
                                  {
                                    height: isTrained ? "100%" : "0%",
                                    backgroundColor: colors.primary,
                                  },
                                ]}
                              />
                            </View>
                            <Text
                              style={[
                                localStyles.weeklyDayLabel,
                                {
                                  color: isToday
                                    ? colors.primary
                                    : isTrained
                                      ? colors.text
                                      : colors.textSecondary,
                                  fontWeight: isToday ? "900" : "700",
                                },
                              ]}
                            >
                              {dayLabel}
                            </Text>
                            {isToday ? (
                              <View
                                style={[
                                  localStyles.todayPill,
                                  { backgroundColor: colors.primaryGlow },
                                ]}
                              >
                                <Text
                                  style={[
                                    localStyles.todayPillText,
                                    { color: colors.primary },
                                  ]}
                                >
                                  Hoy
                                </Text>
                              </View>
                            ) : (
                              <View style={localStyles.todayPlaceholder} />
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {trainedCount === 0 && (
                      <Text
                        style={[
                          localStyles.weeklyEmptyText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Aún no entrenas esta semana
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}

            {routinesSubTab === "mis_rutinas" && !selectedRoutineDetail && (
              <>
                {vm.routines.length === 0 ? (
                  <View
                    style={[
                      localStyles.emptyStateCard,
                      {
                        backgroundColor: colors.backgroundElement,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <View
                      style={[
                        localStyles.emptyIconBadge,
                        {
                          backgroundColor: colors.primaryGlow,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <GymIcon name="layers" size={26} color={colors.primary} />
                    </View>
                    <Text
                      style={[localStyles.emptyTitle, { color: colors.text }]}
                    >
                      Aún no tienes rutinas
                    </Text>
                    <Text
                      style={[
                        localStyles.emptyMessage,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Crea tu primera rutina personalizada y añade ejercicios del
                      catálogo para empezar.
                    </Text>
                    <AppButton
                      title="Ir a Crear"
                      icon="plus"
                      onPress={() => setRoutinesSubTab("crear")}
                      style={{ width: "100%" }}
                    />
                  </View>
                ) : (
                  vm.routines.map((routine) => (
                    <RoutineCard
                      key={routine.id}
                      colors={colors}
                      routine={routine}
                      routineExercises={vm.getExercisesOfRoutine(routine)}
                      exercises={vm.exercises}
                      isAdding={false}
                      selectedExToAdd={vm.selectedExToAdd}
                      setSelectedExToAdd={vm.setSelectedExToAdd}
                      selectedExsToAdd={vm.selectedExsToAdd}
                      setSelectedExsToAdd={vm.setSelectedExsToAdd}
                      setsCount={vm.setsCount}
                      setSetsCount={vm.setSetsCount}
                      minReps={vm.minReps}
                      setMinReps={vm.setMinReps}
                      maxReps={vm.maxReps}
                      setMaxReps={vm.setMaxReps}
                      onStartAdding={() => {}}
                      onCancelAdding={() => {}}
                      onAddExercise={() => {}}
                      onUpdateRoutineExercise={vm.handleUpdateRoutineExercise}
                      onOptionsPress={() => vm.handleOpenRoutineOptions(routine)}
                      compact={true}
                      onPress={() => setSelectedRoutineId(routine.id)}
                    />
                  ))
                )}

                <RMTrackingChart
                  colors={colors}
                  routines={vm.routines}
                  trackingRoutineId={vm.trackingRoutineId}
                  trackingExerciseId={vm.trackingExerciseId}
                  marcaHistory={vm.marcaHistory}
                  exercises={currentRoutineExercises}
                  onSelectRoutine={vm.handleRoutineChangeInTracking}
                  onSelectExercise={(exerciseId: string) => {
                    vm.setTrackingExerciseId(exerciseId);
                    vm.loadProgressionHistory(exerciseId);
                  }}
                />
              </>
            )}

            {routinesSubTab === "mis_rutinas" && selectedRoutineDetail && (
              <>
                <Pressable
                  onPress={() => {
                    setSelectedRoutineId(null);
                    if (vm.selectedRoutineForAdd) {
                      vm.setSelectedRoutineForAdd(null);
                      vm.setSelectedExsToAdd([]);
                      vm.setSelectedExToAdd("");
                    }
                  }}
                  style={[
                    localStyles.backBtn,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <View style={{ transform: [{ rotate: "180deg" }] }}>
                    <GymIcon
                      name="chevron-right"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <Text
                    style={[localStyles.backBtnText, { color: colors.text }]}
                  >
                    Volver a Mis Rutinas
                  </Text>
                </Pressable>

                <RoutineCard
                  key={selectedRoutineDetail.id}
                  colors={colors}
                  routine={selectedRoutineDetail}
                  routineExercises={vm.getExercisesOfRoutine(
                    selectedRoutineDetail,
                  )}
                  exercises={vm.exercises}
                  isAdding={
                    vm.selectedRoutineForAdd === selectedRoutineDetail.id
                  }
                  selectedExToAdd={vm.selectedExToAdd}
                  setSelectedExToAdd={vm.setSelectedExToAdd}
                  selectedExsToAdd={vm.selectedExsToAdd}
                  setSelectedExsToAdd={vm.setSelectedExsToAdd}
                  setsCount={vm.setsCount}
                  setSetsCount={vm.setSetsCount}
                  minReps={vm.minReps}
                  setMinReps={vm.setMinReps}
                  maxReps={vm.maxReps}
                  setMaxReps={vm.setMaxReps}
                  onStartAdding={() => {
                    vm.setSelectedRoutineForAdd(selectedRoutineDetail.id);
                    const firstCompatible = vm.exercises.find((ex) =>
                      isExerciseCompatibleWithFocus(
                        ex,
                        selectedRoutineDetail.focus,
                      ),
                    );
                    vm.setSelectedExToAdd(
                      firstCompatible ? firstCompatible.id : "",
                    );
                    vm.setSelectedExsToAdd(
                      firstCompatible ? [firstCompatible.id] : [],
                    );
                  }}
                  onCancelAdding={() => {
                    vm.setSelectedRoutineForAdd(null);
                    vm.setSelectedExsToAdd([]);
                    vm.setSelectedExToAdd("");
                  }}
                  onAddExercise={() =>
                    vm.handleAddExerciseToRoutine(selectedRoutineDetail.id)
                  }
                  onUpdateRoutineExercise={vm.handleUpdateRoutineExercise}
                  onOptionsPress={() =>
                    vm.handleOpenRoutineOptions(selectedRoutineDetail)
                  }
                />

                {/* Historial corto de sesiones de esta rutina */}
                <View
                  style={[
                    localStyles.historyCard,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <View style={localStyles.historyHeaderRow}>
                    <View style={localStyles.historyTitleRow}>
                      <GymIcon name="clock" size={16} color={colors.primary} />
                      <Text
                        style={[localStyles.historyTitle, { color: colors.text }]}
                      >
                        Últimas sesiones
                      </Text>
                    </View>
                    <View
                      style={[
                        localStyles.historyCountBadge,
                        { backgroundColor: colors.primaryGlow },
                      ]}
                    >
                      <Text
                        style={[
                          localStyles.historyCountText,
                          { color: colors.primary },
                        ]}
                      >
                        {selectedRoutineSessions.length}
                      </Text>
                    </View>
                  </View>

                  {selectedRoutineSessions.length === 0 ? (
                    <Text
                      style={[
                        localStyles.historyEmptyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Aún no has completado sesiones para esta rutina.
                    </Text>
                  ) : (
                    <View style={localStyles.historyList}>
                      {selectedRoutineSessions.map((sessionItem, idx) => {
                        const rawDate =
                          sessionItem.ended_at ||
                          sessionItem.end_time ||
                          sessionItem.started_at ||
                          sessionItem.start_time;
                        const dateLabel = rawDate
                          ? new Date(rawDate).toLocaleDateString()
                          : sessionItem.date || "Reciente";
                        const durationSec =
                          typeof sessionItem.duration_seconds === "number"
                            ? sessionItem.duration_seconds
                            : (sessionItem.duration_minutes ?? 0) * 60;
                        return (
                          <View
                            key={sessionItem.id}
                            style={[
                              localStyles.historyRow,
                              {
                                borderBottomColor: colors.borderSubtle,
                                borderBottomWidth:
                                  idx === selectedRoutineSessions.length - 1
                                    ? 0
                                    : 1,
                              },
                            ]}
                          >
                            <View style={localStyles.historyDateCol}>
                              <GymIcon
                                name="calendar"
                                size={13}
                                color={colors.textSecondary}
                              />
                              <Text
                                style={[
                                  localStyles.historyDateText,
                                  { color: colors.text },
                                ]}
                              >
                                {dateLabel}
                              </Text>
                            </View>
                            <View
                              style={[
                                localStyles.historyDurationPill,
                                {
                                  backgroundColor: colors.primaryGlow,
                                  borderColor: colors.border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  localStyles.historyDurationText,
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
            )}
          </View>
        )}

        {/* ==================== TAB 2: PROGRESO / MARCAS ==================== */}
        {vm.activeTab === "tracking" && (
          <View style={dashboardStyles.sectionBlock}>
            <MarcaFormCard
              colors={colors}
              routines={vm.routines}
              trackingRoutineId={vm.trackingRoutineId}
              trackingExerciseId={vm.trackingExerciseId}
              currentRoutineExercises={currentRoutineExercises}
              onSelectRoutine={vm.handleRoutineChangeInTracking}
              onSelectExercise={(exerciseId: string) => {
                vm.setTrackingExerciseId(exerciseId);
                vm.loadProgressionHistory(exerciseId);
              }}
              marcaWeight={vm.marcaWeight}
              setMarcaWeight={vm.setMarcaWeight}
              marcaReps={vm.marcaReps}
              setMarcaReps={vm.setMarcaReps}
              marcaRpe={vm.marcaRpe}
              setMarcaRpe={vm.setMarcaRpe}
              savingMarca={vm.savingMarca}
              onSave={vm.handleSaveMarca}
              lastSavedSummary={vm.lastSavedSummary}
            />

            <MarcaHistoryList
              colors={colors}
              marcaHistory={vm.marcaHistory}
              onMarcaOptionsPress={vm.handleOpenMarcaOptions}
            />

            <RoutineSessionHistorySection
              colors={colors}
              routines={vm.routines}
              refreshTrigger={routineHistoryList}
            />
          </View>
        )}

        {/* ==================== TAB 3: CATÁLOGO ==================== */}
        {vm.activeTab === "catalog" && (
          <CatalogSection
            colors={colors}
            exercises={vm.exercises}
            equipmentList={vm.equipmentList}
            isStaff={user?.is_staff}
            onOpenAddExercise={() => {
              vm.loadCatalogExtras();
              vm.setShowAddExerciseModal(true);
            }}
            onOpenExerciseDetail={vm.openExerciseDetail}
            onExerciseOptionsPress={vm.handleOpenExerciseOptions}
          />
        )}

        {/* ==================== TAB 4: MÁQUINAS Y EQUIPOS ==================== */}
        {vm.activeTab === "equipment" && (
          <EquipmentSection
            colors={colors}
            equipmentList={vm.equipmentList}
            onOpenAddEquipment={() => vm.setShowAddEquipmentModal(true)}
            onEquipmentOptionsPress={vm.handleOpenEquipmentOptions}
            onToggleFavorite={vm.handleToggleEquipmentFavorite}
          />
        )}

        {/* ==================== TAB 5: PERFIL / ADMIN ==================== */}
        {vm.activeTab === "profile" && (
          <ProfileSection
            colors={colors}
            exercises={vm.exercises}
            showAdminUsers={vm.showAdminUsers}
            adminUsers={vm.adminUsers}
            onLoadAdminUsers={vm.loadAdminUsers}
          />
        )}
      </ScrollView>

      {/* Barra de pestañas inferior fija */}
      <DashboardTabBar
        colors={colors}
        activeTab={vm.activeTab}
        onSelectTab={(tab) => {
          vm.setActiveTab(tab);
          if (tab === "catalog" || tab === "equipment") {
            vm.loadCatalogExtras();
          }
        }}
      />

      {/* ==================== MODALES GLOBALES ==================== */}
      <ExerciseDetailModal
        colors={colors}
        visible={vm.modalExerciseVisible}
        exercise={vm.selectedExercise}
        equipmentList={vm.equipmentList}
        onClose={() => vm.setModalExerciseVisible(false)}
      />

      <SelectExerciseModal
        visible={vm.showNewRoutineModal}
        colors={colors}
        exercises={vm.exercises}
        equipmentList={vm.equipmentList}
        routineFocus={vm.newRoutineFocus}
        selectedExerciseIds={vm.newRoutineExerciseIds}
        multiSelect={true}
        onConfirmSelection={(ids) => vm.setNewRoutineExerciseIds(ids)}
        onClose={() => vm.setShowNewRoutineModal(false)}
      />

      <AddExerciseModal
        colors={colors}
        visible={vm.showAddExerciseModal}
        newExName={vm.newExName}
        setNewExName={vm.setNewExName}
        newExVideo={vm.newExVideo}
        setNewExVideo={vm.setNewExVideo}
        newExInstructions={vm.newExInstructions}
        setNewExInstructions={vm.setNewExInstructions}
        equipmentList={vm.equipmentList}
        selectedEquipment={vm.newExEquipment}
        setSelectedEquipment={vm.setNewExEquipment}
        muscleList={vm.muscleList}
        selectedMuscle={vm.newExMuscle}
        setSelectedMuscle={vm.setNewExMuscle}
        newExImage={vm.newExImage}
        setNewExImage={vm.setNewExImage}
        onSubmit={vm.handleCreateExercise}
        onClose={() => vm.setShowAddExerciseModal(false)}
      />

      <AddEquipmentModal
        colors={colors}
        visible={vm.showAddEquipmentModal}
        onSubmit={vm.handleCreateEquipment}
        onClose={() => vm.setShowAddEquipmentModal(false)}
      />

      <ItemActionSheet
        visible={Boolean(vm.actionSheetItem)}
        colors={colors}
        itemType={vm.actionSheetItem?.type || "routine"}
        itemTitle={vm.actionSheetItem?.title || ""}
        itemSubtitle={vm.actionSheetItem?.subtitle}
        onEdit={() => {
          vm.setEditModalItem(vm.actionSheetItem);
          vm.setActionSheetItem(null);
        }}
        onDelete={() => {
          if (vm.actionSheetItem) {
            vm.setDeleteConfirmItem({
              type: vm.actionSheetItem.type,
              id: String(vm.actionSheetItem.data.id),
              title: vm.actionSheetItem.title,
            });
          }
          vm.setActionSheetItem(null);
        }}
        onClose={() => vm.setActionSheetItem(null)}
      />

      <EditItemModal
        visible={Boolean(vm.editModalItem)}
        colors={colors}
        itemType={vm.editModalItem?.type || "routine"}
        routineData={
          vm.editModalItem?.type === "routine" ? vm.editModalItem.data : null
        }
        exerciseData={
          vm.editModalItem?.type === "exercise"
            ? {
                id: vm.editModalItem.data.id,
                name: vm.editModalItem.data.name,
                equipment_id:
                  vm.editModalItem.data.equipment?.id ||
                  vm.editModalItem.data.equipment_id ||
                  null,
                instructions: vm.editModalItem.data.instructions || "",
                video_url:
                  vm.editModalItem.data.media?.[0]?.external_url ||
                  vm.editModalItem.data.video_url ||
                  "",
                muscle_id: vm.editModalItem.data.muscles?.[0]?.muscle || null,
                image:
                  vm.editModalItem.data.image ||
                  vm.editModalItem.data.image_url ||
                  vm.editModalItem.data.thumbnail ||
                  null,
              }
            : null
        }
        marcaData={
          vm.editModalItem?.type === "marca"
            ? {
                id: vm.editModalItem.data.id,
                weight: vm.editModalItem.data.weight,
                reps: vm.editModalItem.data.reps,
                rpe: vm.editModalItem.data.rpe,
              }
            : null
        }
        equipmentData={
          vm.editModalItem?.type === "equipment" ? vm.editModalItem.data : null
        }
        equipmentList={vm.equipmentList}
        muscleList={vm.muscleList}
        allExercises={vm.exercises}
        onSaveRoutine={vm.handleSaveRoutineEdit}
        onSaveExercise={vm.handleSaveExerciseEdit}
        onSaveMarca={vm.handleSaveMarcaEdit}
        onSaveEquipment={vm.handleSaveEquipmentEdit}
        onRemoveExerciseFromRoutine={vm.handleRemoveExerciseFromRoutine}
        onAddExerciseToRoutine={vm.handleAddExerciseToRoutineInEdit}
        onUpdateRoutineExercise={vm.handleUpdateRoutineExercise}
        onClose={() => vm.setEditModalItem(null)}
      />

      <ConfirmDeleteModal
        visible={Boolean(vm.deleteConfirmItem)}
        colors={colors}
        itemTitle={vm.deleteConfirmItem?.title || ""}
        itemType={vm.deleteConfirmItem?.type || "routine"}
        onConfirm={vm.handleConfirmDelete}
        onClose={() => vm.setDeleteConfirmItem(null)}
      />

      {/* Selector de rutina para iniciar sesión */}
      <Modal
        visible={showSelectRoutineToStart}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSelectRoutineToStart(false)}
      >
        <View
          style={[localStyles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              localStyles.modalCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={localStyles.modalHeader}>
              <Text style={[localStyles.modalTitle, { color: colors.text }]}>
                Elegir rutina a iniciar
              </Text>
              <Pressable
                onPress={() => setShowSelectRoutineToStart(false)}
                hitSlop={8}
              >
                <GymIcon name="x" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {vm.routines.length === 0 ? (
              <View style={{ gap: 12, paddingVertical: 8 }}>
                <Text
                  style={[
                    localStyles.modalEmptyText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Primero crea una rutina para poder iniciar una sesión.
                </Text>
                <AppButton
                  title="Ir a Crear"
                  icon="plus"
                  onPress={() => {
                    setShowSelectRoutineToStart(false);
                    setRoutinesSubTab("crear");
                  }}
                />
              </View>
            ) : (
              <ScrollView
                style={{ maxHeight: 320 }}
                contentContainerStyle={{ gap: 8 }}
                showsVerticalScrollIndicator={false}
              >
                {vm.routines.map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => handleStartRoutineSession(r.id)}
                    disabled={sessionActionLoading}
                    style={[
                      localStyles.routinePickItem,
                      {
                        backgroundColor: colors.backgroundElevated,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={[
                          localStyles.routinePickTitle,
                          { color: colors.text },
                        ]}
                      >
                        {r.title}
                      </Text>
                      <Text
                        style={[
                          localStyles.routinePickMeta,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {(r.focus || "fullbody").toUpperCase()} •{" "}
                        {vm.getExercisesOfRoutine(r).length} ejercicio(s)
                      </Text>
                    </View>
                    <View
                      style={[
                        localStyles.routinePickPlay,
                        { backgroundColor: colors.primaryGlow },
                      ]}
                    >
                      <GymIcon name="play" size={14} color={colors.primary} />
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Confirmación de finalizar sesión */}
      <Modal
        visible={showFinishConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowFinishConfirm(false)}
      >
        <View
          style={[localStyles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              localStyles.modalCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                localStyles.confirmIconHalo,
                {
                  backgroundColor: colors.primaryGlow,
                  borderColor: colors.border,
                },
              ]}
            >
              <GymIcon name="check-circle" size={28} color={colors.primary} />
            </View>
            <Text style={[localStyles.modalTitle, { color: colors.text }]}>
              ¿Finalizar sesión?
            </Text>
            <Text
              style={[
                localStyles.modalEmptyText,
                { color: colors.textSecondary },
              ]}
            >
              {activeSession?.routine_title || activeSession?.title || "Rutina"}{" "}
              • Tiempo transcurrido: {formatDurationHMS(elapsedSeconds)}
            </Text>
            <View style={localStyles.confirmActionsRow}>
              <AppButton
                title="Seguir"
                variant="outline"
                onPress={() => setShowFinishConfirm(false)}
                disabled={sessionActionLoading}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Finalizar"
                icon="check"
                loading={sessionActionLoading}
                onPress={handleConfirmFinishSession}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <AnimatedToast toast={vm.toast} onHide={vm.hideToast} />
    </View>
  );
};

const localStyles = StyleSheet.create({
  loadingBar: {
    paddingVertical: 4,
    alignItems: "center",
  },
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
  weeklyCard: {
    borderRadius: Radius.xl,
    padding: Spacing.three + 2,
    borderWidth: 1,
    gap: 12,
  },
  weeklyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  weeklyKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  weeklyKicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  weeklyTitle: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  weeklyCountBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  weeklyCountText: {
    fontSize: 12,
    fontWeight: "900",
  },
  weeklyChartBox: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 10,
  },
  weeklyBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  weeklyBarCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  weeklyBarValue: {
    fontSize: 11,
    fontWeight: "800",
  },
  weeklyBarTrack: {
    width: 24,
    height: 76,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
    marginVertical: 4,
  },
  weeklyBarFill: {
    width: "100%",
    borderRadius: 8,
  },
  weeklyDayLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  todayPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  todayPillText: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  todayPlaceholder: {
    height: 15,
  },
  weeklyEmptyText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  modalEmptyText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  routinePickItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  routinePickTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  routinePickMeta: {
    fontSize: 11,
    fontWeight: "600",
  },
  routinePickPlay: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmIconHalo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  confirmActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
});
