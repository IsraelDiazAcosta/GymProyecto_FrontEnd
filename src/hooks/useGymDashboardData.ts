import { useEffect, useState } from "react";
import { Vibration } from "react-native";

import {
  getExerciseMuscleLabel,
  isExerciseCompatibleWithFocus,
} from "@/components/dashboard/muscleValidation";
import { RoutineExerciseItem, TabType } from "@/components/dashboard/types";
import { ToastConfig, ToastType } from "@/components/ui/AnimatedToast";
import {
  api,
  Equipment,
  Exercise,
  MuscleGroup,
  ProgressionItem,
  Routine,
} from "@/services/api";

/**
 * Custom Hook centralizado que encapsula toda la lógica de negocio, llamadas API
 * y estados interactivos del Dashboard del Gimnasio.
 */
export function useGymDashboardData() {
  const [activeTab, setActiveTab] = useState<TabType>("routines");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastConfig>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const showToast = (type: ToastType, title: string, message = "") => {
    setToast({
      visible: true,
      type,
      title,
      message,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Datos globales
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [muscleList, setMuscleList] = useState<MuscleGroup[]>([]);

  // Estados de Catálogo
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

  // Estados de Rutinas
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

  // Estados de Marcas (Tracking)
  const [trackingRoutineId, setTrackingRoutineId] = useState<string>("");
  const [trackingExerciseId, setTrackingExerciseId] = useState<string>("");
  const [marcaWeight, setMarcaWeight] = useState("100");
  const [marcaReps, setMarcaReps] = useState("10");
  const [marcaRpe, setMarcaRpe] = useState("8.5");
  const [marcaHistory, setMarcaHistory] = useState<ProgressionItem[]>([]);
  const [savingMarca, setSavingMarca] = useState(false);
  const [lastSavedSummary, setLastSavedSummary] = useState<string | null>(null);

  // Estados de Admin y Equipos
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showAdminUsers, setShowAdminUsers] = useState(false);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);

  // Estados de modales de acciones (Action Sheet / Editar / Eliminar)
  const [actionSheetItem, setActionSheetItem] = useState<{
    type: "routine" | "exercise" | "marca" | "equipment";
    title: string;
    subtitle?: string;
    data: any;
  } | null>(null);

  const [editModalItem, setEditModalItem] = useState<{
    type: "routine" | "exercise" | "marca" | "equipment";
    data: any;
  } | null>(null);

  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: "routine" | "exercise" | "marca" | "equipment";
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
          name: e.exercise_detail?.name || "Ejercicio",
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
        api.getEquipment().catch(() => []),
        api.getMuscles().catch(() => []),
      ]);
      setExercises(exList);
      setRoutines(rList);
      if (eqList.length > 0) setEquipmentList(eqList);
      if (muList.length > 0) setMuscleList(muList);

      if (rList.length > 0) {
        setTrackingRoutineId(rList[0].id);
        const firstRoutineEx = getExercisesOfRoutine(rList[0]);
        if (firstRoutineEx.length > 0) {
          setTrackingExerciseId(firstRoutineEx[0].id);
          loadProgressionHistory(firstRoutineEx[0].id);
        }
      }
    } catch (e: any) {
      showToast("error", "Error de conexión", e.message);
    } finally {
      setLoading(false);
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
      showToast("error", "Error al cargar ejercicio", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async () => {
    if (!newExName.trim()) {
      return showToast(
        "warning",
        "Nombre Requerido",
        "Ingresa el nombre del ejercicio.",
      );
    }
    if (!newExMuscle) {
      return showToast(
        "warning",
        "Grupo Muscular Requerido",
        "Selecciona el grupo muscular correspondiente al ejercicio.",
      );
    }
    try {
      setLoading(true);
      await api.createExercise({
        name: newExName.trim(),
        instructions: newExInstructions || "Ejecución estándar.",
        video_url: newExVideo,
        equipment_id: newExEquipment,
        muscle_id: newExMuscle,
      });
      showToast(
        "success",
        "Ejercicio Publicado",
        `"${newExName.trim()}" se guardó en el catálogo con su grupo muscular.`,
      );
      setShowAddExerciseModal(false);
      setNewExName("");
      setNewExInstructions("");
      setNewExVideo("");
      setNewExEquipment(null);
      setNewExMuscle(null);
      const updated = await api.getExercises();
      setExercises(updated);
    } catch (e: any) {
      showToast("error", "Error al publicar ejercicio", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoutine = async () => {
    if (!newRoutineTitle.trim()) {
      return showToast(
        "warning",
        "Nombre Requerido",
        "Ingresa el nombre de la rutina (ej. Lunes - Pecho).",
      );
    }

    const validExerciseIds = newRoutineExerciseIds.filter((id) => {
      const ex = exercises.find((e) => e.id === id);
      return ex ? isExerciseCompatibleWithFocus(ex, newRoutineFocus) : false;
    });

    try {
      setLoading(true);
      await api.createRoutine(
        newRoutineTitle.trim(),
        newRoutineFocus,
        "Rutina personalizada",
        validExerciseIds,
        parseInt(setsCount, 10) || 4,
        parseInt(minReps, 10) || 8,
        parseInt(maxReps, 10) || 12,
      );
      const createdTitle = newRoutineTitle.trim();
      setNewRoutineTitle("");
      setNewRoutineExerciseIds([]);
      const updated = await api.getRoutines();
      setRoutines(updated);
      showToast(
        "success",
        "Rutina Creada",
        validExerciseIds.length > 0
          ? `"${createdTitle}" creada con ${validExerciseIds.length} ejercicio(s).`
          : `"${createdTitle}" se creó y guardó correctamente.`,
      );
    } catch (e: any) {
      showToast("error", "Error al crear rutina", e.message);
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
        "Selecciona un ejercicio",
        "Elige al menos un ejercicio antes de añadir.",
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
          return showToast(
            "error",
            "Grupo muscular incompatible",
            `No se permite añadir "${selectedEx.name}" (${getExerciseMuscleLabel(selectedEx)}) a una rutina de ${routine.focus.toUpperCase()}.`,
          );
        }
      }

      if (existingIds.has(exId)) {
        if (idsToProcess.length === 1) {
          return showToast(
            "warning",
            "Ejercicio duplicado",
            "Este ejercicio ya existe en la rutina seleccionada.",
          );
        }
        continue;
      }

      validExerciseIds.push(exId);
    }

    if (validExerciseIds.length === 0) {
      return showToast(
        "warning",
        "Ejercicios ya agregados",
        "Los ejercicios seleccionados ya están en la rutina.",
      );
    }

    try {
      setLoading(true);
      await api.addExerciseToRoutine(routineId, {
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
        "Ejercicios Añadidos",
        `Se agregaron ${validExerciseIds.length} ejercicio(s) a tu rutina.`,
      );
    } catch (e: any) {
      showToast("error", "Error al añadir ejercicio", e.message);
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
      setMarcaHistory([]);
    }
  };

  const loadProgressionHistory = async (exerciseId: string) => {
    if (!exerciseId) return;
    try {
      const data = await api.getProgression(exerciseId);
      setMarcaHistory(data.history || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMarca = async () => {
    if (!trackingExerciseId) {
      return showToast(
        "warning",
        "Selecciona Ejercicio",
        "Elige un ejercicio de tu rutina antes de registrar marca.",
      );
    }
    const w = parseFloat(marcaWeight);
    const r = parseInt(marcaReps, 10);
    const rpe = parseFloat(marcaRpe) || undefined;

    if (isNaN(w) || isNaN(r)) {
      return showToast(
        "warning",
        "Datos Inválidos",
        "Ingresa peso y repeticiones válidos.",
      );
    }

    try {
      setSavingMarca(true);
      const res = await api.saveMarca(trackingExerciseId, w, r, rpe);
      setLastSavedSummary(
        `Guardado: ${w} kg × ${r} reps (1RM estimado: ${res.estimated_1rm} kg)`,
      );
      showToast(
        "success",
        "Marca Registrada",
        `${w} kg × ${r} reps (1RM est: ${res.estimated_1rm} kg)`,
      );
      await loadProgressionHistory(trackingExerciseId);
    } catch (e: any) {
      showToast("error", "Error al guardar marca", e.message);
    } finally {
      setSavingMarca(false);
    }
  };

  const loadAdminUsers = async () => {
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
      showToast("error", "Error al cargar usuarios", e.message);
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
      subtitle: `Enfoque: ${(routine.focus || "fullbody").toUpperCase()} • ${routine.days?.[0]?.exercises?.length || 0} ejercicio(s)`,
      data: routine,
    });
  };

  const handleOpenExerciseOptions = (exercise: Exercise) => {
    try {
      Vibration.vibrate(45);
    } catch {}
    setActionSheetItem({
      type: "exercise",
      title: exercise.name,
      subtitle: `Máquina: ${exercise.equipment_name || "Peso libre"} • ${exercise.primary_muscle || "General"}`,
      data: exercise,
    });
  };

  const handleOpenMarcaOptions = (item: ProgressionItem) => {
    try {
      Vibration.vibrate(45);
    } catch {}
    const dateStr = item.logged_at
      ? new Date(item.logged_at).toLocaleDateString()
      : "Reciente";
    setActionSheetItem({
      type: "marca",
      title: `${item.weight} kg × ${item.reps} reps`,
      subtitle: `Fecha: ${dateStr}${item.rpe ? ` • RPE ${item.rpe}` : ""}`,
      data: item,
    });
  };

  const handleOpenEquipmentOptions = (eq: Equipment) => {
    try {
      Vibration.vibrate(45);
    } catch {}
    setActionSheetItem({
      type: "equipment",
      title: eq.name,
      subtitle: `${eq.equipment_type ? eq.equipment_type.replace("_", " ").toUpperCase() : "EQUIPO"} • ${eq.brand || "Genérica"}`,
      data: eq,
    });
  };

  const handleSaveMarcaEdit = async (
    id: string,
    weight: number,
    reps: number,
    rpe?: number,
  ) => {
    try {
      setLoading(true);
      await api.updateMarca(id, { weight, reps, rpe });
      await loadProgressionHistory(trackingExerciseId);
      showToast(
        "success",
        "Marca Actualizada",
        `Se actualizó el registro a ${weight} kg × ${reps} reps.`,
      );
    } catch (e: any) {
      showToast("error", "Error al actualizar marca", e.message);
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
        "Rutina Actualizada",
        `Se guardaron los cambios en "${title}".`,
      );
    } catch (e: any) {
      showToast("error", "Error al actualizar rutina", e.message);
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
        "Ejercicio Removido",
        `Se quitó "${exerciseName}" de la rutina.`,
      );
    } catch (e: any) {
      showToast("error", "Error al quitar ejercicio", e.message);
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
        "Ejercicio Añadido",
        `"${ex?.name || "Ejercicio"}" asignado a la rutina.`,
      );
    } catch (e: any) {
      showToast("error", "Error al añadir ejercicio", e.message);
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
  ) => {
    try {
      setLoading(true);
      await api.updateExercise(id, {
        name,
        equipment_id,
        instructions,
        video_url,
        muscle_id,
      });
      const updated = await api.getExercises();
      setExercises(updated);
      showToast(
        "success",
        "Ejercicio Actualizado",
        `Se guardaron los cambios en "${name}".`,
      );
    } catch (e: any) {
      showToast("error", "Error al actualizar ejercicio", e.message);
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
  }) => {
    try {
      setLoading(true);
      await api.createEquipment(data);
      const updated = await api.getEquipment();
      setEquipmentList(updated);
      showToast(
        "success",
        "Máquina Registrada",
        `"${data.name}" se guardó en el inventario del gimnasio.`,
      );
    } catch (e: any) {
      showToast("error", "Error al registrar máquina", e.message);
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
    },
  ) => {
    try {
      setLoading(true);
      await api.updateEquipment(id, data);
      const updated = await api.getEquipment();
      setEquipmentList(updated);
      showToast(
        "success",
        "Máquina Actualizada",
        `Se guardaron los cambios en "${data.name}".`,
      );
    } catch (e: any) {
      showToast("error", "Error al actualizar máquina", e.message);
    } finally {
      setLoading(false);
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
        if (trackingRoutineId === deleteConfirmItem.id) {
          setTrackingRoutineId(updated[0]?.id || "");
        }
        showToast(
          "success",
          "Rutina Eliminada",
          `"${deleteConfirmItem.title}" fue eliminada de la base de datos.`,
        );
      } else if (deleteConfirmItem.type === "marca") {
        await api.deleteMarca(deleteConfirmItem.id);
        await loadProgressionHistory(trackingExerciseId);
        showToast(
          "success",
          "Marca Eliminada",
          `El registro "${deleteConfirmItem.title}" fue eliminado.`,
        );
      } else if (deleteConfirmItem.type === "equipment") {
        await api.deleteEquipment(parseInt(deleteConfirmItem.id, 10));
        const updated = await api.getEquipment();
        setEquipmentList(updated);
        showToast(
          "success",
          "Máquina Eliminada",
          `"${deleteConfirmItem.title}" fue eliminada del inventario.`,
        );
      } else {
        await api.deleteExercise(deleteConfirmItem.id);
        const updated = await api.getExercises();
        setExercises(updated);
        showToast(
          "success",
          "Ejercicio Eliminado",
          `"${deleteConfirmItem.title}" fue eliminado del catálogo.`,
        );
      }
    } catch (e: any) {
      showToast("error", "Error al eliminar", e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    loading,
    toast,
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
    marcaWeight,
    setMarcaWeight,
    marcaReps,
    setMarcaReps,
    marcaRpe,
    setMarcaRpe,
    marcaHistory,
    savingMarca,
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
    handleSaveMarca,
    loadAdminUsers,
    handleOpenRoutineOptions,
    handleOpenExerciseOptions,
    handleOpenMarcaOptions,
    handleOpenEquipmentOptions,
    handleSaveMarcaEdit,
    handleSaveRoutineEdit,
    handleRemoveExerciseFromRoutine,
    handleAddExerciseToRoutineInEdit,
    handleSaveExerciseEdit,
    handleCreateEquipment,
    handleSaveEquipmentEdit,
    handleConfirmDelete,
  };
}
