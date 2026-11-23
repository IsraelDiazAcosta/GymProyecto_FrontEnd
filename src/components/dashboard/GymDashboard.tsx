import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AnimatedToast } from "@/components/ui/AnimatedToast";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAppTheme } from "@/context/ThemeContext";
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
import { ProfileSection } from "./profile/ProfileSection";
import { ActiveSessionBar } from "./routines/ActiveSessionBar";
import { FinishSessionConfirmModal } from "./routines/FinishSessionConfirmModal";
import { RoutinesSection } from "./routines/RoutinesSection";
import { SelectExerciseModal } from "./routines/SelectExerciseModal";
import { SelectRoutineToStartModal } from "./routines/SelectRoutineToStartModal";
import { MarcaFormCard } from "./tracking/MarcaFormCard";
import {
  MarcaHistoryList,
  RoutineSessionHistorySection,
} from "./tracking/MarcaHistoryList";

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

const computeElapsedSeconds = (session: WorkoutSessionItem | null) => {
  if (!session) return 0;
  const raw = session.started_at || session.start_time;
  const startMs = new Date(raw).getTime();
  if (isNaN(startMs)) return 0;
  return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
};

type SessionPayloadWithExercises = WorkoutSessionItem & {
  exercises?: Array<{
    exercise_id?: string;
    unrecorded?: boolean;
    sets?: unknown[];
  }>;
  logged_exercises?: Array<{
    exercise?: string;
    logged_sets?: number;
  }>;
};

const getSessionRoutineId = (
  session: WorkoutSessionItem | null,
): string | null => {
  if (!session) return null;
  if (session.routine_id) return session.routine_id;
  if (session.routine_detail?.id) return session.routine_detail.id;
  if (typeof session.routine === "string") return session.routine;
  if (
    session.routine &&
    typeof session.routine === "object" &&
    session.routine.id
  ) {
    return session.routine.id;
  }
  return null;
};

const extractLoggedExerciseIds = (
  session: SessionPayloadWithExercises | null | undefined,
): string[] => {
  if (!session) return [];
  const ids = new Set<string>();
  if (Array.isArray(session.exercises)) {
    session.exercises.forEach((ex) => {
      if (
        ex.exercise_id &&
        ((Array.isArray(ex.sets) && ex.sets.length > 0) ||
          ex.unrecorded === false)
      ) {
        ids.add(String(ex.exercise_id));
      }
    });
  }
  if (Array.isArray(session.logged_exercises)) {
    session.logged_exercises.forEach((le) => {
      if (le.exercise && (le.logged_sets ?? 0) > 0) {
        ids.add(String(le.exercise));
      }
    });
  }
  return Array.from(ids);
};

/**
 * Vista principal del Dashboard del Gimnasio ("Apex Emerald Gym").
 * Arquitectura modularizada y desacoplada mediante `useGymDashboardData` y subcarpetas por dominio.
 */
