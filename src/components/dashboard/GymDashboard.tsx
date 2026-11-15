import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { AnimatedToast } from "@/components/ui/AnimatedToast";
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
  const [lastFinishedRoutineId, setLastFinishedRoutineId] = useState<
    string | null
  >(null);
  const [routineHistoryList, setRoutineHistoryList] = useState<
    WorkoutSessionItem[]
  >([]);
  const [sessionActionLoading, setSessionActionLoading] = useState(false);
  const [sessionMarcasCount, setSessionMarcasCount] = useState(0);

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
      setSessionMarcasCount(0);
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

  const handleAttemptFinishSession = () => {
    if (!hasRecordedMarcaInSession) {
      vm.showToast(
        "warning",
        "Marca Requerida",
        "Debes registrar al menos una marca (peso y repeticiones) antes de finalizar tu sesión de entrenamiento.",
      );
      return;
    }
    setShowFinishConfirm(true);
  };

  const handleConfirmFinishSession = async () => {
    if (!hasRecordedMarcaInSession) {
      setShowFinishConfirm(false);
      vm.showToast(
        "warning",
        "Marca Requerida",
        "Debes registrar al menos una marca (peso y repeticiones) antes de finalizar tu sesión de entrenamiento.",
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
        username={user?.username || "Atleta"}
        isAdmin={Boolean(user?.is_staff)}
        routinesCount={vm.routines.length}
        exercisesCount={vm.exercises.length}
        colors={colors}
        trainedCount={trainedCount}
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
                  title: routine.title || "Rutina",
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
                  Inicia tu sesión para registrar marcas
                </Text>

                <Text
                  style={[
                    localStyles.lockMessage,
                    { color: colors.textSecondary },
                  ]}
                >
                  Los entrenamientos se registran serie por serie durante tu
                  sesión. Inicia tu rutina para comenzar a registrar tus
                  levantamientos.
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
                  const ok = await vm.handleSaveMarca();
                  if (ok) {
                    setSessionMarcasCount((prev) => prev + 1);
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
            onToggleFavorite={vm.handleToggleExerciseFavorite}
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
      <SelectRoutineToStartModal
        visible={showSelectRoutineToStart}
        colors={colors}
        routines={vm.routines}
        sessionActionLoading={sessionActionLoading}
        getExercisesOfRoutine={vm.getExercisesOfRoutine}
        onSelectRoutine={handleStartRoutineSession}
        onGoToCreate={() => {
          setShowSelectRoutineToStart(false);
          setRoutinesSubTab("crear");
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
        onCancel={() => setShowFinishConfirm(false)}
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
