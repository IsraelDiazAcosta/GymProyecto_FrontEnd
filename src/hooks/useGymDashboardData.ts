import { useEffect, useRef, useState } from "react";
import { Vibration } from "react-native";

import {
  getExerciseMuscleLabel,
  isExerciseCompatibleWithFocus,
} from "@/components/dashboard/muscleValidation";
import { RoutineExerciseItem, TabType } from "@/components/dashboard/types";
import { ToastConfig, ToastType } from "@/components/ui/AnimatedToast";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getEquipmentTypeLabel, getMuscleFocusLabel } from "@/i18n";
import {
  api,
  Equipment,
  Exercise,
  MuscleGroup,
  PickedImageAsset,
  ProgressionItem,
  Routine,
} from "@/services/api";

/**
 * Centralized custom hook encapsulating all business logic, API calls,
 * and interactive state for the Gym Dashboard.
 */
export function useGymDashboardData() {
  const { user, refreshProfile } = useAuth();
  const { language, locale, t } = useLanguage();
  const isAdmin = Boolean(user?.is_staff);
  const [activeTab, setActiveTab] = useState<TabType>("routines");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshInFlightRef = useRef(false);
  const lastSyncRef = useRef(0);
  const [toast, setToast] = useState<ToastConfig>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const showToast = (
    type: ToastType,
    title: string,
    message = "",
    code?: string,
  ) => {
    setToast({
      visible: true,
      type,
      title,
      message,
      code,
    });
  };

  const requireAdmin = (): boolean => {
    if (isAdmin) return true;
    showToast("error", t("toasts.adminOnlyTitle"), t("toasts.adminOnlyMsg"));
    return false;
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Global data
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [muscleList, setMuscleList] = useState<MuscleGroup[]>([]);

  // Catalog states
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [modalExerciseVisible, setModalExerciseVisible] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExInstructions, setNewExInstructions] = useState("");
  const [newExVideo, setNewExVideo] = useState("");
  const [newExEquipment, setNewExEquipment] = useState<number | null>(null);
  const [newExMuscle, setNewExMuscle] = useState<number | null>(null);
  const [newExImage, setNewExImage] = useState<PickedImageAsset | null>(null);

  // Routine states
  const [newRoutineTitle, setNewRoutineTitle] = useState("");
  const [newRoutineFocus, setNewRoutineFocus] = useState("fullbody");
  const [newRoutineExerciseIds, setNewRoutineExerciseIds] = useState<string[]>(
    [],
  );
  const [showNewRoutineModal, setShowNewRoutineModal] = useState(false);
  const [selectedRoutineForAdd, setSelectedRoutineForAdd] = useState<
    string | null
  >(null);
  const [selectedExToAdd, setSelectedExToAdd] = useState<string>("");
  const [selectedExsToAdd, setSelectedExsToAdd] = useState<string[]>([]);
  const [setsCount, setSetsCount] = useState("4");
  const [minReps, setMinReps] = useState("8");
  const [maxReps, setMaxReps] = useState("12");

  // Record states (Tracking)
  const [trackingRoutineId, setTrackingRoutineId] = useState<string>("");
  const [trackingExerciseId, setTrackingExerciseId] = useState<string>("");
  const [recordWeight, setRecordWeight] = useState("100");
  const [recordReps, setRecordReps] = useState("10");
  const [recordRpe, setRecordRpe] = useState("8.5");
  const [recordHistory, setRecordHistory] = useState<ProgressionItem[]>([]);
  const [savingRecord, setSavingRecord] = useState(false);
  const [lastSavedSummary, setLastSavedSummary] = useState<string | null>(null);

  // Admin and Equipment states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showAdminUsers, setShowAdminUsers] = useState(false);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);

  // Action modal states (Action Sheet / Edit / Delete)
  const [actionSheetItem, setActionSheetItem] = useState<{
    type: "routine" | "exercise" | "record" | "equipment";
    title: string;
    subtitle?: string;
    data: any;
  } | null>(null);

  const [editModalItem, setEditModalItem] = useState<{
    type: "routine" | "exercise" | "record" | "equipment";
    data: any;
  } | null>(null);

  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: "routine" | "exercise" | "record" | "equipment";
    id: string;
    title: string;
  } | null>(null);

  const getExercisesOfRoutine = (routine?: Routine): RoutineExerciseItem[] => {
    if (!routine || !routine.days) return [];
    const list: RoutineExerciseItem[] = [];
    routine.days.forEach((d) => {
      d.exercises?.forEach((e) => {
        const sc = e.target_sets?.length || 4;
        const firstSet = e.target_sets?.[0];
        list.push({
          id: e.exercise,
          name: e.exercise_detail?.name || t("common.exerciseFallback"),
          routineExerciseId: e.id,
          equipmentName: e.exercise_detail?.equipment_name,
          setsCount: sc,
          minReps: firstSet?.min_reps || 8,
          maxReps: firstSet?.max_reps || 12,
        });
      });
    });
    return list;
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [exList, rList, eqList, muList] = await Promise.all([
        api.getExercises(),
        api.getRoutines(),
        api.getEquipment().catch(() => null),
        api.getMuscles().catch(() => null),
      ]);
      setExercises(exList);
      setRoutines(rList);
      if (eqList !== null) setEquipmentList(eqList);
      if (muList !== null) setMuscleList(muList);

      if (rList.length > 0) {
        setTrackingRoutineId(rList[0].id);
        const firstRoutineEx = getExercisesOfRoutine(rList[0]);
        if (firstRoutineEx.length > 0) {
          setTrackingExerciseId(firstRoutineEx[0].id);
          loadProgressionHistory(firstRoutineEx[0].id);
        }
      }
      lastSyncRef.current = Date.now();
    } catch (e: any) {
      showToast("error", t("toasts.connectionError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async (options?: {
    silent?: boolean;
    force?: boolean;
  }) => {
    if (refreshInFlightRef.current) return;
    if (
      options?.silent &&
      !options?.force &&
      Date.now() - lastSyncRef.current < 4000
    ) {
      return;
    }

    refreshInFlightRef.current = true;
    if (!options?.silent) {
      setRefreshing(true);
    }

    try {
      const [exList, rList, eqList, muList] = await Promise.all([
        api.getExercises(),
        api.getRoutines(),
        api.getEquipment().catch(() => null),
        api.getMuscles().catch(() => null),
        refreshProfile().catch(() => null),
      ]);

      setExercises(exList);
      setRoutines(rList);
      if (eqList !== null) setEquipmentList(eqList);
      if (muList !== null) setMuscleList(muList);

      if (selectedExercise && !exList.some((ex) => ex.id === selectedExercise.id)) {
        setModalExerciseVisible(false);
        setSelectedExercise(null);
      }

      const matchingRoutine =
        rList.find((r) => r.id === trackingRoutineId) || rList[0];
      if (matchingRoutine) {
        if (matchingRoutine.id !== trackingRoutineId) {
          setTrackingRoutineId(matchingRoutine.id);
        }
        const routineExs = getExercisesOfRoutine(matchingRoutine);
        const matchingEx =
          routineExs.find((ex) => ex.id === trackingExerciseId) ||
          routineExs[0];
        if (matchingEx) {
          if (matchingEx.id !== trackingExerciseId) {
            setTrackingExerciseId(matchingEx.id);
          }
          await loadProgressionHistory(matchingEx.id);
        } else {
          setTrackingExerciseId("");
          setRecordHistory([]);
        }
      } else {
        setTrackingRoutineId("");
        setTrackingExerciseId("");
        setRecordHistory([]);
      }

      lastSyncRef.current = Date.now();
      if (!options?.silent) {
        showToast(
          "success",
          t("toasts.refreshedTitle"),
          t("toasts.refreshedMsg"),
        );
      }
    } catch (e: any) {
      if (!options?.silent) {
        showToast("error", t("toasts.connectionError"), e.message);
      }
    } finally {
      refreshInFlightRef.current = false;
      if (!options?.silent) {
        setRefreshing(false);
      }
    }
  };

  const loadCatalogExtras = async () => {
    if (equipmentList.length === 0 || muscleList.length === 0) {
      try {
        const [eq, mu] = await Promise.all([
          api.getEquipment(),
          api.getMuscles(),
        ]);
        setEquipmentList(eq);
        setMuscleList(mu);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const openExerciseDetail = async (exerciseId: string) => {
    try {
      setLoading(true);
      const detail = await api.getExerciseDetail(exerciseId);
      setSelectedExercise(detail);
      setModalExerciseVisible(true);
    } catch (e: any) {
      showToast("error", t("toasts.loadExerciseError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async () => {
    if (!requireAdmin()) return;
    if (!newExName.trim()) {
      return showToast(
        "warning",
        t("toasts.nameRequiredTitle"),
        t("toasts.exerciseNameRequiredMsg"),
      );
    }
    if (!newExMuscle) {
      return showToast(
        "warning",
        t("toasts.muscleRequiredTitle"),
        t("toasts.muscleRequiredMsg"),
      );
    }
    try {
      setLoading(true);
      await api.createExercise({
        name: newExName.trim(),
        instructions: newExInstructions || t("toasts.defaultInstructions"),
        video_url: newExVideo,
        equipment_id: newExEquipment,
        muscle_id: newExMuscle,
        image: newExImage,
      });
      showToast(
        "success",
        t("toasts.exercisePublishedTitle"),
        t("toasts.exercisePublishedMsg", { name: newExName.trim() }),
      );
      setShowAddExerciseModal(false);
      setNewExName("");
      setNewExInstructions("");
      setNewExVideo("");
      setNewExEquipment(null);
      setNewExMuscle(null);
      setNewExImage(null);
      const updated = await api.getExercises();
      setExercises(updated);
    } catch (e: any) {
      showToast("error", t("toasts.publishExerciseError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoutine = async () => {
    if (!newRoutineTitle.trim()) {
      return showToast(
        "warning",
        t("toasts.nameRequiredTitle"),
        t("toasts.routineNameRequiredMsg"),
      );
    }

    const validExerciseIds = newRoutineExerciseIds.filter((id) => {
      const ex = exercises.find((e) => e.id === id);
      return ex ? isExerciseCompatibleWithFocus(ex, newRoutineFocus) : false;
    });

    const clampPos = (raw: string, fallback: number, min: number, max: number) => {
      const parsed = parseInt(raw, 10);
      if (!Number.isFinite(parsed)) return fallback;
      return Math.min(max, Math.max(min, parsed));
    };
    const sc = clampPos(setsCount, 4, 1, 30);
    const minR = clampPos(minReps, 8, 1, 1000);
    const maxR = clampPos(maxReps, 12, minR, 1000);

    try {
      setLoading(true);
      const created = await api.createRoutine(
        newRoutineTitle.trim(),
        newRoutineFocus,
        t("toasts.routineDefaultDescription"),
        validExerciseIds,
        sc,
        minR,
        maxR,
      );
      if (
        validExerciseIds.length > 0 &&
        created?.id &&
        getExercisesOfRoutine(created).length === 0
      ) {
        await api.addExerciseToRoutine(created.id, {
          exercise_id: validExerciseIds[0],
          exercise_ids: validExerciseIds,
          sets_count: sc,
          min_reps: minR,
          max_reps: maxR,
        });
      }
      const createdTitle = newRoutineTitle.trim();
      setNewRoutineTitle("");
      setNewRoutineExerciseIds([]);
      const updated = await api.getRoutines();
      setRoutines(updated);
      showToast(
        "success",
        t("toasts.routineCreatedTitle"),
        validExerciseIds.length > 0
          ? t("toasts.routineCreatedWithCountMsg", {
              title: createdTitle,
              count: validExerciseIds.length,
            })
          : t("toasts.routineCreatedMsg", { title: createdTitle }),
        "routine_created",
      );
    } catch (e: any) {
      showToast("error", t("toasts.createRoutineError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExerciseToRoutine = async (routineId: string) => {
    const idsToProcess =
      selectedExsToAdd.length > 0
        ? selectedExsToAdd
        : selectedExToAdd
          ? [selectedExToAdd]
          : [];

    if (idsToProcess.length === 0) {
      return showToast(
        "warning",
        t("toasts.selectExerciseTitle"),
        t("toasts.selectExerciseMsg"),
      );
    }
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const existingExercises = getExercisesOfRoutine(routine);
    const existingIds = new Set(existingExercises.map((ex) => ex.id));

    const validExerciseIds: string[] = [];
    for (const exId of idsToProcess) {
      const selectedEx = exercises.find((ex) => ex.id === exId);
      if (!selectedEx) continue;

      if (routine.focus && routine.focus.toLowerCase() !== "fullbody") {
        if (!isExerciseCompatibleWithFocus(selectedEx, routine.focus)) {
          const rawMuscle = getExerciseMuscleLabel(selectedEx);
          const translatedMuscle = getMuscleFocusLabel(
            language,
            rawMuscle.toLowerCase() === "full body" ? "fullbody" : rawMuscle,
          );
          return showToast(
            "error",
            t("toasts.incompatibleMuscleTitle"),
            t("toasts.incompatibleMuscleMsg", {
              name: selectedEx.name,
              muscle: translatedMuscle,
              focus: getMuscleFocusLabel(language, routine.focus).toUpperCase(),
            }),
          );
        }
      }

      if (existingIds.has(exId)) {
        if (idsToProcess.length === 1) {
          return showToast(
            "warning",
            t("toasts.duplicateExerciseTitle"),
            t("toasts.duplicateExerciseMsg"),
          );
        }
        continue;
      }

      validExerciseIds.push(exId);
    }

    if (validExerciseIds.length === 0) {
      return showToast(
        "warning",
        t("toasts.alreadyAddedTitle"),
        t("toasts.alreadyAddedMsg"),
      );
    }

    try {
      setLoading(true);
      await api.addExerciseToRoutine(routineId, {
        exercise_id: validExerciseIds[0],
        exercise_ids: validExerciseIds,
        sets_count: parseInt(setsCount, 10) || 4,
        min_reps: parseInt(minReps, 10) || 8,
        max_reps: parseInt(maxReps, 10) || 12,
      });
      setSelectedRoutineForAdd(null);
      setSelectedExToAdd("");
      setSelectedExsToAdd([]);
      const updated = await api.getRoutines();
      setRoutines(updated);
      showToast(
        "success",
        t("toasts.exercisesAddedTitle"),
        t("toasts.exercisesAddedMsg", { count: validExerciseIds.length }),
      );
    } catch (e: any) {
      showToast("error", t("toasts.addExerciseError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoutineChangeInTracking = (rId: string) => {
    setTrackingRoutineId(rId);
    const routine = routines.find((r) => r.id === rId);
    const exList = getExercisesOfRoutine(routine);
    if (exList.length > 0) {
      setTrackingExerciseId(exList[0].id);
      loadProgressionHistory(exList[0].id);
    } else {
      setTrackingExerciseId("");
      setRecordHistory([]);
    }
  };

  const loadProgressionHistory = async (exerciseId: string) => {
    if (!exerciseId) return;
    try {
      const data = await api.getProgression(exerciseId);
      setRecordHistory(data.history || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRecord = async (): Promise<boolean> => {
    if (!trackingExerciseId) {
      showToast(
        "warning",
        t("toasts.selectExerciseForMarcaTitle"),
        t("toasts.selectExerciseForMarcaMsg"),
      );
      return false;
    }
    const w = parseFloat(recordWeight.replace(",", "."));
    const r = parseInt(recordReps, 10);
    const rpe = recordRpe.trim()
      ? parseFloat(recordRpe.replace(",", "."))
      : undefined;

    if (
      !Number.isFinite(w) ||
      w <= 0 ||
      w >= 10000 ||
      !Number.isFinite(r) ||
      r <= 0 ||
      r > 1000 ||
      (rpe !== undefined && (!Number.isFinite(rpe) || rpe < 1 || rpe > 10))
    ) {
      showToast(
        "warning",
        t("toasts.invalidDataTitle"),
        t("toasts.invalidDataMsg"),
      );
      return false;
    }

    try {
      setSavingRecord(true);
      const res = await api.saveRecord(trackingExerciseId, w, r, rpe);
      setLastSavedSummary(
        t("toasts.lastSavedSummary", {
          weight: w,
          reps: r,
          oneRm: res.estimated_1rm,
        }),
      );
      showToast(
        "success",
        t("toasts.marcaSavedTitle"),
        t("toasts.marcaSavedMsg", {
          weight: w,
          reps: r,
          oneRm: res.estimated_1rm,
        }),
      );
      await loadProgressionHistory(trackingExerciseId);
      return true;
    } catch (e: any) {
      showToast("error", t("toasts.saveMarcaError"), e.message);
      return false;
    } finally {
      setSavingRecord(false);
    }
  };

  const loadAdminUsers = async () => {
    if (!requireAdmin()) return;
    if (showAdminUsers) {
      setShowAdminUsers(false);
      return;
    }
    try {
      setLoading(true);
      const users = await api.getAdminUsers();
      setAdminUsers(users);
      setShowAdminUsers(true);
    } catch (e: any) {
      showToast("error", t("toasts.loadUsersError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoutineOptions = (routine: Routine) => {
    try {
      Vibration.vibrate(45);
    } catch {}
    setActionSheetItem({
      type: "routine",
      title: routine.title,
      subtitle: t("toasts.routineOptionsSub", {
        focus: getMuscleFocusLabel(
          language,
          routine.focus || "fullbody",
        ).toUpperCase(),
        count: routine.days?.[0]?.exercises?.length || 0,
      }),
      data: routine,
    });
  };

  const handleOpenExerciseOptions = (exercise: Exercise) => {
    if (!isAdmin) return;
    try {
      Vibration.vibrate(45);
    } catch {}
    setActionSheetItem({
      type: "exercise",
      title: exercise.name,
      subtitle: t("toasts.exerciseOptionsSub", {
        machine: exercise.equipment_name || t("common.freeWeight"),
        muscle: exercise.primary_muscle
          ? getMuscleFocusLabel(language, exercise.primary_muscle)
          : t("common.general"),
      }),
      data: exercise,
    });
  };

  const handleOpenRecordOptions = (item: ProgressionItem) => {
    try {
      Vibration.vibrate(45);
    } catch {}
    const dateStr = item.logged_at
      ? new Date(item.logged_at).toLocaleDateString(locale)
      : t("common.recent");
    setActionSheetItem({
      type: "record",
      title: `${item.weight} kg × ${item.reps} reps`,
      subtitle: `${t("toasts.marcaOptionsSub", { date: dateStr })}${item.rpe ? ` • RPE ${item.rpe}` : ""}`,
      data: item,
    });
  };

  const handleOpenEquipmentOptions = (eq: Equipment) => {
    if (!isAdmin) return;
    try {
      Vibration.vibrate(45);
    } catch {}
    const typeLabel = eq.equipment_type
      ? getEquipmentTypeLabel(language, eq.equipment_type).toUpperCase()
      : t("common.equipmentFallback");
    setActionSheetItem({
      type: "equipment",
      title: eq.name,
      subtitle: `${typeLabel} • ${eq.brand || t("common.genericBrand")}`,
      data: eq,
    });
  };

  const handleSaveRecordEdit = async (
    id: string,
    weight: number,
    reps: number,
    rpe?: number,
  ) => {
    try {
      setLoading(true);
      await api.updateRecord(id, { weight, reps, rpe });
      await loadProgressionHistory(trackingExerciseId);
      showToast(
        "success",
        t("toasts.marcaUpdatedTitle"),
        t("toasts.marcaUpdatedMsg", { weight, reps }),
      );
    } catch (e: any) {
      showToast("error", t("toasts.updateMarcaError"), e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoutineEdit = async (
    id: string,
    title: string,
    focus: string,
  ) => {
    try {
      setLoading(true);
      await api.updateRoutine(id, { title, focus });
      const updated = await api.getRoutines();
      setRoutines(updated);
      showToast(
        "success",
        t("toasts.routineUpdatedTitle"),
        t("toasts.routineUpdatedMsg", { title }),
      );
    } catch (e: any) {
      showToast("error", t("toasts.updateRoutineError"), e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExerciseFromRoutine = async (
    routineExerciseId: string,
    exerciseName: string,
  ) => {
    try {
      setLoading(true);
      await api.removeExerciseFromRoutine(routineExerciseId);
      const updated = await api.getRoutines();
      setRoutines(updated);
      if (editModalItem && editModalItem.type === "routine") {
        const updatedRoutine = updated.find(
          (r) => r.id === editModalItem.data.id,
        );
        if (updatedRoutine) {
          setEditModalItem({
            ...editModalItem,
            data: updatedRoutine,
          });
        }
      }
      showToast(
        "success",
        t("toasts.exerciseRemovedTitle"),
        t("toasts.exerciseRemovedMsg", { name: exerciseName }),
      );
    } catch (e: any) {
      showToast("error", t("toasts.removeExerciseError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExerciseToRoutineInEdit = async (
    routineId: string,
    exerciseId: string,
    sc: number,
    minR: number,
    maxR: number,
  ) => {
    try {
      setLoading(true);
      await api.addExerciseToRoutine(routineId, {
        exercise_id: exerciseId,
        sets_count: sc,
        min_reps: minR,
        max_reps: maxR,
      });
      const updated = await api.getRoutines();
      setRoutines(updated);
      if (editModalItem && editModalItem.type === "routine") {
        const updatedRoutine = updated.find((r) => r.id === routineId);
        if (updatedRoutine) {
          setEditModalItem({
            ...editModalItem,
            data: updatedRoutine,
          });
        }
      }
      const ex = exercises.find((e) => e.id === exerciseId);
      showToast(
        "success",
        t("toasts.exerciseAssignedTitle"),
        t("toasts.exerciseAssignedMsg", {
          name: ex?.name || t("common.exerciseFallback"),
        }),
      );
    } catch (e: any) {
      showToast("error", t("toasts.addExerciseError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoutineExercise = async (
    routineExerciseId: string,
    sc: number,
    minR: number,
    maxR: number,
  ) => {
    if (!Number.isInteger(sc) || sc < 1 || !Number.isInteger(minR) || minR < 1 || !Number.isInteger(maxR) || maxR < 1) {
      showToast(
        "warning",
        t("toasts.invalidValuesTitle"),
        t("toasts.invalidValuesMsg"),
      );
      return;
    }
    try {
      setLoading(true);
      await api.updateRoutineExercise(routineExerciseId, {
        sets_count: sc,
        min_reps: minR,
        max_reps: Math.max(minR, maxR),
      });
      const updated = await api.getRoutines();
      setRoutines(updated);
      if (editModalItem && editModalItem.type === "routine") {
        const updatedRoutine = updated.find(
          (r) => r.id === editModalItem.data.id,
        );
        if (updatedRoutine) {
          setEditModalItem({
            ...editModalItem,
            data: updatedRoutine,
          });
        }
      }
      showToast(
        "success",
        t("toasts.setsRepsUpdatedTitle"),
        t("toasts.setsRepsUpdatedMsg", {
          sets: sc,
          min: minR,
          max: Math.max(minR, maxR),
        }),
      );
    } catch (e: any) {
      showToast("error", t("toasts.updateSetsError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExerciseEdit = async (
    id: string,
    name: string,
    equipment_id: number | null,
    instructions: string,
    video_url?: string,
    muscle_id?: number | null,
    image?: PickedImageAsset | null,
  ) => {
    if (!requireAdmin()) return;
    try {
      setLoading(true);
      await api.updateExercise(id, {
        name,
        equipment_id,
        instructions,
        video_url,
        muscle_id,
        image,
      });
      const updated = await api.getExercises();
      setExercises(updated);
      showToast(
        "success",
        t("toasts.exerciseUpdatedTitle"),
        t("toasts.exerciseUpdatedMsg", { name }),
      );
    } catch (e: any) {
      showToast("error", t("toasts.updateExerciseError"), e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEquipment = async (data: {
    name: string;
    equipment_type: string;
    brand?: string;
    setup_guide?: string;
    description?: string;
    image?: PickedImageAsset | null;
  }) => {
    if (!requireAdmin()) return;
    try {
      setLoading(true);
      await api.createEquipment(data);
      const updated = await api.getEquipment();
      setEquipmentList(updated);
      showToast(
        "success",
        t("toasts.equipmentCreatedTitle"),
        t("toasts.equipmentCreatedMsg", { name: data.name }),
      );
    } catch (e: any) {
      showToast("error", t("toasts.createEquipmentError"), e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEquipmentEdit = async (
    id: number,
    data: {
      name: string;
      equipment_type: string;
      brand?: string;
      setup_guide?: string;
      description?: string;
      image?: PickedImageAsset | null;
    },
  ) => {
    if (!requireAdmin()) return;
    try {
      setLoading(true);
      await api.updateEquipment(id, data);
      const [updated, updatedExercises] = await Promise.all([
        api.getEquipment(),
        api.getExercises().catch(() => exercises),
      ]);
      setEquipmentList(updated);
      setExercises(updatedExercises);
      showToast(
        "success",
        t("toasts.equipmentUpdatedTitle"),
        t("toasts.equipmentUpdatedMsg", { name: data.name }),
      );
    } catch (e: any) {
      showToast("error", t("toasts.updateEquipmentError"), e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEquipmentFavorite = async (equipmentId: number) => {
    try {
      Vibration.vibrate(15);
    } catch {}
    setEquipmentList((prev) =>
      prev.map((eq) =>
        eq.id === equipmentId ? { ...eq, is_favorite: !eq.is_favorite } : eq,
      ),
    );
    try {
      const res = await api.toggleEquipmentFavorite(equipmentId);
      setEquipmentList((prev) =>
        prev.map((eq) =>
          eq.id === equipmentId ? { ...eq, is_favorite: res.is_favorite } : eq,
        ),
      );
    } catch (e: any) {
      setEquipmentList((prev) =>
        prev.map((eq) =>
          eq.id === equipmentId ? { ...eq, is_favorite: !eq.is_favorite } : eq,
        ),
      );
      showToast("error", t("toasts.favoritesError"), e.message);
    }
  };

  const handleToggleExerciseFavorite = async (exerciseId: string) => {
    try {
      Vibration.vibrate(15);
    } catch {}
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, is_favorite: !ex.is_favorite } : ex,
      ),
    );
    try {
      const res = await api.toggleExerciseFavorite(exerciseId);
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId ? { ...ex, is_favorite: res.is_favorite } : ex,
        ),
      );
    } catch (e: any) {
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId ? { ...ex, is_favorite: !ex.is_favorite } : ex,
        ),
      );
      showToast("error", t("toasts.favoritesError"), e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      setLoading(true);
      if (deleteConfirmItem.type === "routine") {
        await api.deleteRoutine(deleteConfirmItem.id);
        const updated = await api.getRoutines();
        setRoutines(updated);
        if (trackingRoutineId === deleteConfirmItem.id || updated.length === 0) {
          const nextRoutine = updated[0];
          if (nextRoutine) {
            setTrackingRoutineId(nextRoutine.id);
            const nextExList = getExercisesOfRoutine(nextRoutine);
            if (nextExList.length > 0) {
              setTrackingExerciseId(nextExList[0].id);
              await loadProgressionHistory(nextExList[0].id);
            } else {
              setTrackingExerciseId("");
              setRecordHistory([]);
            }
          } else {
            setTrackingRoutineId("");
            setTrackingExerciseId("");
            setRecordHistory([]);
          }
        }
        showToast(
          "success",
          t("toasts.routineDeletedTitle"),
          t("toasts.routineDeletedMsg", { title: deleteConfirmItem.title }),
        );
      } else if (deleteConfirmItem.type === "record") {
        await api.deleteRecord(deleteConfirmItem.id);
        await loadProgressionHistory(trackingExerciseId);
        showToast(
          "success",
          t("toasts.marcaDeletedTitle"),
          t("toasts.marcaDeletedMsg", { title: deleteConfirmItem.title }),
        );
      } else if (deleteConfirmItem.type === "equipment") {
        if (!requireAdmin()) return;
        await api.deleteEquipment(parseInt(deleteConfirmItem.id, 10));
        const [updated, updatedExercises] = await Promise.all([
          api.getEquipment(),
          api.getExercises().catch(() => exercises),
        ]);
        setEquipmentList(updated);
        setExercises(updatedExercises);
        showToast(
          "success",
          t("toasts.equipmentDeletedTitle"),
          t("toasts.equipmentDeletedMsg", { title: deleteConfirmItem.title }),
        );
      } else {
        if (!requireAdmin()) return;
        await api.deleteExercise(deleteConfirmItem.id);
        const [updatedExercises, updatedRoutines] = await Promise.all([
          api.getExercises(),
          api.getRoutines().catch(() => routines),
        ]);
        setExercises(updatedExercises);
        setRoutines(updatedRoutines);
        showToast(
          "success",
          t("toasts.exerciseDeletedTitle"),
          t("toasts.exerciseDeletedMsg", { title: deleteConfirmItem.title }),
        );
      }
    } catch (e: any) {
      showToast("error", t("toasts.deleteError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    loading,
    refreshing,
    refreshAllData,
    toast,
    showToast,
    hideToast,
    exercises,
    routines,
    equipmentList,
    muscleList,
    selectedExercise,
    modalExerciseVisible,
    setModalExerciseVisible,
    showAddExerciseModal,
    setShowAddExerciseModal,
    newExName,
    setNewExName,
    newExInstructions,
    setNewExInstructions,
    newExVideo,
    setNewExVideo,
    newExEquipment,
    setNewExEquipment,
    newExMuscle,
    setNewExMuscle,
    newExImage,
    setNewExImage,
    newRoutineTitle,
    setNewRoutineTitle,
    newRoutineFocus,
    setNewRoutineFocus,
    newRoutineExerciseIds,
    setNewRoutineExerciseIds,
    showNewRoutineModal,
    setShowNewRoutineModal,
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
    trackingRoutineId,
    trackingExerciseId,
    setTrackingExerciseId,
    recordWeight,
    setRecordWeight,
    recordReps,
    setRecordReps,
    recordRpe,
    setRecordRpe,
    recordHistory,
    savingRecord,
    lastSavedSummary,
    adminUsers,
    showAdminUsers,
    showAddEquipmentModal,
    setShowAddEquipmentModal,
    actionSheetItem,
    setActionSheetItem,
    editModalItem,
    setEditModalItem,
    deleteConfirmItem,
    setDeleteConfirmItem,
    getExercisesOfRoutine,
    loadCatalogExtras,
    openExerciseDetail,
    handleCreateExercise,
    handleCreateRoutine,
    handleAddExerciseToRoutine,
    handleRoutineChangeInTracking,
    loadProgressionHistory,
    handleSaveRecord,
    loadAdminUsers,
    handleOpenRoutineOptions,
    handleOpenExerciseOptions,
    handleOpenRecordOptions,
    handleOpenEquipmentOptions,
    handleSaveRecordEdit,
    handleSaveRoutineEdit,
    handleRemoveExerciseFromRoutine,
    handleAddExerciseToRoutineInEdit,
    handleUpdateRoutineExercise,
    handleSaveExerciseEdit,
    handleCreateEquipment,
    handleSaveEquipmentEdit,
    handleToggleEquipmentFavorite,
    handleToggleExerciseFavorite,
    handleConfirmDelete,
  };
}