export const GymDashboard: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
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
  const [lastFinishedRoutineId, setLastFinishedRoutineId] = useState<
    string | null
  >(null);
  const [routineHistoryList, setRoutineHistoryList] = useState<
    WorkoutSessionItem[]
  >([]);
  const [sessionActionLoading, setSessionActionLoading] = useState(false);
  const [sessionMarcasCount, setSessionMarcasCount] = useState(0);
  const [sessionLoggedExerciseIds, setSessionLoggedExerciseIds] = useState<
    string[]
  >([]);
  const [missingFinishExercises, setMissingFinishExercises] = useState<
    string[]
  >([]);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didMountTabRef = useRef(false);
  const silentSyncRef = useRef<() => void>(() => {});

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
          setSessionLoggedExerciseIds(extractLoggedExerciseIds(active));
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

  const handleManualRefresh = async () => {
    await Promise.all([
      vm.refreshAllData({ silent: false, force: true }),
      loadWeeklyAndHistory(),
    ]);
    setHistoryRefreshKey((prev) => prev + 1);
  };

  silentSyncRef.current = () => {
    vm.refreshAllData({ silent: true });
    loadWeeklyAndHistory();
    setHistoryRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (!didMountTabRef.current) {
      didMountTabRef.current = true;
      return;
    }
    if (
      vm.activeTab === "catalog" ||
      vm.activeTab === "equipment" ||
      vm.activeTab === "routines" ||
      vm.activeTab === "tracking"
    ) {
      silentSyncRef.current();
    }
  }, [vm.activeTab]);

  useEffect(() => {
    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        silentSyncRef.current();
      }
    });

    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleFocus = () => silentSyncRef.current();
      const handleVisibility = () => {
        if (
          typeof document !== "undefined" &&
          document.visibilityState === "visible"
        ) {
          silentSyncRef.current();
        }
      };
      window.addEventListener("focus", handleFocus);
      if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", handleVisibility);
      }
      return () => {
        appStateSub.remove();
        window.removeEventListener("focus", handleFocus);
        if (typeof document !== "undefined") {
          document.removeEventListener("visibilitychange", handleVisibility);
        }
      };
    }

    return () => {
      appStateSub.remove();
    };
  }, []);

  const handleStartRoutineSession = async (routineId: string) => {
    try {
      setSessionActionLoading(true);
      const started = await api.startRoutineSession(routineId);
      setFinishedSummaryDuration(null);
      setSessionMarcasCount(0);
      setSessionLoggedExerciseIds(extractLoggedExerciseIds(started));
      setMissingFinishExercises([]);
      setActiveSession(started);
      setElapsedSeconds(computeElapsedSeconds(started));
      setShowSelectRoutineToStart(false);
      vm.handleRoutineChangeInTracking(routineId);
    } catch {
      // Silenciar error puntual
    } finally {
      setSessionActionLoading(false);
    }
  };

  const hasRecordedMarcaInSession =
    sessionMarcasCount > 0 ||
    sessionLoggedExerciseIds.length > 0 ||
    Boolean(
      activeSession &&
      activeSession.started_at &&
      vm.marcaHistory.some((m) => {
        const sessionStart = new Date(activeSession.started_at).getTime();
        const raw =
          (m as any).logged_at || (m as any).created_at || (m as any).date;
        if (!raw) return false;
        const marcaTime = new Date(raw).getTime();
        return !isNaN(marcaTime) && marcaTime >= sessionStart - 60000;
      }),
    );

  const computeMissingExercisesForSession = (
    loggedIds: Set<string>,
    sessionRef: WorkoutSessionItem | null,
    detailExercises?: Array<{
      exercise_id: string;
      exercise_name: string;
      unrecorded: boolean;
      sets?: unknown[];
    }>,
  ): string[] => {
    const routineId = getSessionRoutineId(sessionRef);
    const routineObj = routineId
      ? vm.routines.find((r) => r.id === routineId)
      : undefined;
    const plannedRaw = vm.getExercisesOfRoutine(routineObj);

    const seenIds = new Set<string>();
    const missing: string[] = [];

    if (plannedRaw.length > 0) {
      plannedRaw.forEach((ex) => {
        if (!ex.id || seenIds.has(ex.id)) return;
        seenIds.add(ex.id);
        if (!loggedIds.has(ex.id)) {
          missing.push(ex.name);
        }
      });
      return missing;
    }

    if (Array.isArray(detailExercises)) {
      detailExercises.forEach((ex) => {
        if (!ex.exercise_id || seenIds.has(ex.exercise_id)) return;
        seenIds.add(ex.exercise_id);
        const hasSets =
          loggedIds.has(ex.exercise_id) ||
          (Array.isArray(ex.sets) && ex.sets.length > 0) ||
          ex.unrecorded === false;
        if (!hasSets && ex.exercise_name) {
          missing.push(ex.exercise_name);
        }
      });
    }

    return missing;
  };

  const handleAttemptFinishSession = async () => {
    if (!activeSession?.id) {
      if (!hasRecordedMarcaInSession) {
        vm.showToast(
          "warning",
          t("toasts.marcaRequiredTitle"),
          t("toasts.marcaRequiredMsg"),
        );
        return;
      }
      setMissingFinishExercises([]);
      setShowFinishConfirm(true);
      return;
    }

    try {
      setSessionActionLoading(true);
      const detail = await api.getWorkoutSessionDetail(activeSession.id);
      const detailLoggedIds = extractLoggedExerciseIds(detail);
      setSessionLoggedExerciseIds(detailLoggedIds);

      const hasAnySet = Boolean(
        detail.has_logged_sets || detailLoggedIds.length > 0,
      );
      if (!hasAnySet) {
        vm.showToast(
          "warning",
          t("toasts.marcaRequiredTitle"),
          t("toasts.marcaRequiredMsg"),
        );
        return;
      }

      if (detail.has_logged_sets) {
        setSessionMarcasCount((prev) => Math.max(prev, 1));
      }

      const missing = computeMissingExercisesForSession(
        new Set(detailLoggedIds),
        detail || activeSession,
        detail.exercises,
      );
      setMissingFinishExercises(missing);
      setShowFinishConfirm(true);
    } catch {
      if (!hasRecordedMarcaInSession) {
        vm.showToast(
          "warning",
          t("toasts.marcaRequiredTitle"),
          t("toasts.marcaRequiredMsg"),
        );
        return;
      }
      const missing = computeMissingExercisesForSession(
        new Set(sessionLoggedExerciseIds),
        activeSession,
      );
      setMissingFinishExercises(missing);
      setShowFinishConfirm(true);
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleConfirmFinishSession = async () => {
    if (!hasRecordedMarcaInSession) {
      setShowFinishConfirm(false);
      vm.showToast(
        "warning",
        t("toasts.marcaRequiredTitle"),
        t("toasts.marcaRequiredMsg"),
      );
      return;
    }
    try {
      setSessionActionLoading(true);
      const fallbackElapsed = computeElapsedSeconds(activeSession);
      const finished = await api.finishRoutineSession();
      const finalDuration = finished.duration_seconds ?? fallbackElapsed;
      setActiveSession(null);
      setElapsedSeconds(0);
      setSessionMarcasCount(0);
      setSessionLoggedExerciseIds([]);
      setMissingFinishExercises([]);
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
      setFinishedSummaryDuration(null);
      setSessionMarcasCount(0);
      setSessionLoggedExerciseIds([]);
      setMissingFinishExercises([]);
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
      vm.toast.code === "routine_created"
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

  const isAdmin = Boolean(user?.is_staff);
  const canManageItem = (type?: string) =>
    isAdmin || (type !== "exercise" && type !== "equipment");
  const canRegisterMarca = Boolean(activeSession !== null);

  return (
    <View
      style={[
        dashboardStyles.mainWrapper,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Cabecera superior con resumen y rol */}
      <DashboardHeader
        username={user?.username || t("header.defaultAthlete")}
        isAdmin={Boolean(user?.is_staff)}
        routinesCount={vm.routines.length}
        exercisesCount={vm.exercises.length}
        colors={colors}
        trainedCount={trainedCount}
        onRefresh={handleManualRefresh}
        refreshing={vm.refreshing}
      />

      {vm.loading && (
        <View style={localStyles.loadingBar}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      )}

      {/* Barra fija de sesión activa en la parte superior de Progreso */}
      {vm.activeTab === "tracking" && (
        <ActiveSessionBar
          colors={colors}
          activeSession={activeSession}
          elapsedSeconds={elapsedSeconds}
          sessionActionLoading={sessionActionLoading}
          finishedSummaryDuration={finishedSummaryDuration}
          onStartPress={() => setShowSelectRoutineToStart(true)}
          onCancelSession={handleCancelRoutineSession}
          onFinishPress={handleAttemptFinishSession}
          onDismissFinishedSummary={() => setFinishedSummaryDuration(null)}
        />
      )}

      <ScrollView
        style={dashboardStyles.scrollArea}
        contentContainerStyle={dashboardStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={handleManualRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ==================== TAB 1: RUTINAS ==================== */}
        {vm.activeTab === "routines" && (
          <View style={dashboardStyles.sectionBlock}>
            <RoutinesSection
              colors={colors}
              routinesSubTab={routinesSubTab}
              setRoutinesSubTab={setRoutinesSubTab}
              selectedRoutineId={selectedRoutineId}
              setSelectedRoutineId={setSelectedRoutineId}
              routines={vm.routines}
              exercises={vm.exercises}
              getExercisesOfRoutine={vm.getExercisesOfRoutine}
              newRoutineTitle={vm.newRoutineTitle}
              setNewRoutineTitle={vm.setNewRoutineTitle}
              newRoutineFocus={vm.newRoutineFocus}
              setNewRoutineFocus={vm.setNewRoutineFocus}
              newRoutineExerciseIds={vm.newRoutineExerciseIds}
              setNewRoutineExerciseIds={vm.setNewRoutineExerciseIds}
              onOpenSelectExercises={() => vm.setShowNewRoutineModal(true)}
              onCreateRoutine={vm.handleCreateRoutine}
              trainedDayFlags={trainedDayFlags}
              todayWeekIndex={todayWeekIndex}
              trainedCount={trainedCount}
              selectedRoutineForAdd={vm.selectedRoutineForAdd}
              setSelectedRoutineForAdd={vm.setSelectedRoutineForAdd}
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
              onAddExerciseToRoutine={vm.handleAddExerciseToRoutine}
              onUpdateRoutineExercise={vm.handleUpdateRoutineExercise}
              onOpenRoutineOptions={vm.handleOpenRoutineOptions}
              onDeleteRoutine={(routine) => {
                setSelectedRoutineId(null);
                vm.setDeleteConfirmItem({
                  type: "routine",
                  id: String(routine.id),
                  title: routine.title || t("common.routineFallback"),
                });
              }}
              routineSessions={selectedRoutineSessions}
              trackingRoutineId={vm.trackingRoutineId}
              trackingExerciseId={vm.trackingExerciseId}
              marcaHistory={vm.marcaHistory}
              currentRoutineExercises={currentRoutineExercises}
              onTrackingSelectRoutine={vm.handleRoutineChangeInTracking}
              onTrackingSelectExercise={(exerciseId: string) => {
                vm.setTrackingExerciseId(exerciseId);
                vm.loadProgressionHistory(exerciseId);
              }}
            />
          </View>
        )}

        {/* ==================== TAB 2: PROGRESO / MARCAS ==================== */}
        {vm.activeTab === "tracking" && (
          <View style={dashboardStyles.sectionBlock}>
            {!canRegisterMarca ? (
              <View
                style={[
                  localStyles.lockStateCard,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View
                  style={[
                    localStyles.lockIconBadge,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <GymIcon name="lock" size={26} color={colors.primary} />
                </View>

                <Text style={[localStyles.lockTitle, { color: colors.text }]}>
                  {t("tracking.lockTitle")}
                </Text>

                <Text
                  style={[
                    localStyles.lockMessage,
                    { color: colors.textSecondary },
                  ]}
                >
                  {t("tracking.lockMessage")}
                </Text>
              </View>
            ) : (
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
                onSave={async () => {
                  const savedExerciseId = vm.trackingExerciseId;
                  const ok = await vm.handleSaveMarca();
                  if (ok) {
                    setSessionMarcasCount((prev) => prev + 1);
                    if (savedExerciseId) {
                      setSessionLoggedExerciseIds((prev) =>
                        prev.includes(savedExerciseId)
                          ? prev
                          : [...prev, savedExerciseId],
                      );
                    }
                  }
                }}
                lastSavedSummary={vm.lastSavedSummary}
              />
            )}

            <MarcaHistoryList
              colors={colors}
              marcaHistory={vm.marcaHistory}
              onMarcaOptionsPress={vm.handleOpenMarcaOptions}
              currentRoutineExercises={currentRoutineExercises}
              trackingExerciseId={vm.trackingExerciseId}
              onSelectExercise={(exerciseId: string) => {
                vm.setTrackingExerciseId(exerciseId);
                vm.loadProgressionHistory(exerciseId);
              }}
            />

            <RoutineSessionHistorySection
              colors={colors}
              routines={vm.routines}
              refreshTrigger={`${routineHistoryList[0]?.id ?? "none"}-${routineHistoryList.length}-${historyRefreshKey}`}
              onNotify={vm.showToast}
              onSessionDeleted={async () => {
                await loadWeeklyAndHistory();
                if (vm.trackingExerciseId) {
                  await vm.loadProgressionHistory(vm.trackingExerciseId);
                }
              }}
            />
          </View>
        )}

        {/* ==================== TAB 3: CATÁLOGO ==================== */}
        {vm.activeTab === "catalog" && (
          <CatalogSection
            colors={colors}
            exercises={vm.exercises}
            equipmentList={vm.equipmentList}
            isStaff={isAdmin}
            onOpenAddExercise={
              isAdmin
                ? () => {
                    vm.loadCatalogExtras();
                    vm.setShowAddExerciseModal(true);
                  }
                : undefined
            }
            onOpenExerciseDetail={vm.openExerciseDetail}
            onExerciseOptionsPress={
              isAdmin ? vm.handleOpenExerciseOptions : undefined
            }
            onToggleFavorite={vm.handleToggleExerciseFavorite}
          />
        )}

        {/* ==================== TAB 4: MÁQUINAS Y EQUIPOS ==================== */}
        {vm.activeTab === "equipment" && (
          <EquipmentSection
            colors={colors}
            equipmentList={vm.equipmentList}
            isStaff={isAdmin}
            onOpenAddEquipment={
              isAdmin ? () => vm.setShowAddEquipmentModal(true) : undefined
            }
            onEquipmentOptionsPress={
              isAdmin ? vm.handleOpenEquipmentOptions : undefined
            }
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
            trainedDayFlags={trainedDayFlags}
            todayWeekIndex={todayWeekIndex}
            trainedCount={trainedCount}
          />
        )}
      </ScrollView>

      {/* Barra de navegación inferior */}
      <DashboardTabBar
        activeTab={vm.activeTab}
        colors={colors}
        onSelectTab={vm.setActiveTab}
      />

      {/* ==================== MODALES ==================== */}
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

      {isAdmin && (
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
      )}

      {isAdmin && (
        <AddEquipmentModal
          colors={colors}
          visible={vm.showAddEquipmentModal}
          onSubmit={vm.handleCreateEquipment}
          onClose={() => vm.setShowAddEquipmentModal(false)}
        />
      )}

      <ItemActionSheet
        visible={Boolean(
          vm.actionSheetItem && canManageItem(vm.actionSheetItem.type),
        )}
        colors={colors}
        itemType={vm.actionSheetItem?.type || "routine"}
        itemTitle={vm.actionSheetItem?.title || ""}
        itemSubtitle={vm.actionSheetItem?.subtitle}
        onEdit={async () => {
          const item = vm.actionSheetItem;
          vm.setActionSheetItem(null);
          if (!item) return;
          if (item.type === "exercise" && item.data?.id) {
            try {
              vm.loadCatalogExtras();
              const fullDetail = await api.getExerciseDetail(item.data.id);
              vm.setEditModalItem({ ...item, data: fullDetail });
              return;
            } catch {}
          }
          vm.setEditModalItem(item);
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
        visible={Boolean(
          vm.editModalItem && canManageItem(vm.editModalItem.type),
        )}
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
                image: vm.editModalItem.data.own_image ?? null,
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
        visible={Boolean(
          vm.deleteConfirmItem && canManageItem(vm.deleteConfirmItem.type),
        )}
        colors={colors}
        itemTitle={vm.deleteConfirmItem?.title || ""}
        itemType={vm.deleteConfirmItem?.type || "routine"}
        onConfirm={vm.handleConfirmDelete}
        onClose={() => vm.setDeleteConfirmItem(null)}
      />

      {/* Selector de rutina para iniciar sesión */}
      <SelectRoutineToStartModal
        visible={showSelectRoutineToStart}
        colors={colors}
        routines={vm.routines}
        sessionActionLoading={sessionActionLoading}
        getExercisesOfRoutine={vm.getExercisesOfRoutine}
        onSelectRoutine={handleStartRoutineSession}
        onGoToCreate={() => {
          setShowSelectRoutineToStart(false);
          setSelectedRoutineId(null);
          setRoutinesSubTab("crear");
          vm.setActiveTab("routines");
        }}
        onClose={() => setShowSelectRoutineToStart(false)}
      />

      {/* Confirmación de finalizar sesión */}
      <FinishSessionConfirmModal
        visible={showFinishConfirm}
        colors={colors}
        activeSession={activeSession}
        elapsedSeconds={elapsedSeconds}
        sessionActionLoading={sessionActionLoading}
        missingExercises={missingFinishExercises}
        onCancel={() => {
          setShowFinishConfirm(false);
          setMissingFinishExercises([]);
        }}
        onConfirm={handleConfirmFinishSession}
      />

      <AnimatedToast toast={vm.toast} onHide={vm.hideToast} />
    </View>
  );
};

const localStyles = StyleSheet.create({
  loadingBar: {
    paddingVertical: 4,
    alignItems: "center",
  },
  lockStateCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  lockIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lockTitle: {
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  lockMessage: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 4,
  },
});
