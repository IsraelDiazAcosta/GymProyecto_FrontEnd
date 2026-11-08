import {
  AnimatedToast,
  ToastMessage,
  ToastType,
} from "@/components/ui/AnimatedToast";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  Equipment,
  Exercise,
  MuscleGroup,
  ProgressionItem,
  Routine,
} from "@/services/api";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  useColorScheme,
  Vibration,
  View,
} from "react-native";
import { AddEquipmentModal } from "./AddEquipmentModal";
import { AddExerciseModal } from "./AddExerciseModal";
import { CatalogSection } from "./CatalogSection";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { CreateRoutineCard } from "./CreateRoutineCard";
import { DashboardTabBar } from "./DashboardTabBar";
import { EditItemModal } from "./EditItemModal";
import { EquipmentSection } from "./EquipmentSection";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { ItemActionSheet } from "./ItemActionSheet";
import { MarcaFormCard } from "./MarcaFormCard";
import { MarcaHistoryList } from "./MarcaHistoryList";
import { ProfileSection } from "./ProfileSection";
import RMTrackingChart from "./RMTrackingChart";
import { RoutineCard } from "./RoutineCard";
import { SelectExerciseModal } from "./SelectExerciseModal";
import { styles } from "./dashboardStyles";
import {
  getExerciseMuscleLabel,
  isExerciseCompatibleWithFocus,
} from "./muscleValidation";
import { RoutineExerciseItem, TabType } from "./types";

export const GymDashboard: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("routines");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: ToastType, title: string, message?: string) => {
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    });
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
  const [setsCount, setSetsCount] = useState("3");
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

  // Estados para Acciones Interactivas de BD (Long-Press / Select)
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
      showToast("error", "Error de conexión ⚠️", e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogExtras = async () => {
    if (equipmentList.length === 0) {
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
      showToast("error", "Error al cargar ejercicio ⚠️", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async () => {
    if (!newExName.trim())
      return showToast(
        "warning",
        "Nombre Requerido ⚠️",
        "Ingresa el nombre del ejercicio.",
      );
    if (!newExMuscle)
      return showToast(
        "warning",
        "Grupo Muscular Requerido ⚠️",
        "Selecciona el grupo muscular correspondiente al ejercicio.",
      );
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
        "¡Ejercicio Publicado! 🏆",
        `"${newExName.trim()}" se guardó en la base de datos con su grupo muscular.`,
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
      showToast("error", "Error al publicar ejercicio ⚠️", e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RUTINAS ---
  const handleCreateRoutine = async () => {
    if (!newRoutineTitle.trim())
      return showToast(
        "warning",
        "Nombre Requerido ⚠️",
        "Ingresa el nombre de la rutina (ej. Lunes-Pecho).",
      );

    // Filtrar solo los ejercicios que sean compatibles con el enfoque actual
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
        parseInt(setsCount) || 3,
        parseInt(minReps) || 8,
        parseInt(maxReps) || 12,
      );
      const createdTitle = newRoutineTitle.trim();
      setNewRoutineTitle("");
      setNewRoutineExerciseIds([]);
      const updated = await api.getRoutines();
      setRoutines(updated);
      showToast(
        "success",
        "¡Rutina Creada! 🚀",
        validExerciseIds.length > 0
          ? `"${createdTitle}" ${validExerciseIds.length} ejercicio(s) añadidos.`
          : `"${createdTitle}" se creó y guardó correctamente.`,
      );
    } catch (e: any) {
      showToast("error", "Error al crear rutina ⚠️", e.message);
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

    if (idsToProcess.length === 0)
      return showToast(
        "warning",
        "Porfavor seleccione un ejercicio",
        "Elige al menos un ejercicio antes de añadir.",
      );
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const existingExercises = getExercisesOfRoutine(routine);
    const existingIds = new Set(existingExercises.map((ex) => ex.id));

    const validExerciseIds: string[] = [];
    for (const exId of idsToProcess) {
      const selectedEx = exercises.find((ex) => ex.id === exId);
      if (!selectedEx) continue;

      // 1. VALIDACIÓN MUSCULAR ESTRICTA
      if (routine.focus && routine.focus.toLowerCase() !== "fullbody") {
        if (!isExerciseCompatibleWithFocus(selectedEx, routine.focus)) {
          return showToast(
            "error",
            "Grupo muscular incompatible",
            `No se permite añadir ejercicios de "${getExerciseMuscleLabel(selectedEx)}" a una rutina de "${routine.focus.toUpperCase()}".`,
          );
        }
      }

      // 2. VALIDACIÓN DE EJERCICIO DUPLICADO
      if (existingIds.has(exId)) {
        if (idsToProcess.length === 1) {
          return showToast(
            "warning",
            "Ejercicio duplicado",
            "Este ejercicio ya existe en la rutina seleccionada.",
          );
        }
        continue; // Omitir duplicado si se añadieron varios a la vez
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
        sets_count: parseInt(setsCount) || 3,
        min_reps: parseInt(minReps) || 8,
        max_reps: parseInt(maxReps) || 12,
      });
      setSelectedRoutineForAdd(null);
      setSelectedExToAdd("");
      setSelectedExsToAdd([]);
      const updated = await api.getRoutines();
      setRoutines(updated);
      showToast(
        "success",
        "¡Ejercicios Añadidos! ",
        `Se agregaron ${validExerciseIds.length} ejercicio(s) a tu rutina.`,
      );
    } catch (e: any) {
      showToast("error", "Error al añadir ejercicio", e.message);
    } finally {
      setLoading(false);
    }
  };

  const getExercisesOfRoutine = (routine?: Routine): RoutineExerciseItem[] => {
    if (!routine || !routine.days) return [];
    const list: RoutineExerciseItem[] = [];
    routine.days.forEach((d) => {
      d.exercises?.forEach((e) => {
        const setsCount = e.target_sets?.length || 3;
        const firstSet = e.target_sets?.[0];
        list.push({
          id: e.exercise,
          name: e.exercise_detail?.name || "Ejercicio",
          routineExerciseId: e.id,
          equipmentName: e.exercise_detail?.equipment_name,
          setsCount,
          minReps: firstSet?.min_reps || 8,
          maxReps: firstSet?.max_reps || 12,
        });
      });
    });
    return list;
  };

  // --- MARCAS ---
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
    if (!trackingExerciseId)
      return showToast(
        "warning",
        "Selecciona Ejercicio",
        "Elige un ejercicio de tu rutina antes de registrar marca.",
      );
    const w = parseFloat(marcaWeight);
    const r = parseInt(marcaReps);
    const rpe = parseFloat(marcaRpe) || undefined;

    if (isNaN(w) || isNaN(r))
      return showToast(
        "warning",
        "Datos Inválidos",
        "Ingresa peso y repeticiones válidos.",
      );

    try {
      setSavingMarca(true);
      const res = await api.saveMarca(trackingExerciseId, w, r, rpe);
      setLastSavedSummary(
        `✓ Guardado: ${w}kg x ${r} reps (1RM estimado: ${res.estimated_1rm}kg)`,
      );
      showToast(
        "success",
        "¡Marca Registrada!",
        `${w}kg x ${r} reps (1RM est: ${res.estimated_1rm}kg)`,
      );
      await loadProgressionHistory(trackingExerciseId);
    } catch (e: any) {
      showToast("error", "Error al guardar marca ⚠️", e.message);
    } finally {
      setSavingMarca(false);
    }
  };

  const loadAdminUsers = async () => {
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

  // --- ACCIONES DE BD: EDITAR Y ELIMINAR (LONG-PRESS / SELECT) ---
  const handleOpenRoutineOptions = (routine: Routine) => {
    try {
      Vibration.vibrate(50);
    } catch (e) {}
    setActionSheetItem({
      type: "routine",
      title: routine.title,
      subtitle: `Enfoque: ${(routine.focus || "fullbody").toUpperCase()} • ${routine.days?.[0]?.exercises?.length || 0} ejercicio(s)`,
      data: routine,
    });
  };

  const handleOpenExerciseOptions = (exercise: Exercise) => {
    try {
      Vibration.vibrate(50);
    } catch (e) {}
    setActionSheetItem({
      type: "exercise",
      title: exercise.name,
      subtitle: `Máquina: ${exercise.equipment_name || "Sin máquina"} • ${exercise.primary_muscle || "General"}`,
      data: exercise,
    });
  };

  const handleOpenMarcaOptions = (item: ProgressionItem) => {
    try {
      Vibration.vibrate(50);
    } catch (e) {}
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
      Vibration.vibrate(50);
    } catch (e) {}
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
        "¡Marca Actualizada!",
        `Se actualizó el registro a ${weight}kg × ${reps} reps.`,
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
        "¡Rutina Actualizada!",
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
    setsCount: number,
    minReps: number,
    maxReps: number,
  ) => {
    try {
      setLoading(true);
      await api.addExerciseToRoutine(routineId, {
        exercise_id: exerciseId,
        sets_count: setsCount,
        min_reps: minReps,
        max_reps: maxReps,
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
        "¡Ejercicio Añadido!",
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
        "¡Ejercicio Actualizado!",
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
        "¡Equipo Registrado! ⚙️",
        `"${data.name}" se guardó en la base de datos.`,
      );
    } catch (e: any) {
      showToast("error", "Error al registrar equipo", e.message);
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
        "¡Equipo Actualizado!",
        `Se guardaron los cambios en "${data.name}".`,
      );
    } catch (e: any) {
      showToast("error", "Error al actualizar equipo", e.message);
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
          "¡Rutina Eliminada!",
          `"${deleteConfirmItem.title}" fue borrada de la BD.`,
        );
      } else if (deleteConfirmItem.type === "marca") {
        await api.deleteMarca(deleteConfirmItem.id);
        await loadProgressionHistory(trackingExerciseId);
        showToast(
          "success",
          "¡Marca Eliminada! ",
          `El registro "${deleteConfirmItem.title}" fue borrado de la BD.`,
        );
      } else if (deleteConfirmItem.type === "equipment") {
        await api.deleteEquipment(parseInt(deleteConfirmItem.id, 10));
        const updated = await api.getEquipment();
        setEquipmentList(updated);
        showToast(
          "success",
          "¡Equipo Eliminado!",
          `"${deleteConfirmItem.title}" fue borrado de la BD.`,
        );
      } else {
        await api.deleteExercise(deleteConfirmItem.id);
        const updated = await api.getExercises();
        setExercises(updated);
        showToast(
          "success",
          "¡Ejercicio Eliminado!",
          `"${deleteConfirmItem.title}" fue borrado de la BD.`,
        );
      }
    } catch (e: any) {
      showToast("error", "Error al eliminar", e.message);
    } finally {
      setLoading(false);
    }
  };

  const currentRoutineObj = routines.find((r) => r.id === trackingRoutineId);
  const currentRoutineExercises = getExercisesOfRoutine(currentRoutineObj);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#10b981" size="small" />
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== TAB 1: RUTINAS ==================== */}
        {activeTab === "routines" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Bienvenido {user?.username || "Atleta"}
            </Text>

            <RMTrackingChart
              colors={colors}
              routines={routines}
              trackingRoutineId={trackingRoutineId}
              trackingExerciseId={trackingExerciseId}
              marcaHistory={marcaHistory}
              exercises={currentRoutineExercises}
              onSelectRoutine={handleRoutineChangeInTracking}
              onSelectExercise={(exerciseId: string) => {
                setTrackingExerciseId(exerciseId);
                loadProgressionHistory(exerciseId);
              }}
            />

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
              onOpenSelectExercises={() => setShowNewRoutineModal(true)}
              onRemoveExercise={(id) =>
                setNewRoutineExerciseIds((prev) => prev.filter((x) => x !== id))
              }
              onCreate={handleCreateRoutine}
            />

            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                colors={colors}
                routine={routine}
                routineExercises={getExercisesOfRoutine(routine)}
                exercises={exercises}
                isAdding={selectedRoutineForAdd === routine.id}
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
                  setSelectedRoutineForAdd(routine.id);
                  const firstCompatible = exercises.find((ex) =>
                    isExerciseCompatibleWithFocus(ex, routine.focus),
                  );
                  setSelectedExToAdd(firstCompatible ? firstCompatible.id : "");
                  setSelectedExsToAdd(
                    firstCompatible ? [firstCompatible.id] : [],
                  );
                }}
                onCancelAdding={() => {
                  setSelectedRoutineForAdd(null);
                  setSelectedExsToAdd([]);
                  setSelectedExToAdd("");
                }}
                onAddExercise={() => handleAddExerciseToRoutine(routine.id)}
                onOptionsPress={() => handleOpenRoutineOptions(routine)}
              />
            ))}
          </View>
        )}

        {/* ==================== TAB 2: MARCAS (TRACKING) ==================== */}
        {activeTab === "tracking" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Registro de Marcas (Progreso)
            </Text>

            <MarcaFormCard
              colors={colors}
              routines={routines}
              trackingRoutineId={trackingRoutineId}
              trackingExerciseId={trackingExerciseId}
              currentRoutineExercises={currentRoutineExercises}
              onSelectRoutine={handleRoutineChangeInTracking}
              onSelectExercise={(exerciseId: string) => {
                setTrackingExerciseId(exerciseId);
                loadProgressionHistory(exerciseId);
              }}
              marcaWeight={marcaWeight}
              setMarcaWeight={setMarcaWeight}
              marcaReps={marcaReps}
              setMarcaReps={setMarcaReps}
              marcaRpe={marcaRpe}
              setMarcaRpe={setMarcaRpe}
              savingMarca={savingMarca}
              onSave={handleSaveMarca}
              lastSavedSummary={lastSavedSummary}
            />

            <MarcaHistoryList
              colors={colors}
              marcaHistory={marcaHistory}
              onMarcaOptionsPress={handleOpenMarcaOptions}
            />
          </View>
        )}

        {/* ==================== TAB 3: CATÁLOGO ==================== */}
        {activeTab === "catalog" && (
          <CatalogSection
            colors={colors}
            exercises={exercises}
            isStaff={user?.is_staff}
            onOpenAddExercise={() => {
              loadCatalogExtras();
              setShowAddExerciseModal(true);
            }}
            onOpenExerciseDetail={openExerciseDetail}
            onExerciseOptionsPress={handleOpenExerciseOptions}
          />
        )}

        {/* ==================== TAB 4: MÁQUINAS Y EQUIPOS ==================== */}
        {activeTab === "equipment" && (
          <EquipmentSection
            colors={colors}
            equipmentList={equipmentList}
            onOpenAddEquipment={() => setShowAddEquipmentModal(true)}
            onEquipmentOptionsPress={handleOpenEquipmentOptions}
          />
        )}

        {/* ==================== TAB 5: PERFIL / ADMIN ==================== */}
        {activeTab === "profile" && (
          <ProfileSection
            colors={colors}
            showAdminUsers={showAdminUsers}
            adminUsers={adminUsers}
            onLoadAdminUsers={loadAdminUsers}
          />
        )}
      </ScrollView>

      {/* Barra de Navegación Inferior (Sustituye a Home y Explore) */}
      <DashboardTabBar
        colors={colors}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCatalog={loadCatalogExtras}
      />

      <ExerciseDetailModal
        colors={colors}
        visible={modalExerciseVisible}
        exercise={selectedExercise}
        onClose={() => setModalExerciseVisible(false)}
      />

      {/* Modal para seleccionar múltiples ejercicios al crear nueva rutina */}
      <SelectExerciseModal
        visible={showNewRoutineModal}
        colors={colors}
        exercises={exercises}
        routineFocus={newRoutineFocus}
        selectedExerciseIds={newRoutineExerciseIds}
        multiSelect={true}
        onConfirmSelection={(ids) => setNewRoutineExerciseIds(ids)}
        onClose={() => setShowNewRoutineModal(false)}
      />

      <AddExerciseModal
        colors={colors}
        visible={showAddExerciseModal}
        newExName={newExName}
        setNewExName={setNewExName}
        newExVideo={newExVideo}
        setNewExVideo={setNewExVideo}
        newExInstructions={newExInstructions}
        setNewExInstructions={setNewExInstructions}
        equipmentList={equipmentList}
        selectedEquipment={newExEquipment}
        setSelectedEquipment={setNewExEquipment}
        muscleList={muscleList}
        selectedMuscle={newExMuscle}
        setSelectedMuscle={setNewExMuscle}
        onSubmit={handleCreateExercise}
        onClose={() => setShowAddExerciseModal(false)}
      />

      <AddEquipmentModal
        colors={colors}
        visible={showAddEquipmentModal}
        onSubmit={handleCreateEquipment}
        onClose={() => setShowAddEquipmentModal(false)}
      />

      {/* Action Sheet al Dejar Presionado / Tocar Select ⋮ */}
      <ItemActionSheet
        visible={Boolean(actionSheetItem)}
        colors={colors}
        itemType={actionSheetItem?.type || "routine"}
        itemTitle={actionSheetItem?.title || ""}
        itemSubtitle={actionSheetItem?.subtitle}
        onEdit={() => {
          setEditModalItem(actionSheetItem);
          setActionSheetItem(null);
        }}
        onDelete={() => {
          if (actionSheetItem) {
            setDeleteConfirmItem({
              type: actionSheetItem.type,
              id: actionSheetItem.data.id,
              title: actionSheetItem.title,
            });
          }
          setActionSheetItem(null);
        }}
        onClose={() => setActionSheetItem(null)}
      />

      {/* Modal de Edición en Base de Datos */}
      <EditItemModal
        visible={Boolean(editModalItem)}
        colors={colors}
        itemType={editModalItem?.type || "routine"}
        routineData={
          editModalItem?.type === "routine" ? editModalItem.data : null
        }
        exerciseData={
          editModalItem?.type === "exercise"
            ? {
                id: editModalItem.data.id,
                name: editModalItem.data.name,
                equipment_id:
                  editModalItem.data.equipment?.id ||
                  editModalItem.data.equipment_id ||
                  null,
                instructions: editModalItem.data.instructions || "",
                video_url:
                  editModalItem.data.media?.[0]?.external_url ||
                  editModalItem.data.video_url ||
                  "",
                muscle_id:
                  editModalItem.data.muscles?.[0]?.muscle ||
                  null,
              }
            : null
        }
        marcaData={
          editModalItem?.type === "marca"
            ? {
                id: editModalItem.data.id,
                weight: editModalItem.data.weight,
                reps: editModalItem.data.reps,
                rpe: editModalItem.data.rpe,
              }
            : null
        }
        equipmentData={
          editModalItem?.type === "equipment" ? editModalItem.data : null
        }
        equipmentList={equipmentList}
        muscleList={muscleList}
        allExercises={exercises}
        onSaveRoutine={handleSaveRoutineEdit}
        onSaveExercise={handleSaveExerciseEdit}
        onSaveMarca={handleSaveMarcaEdit}
        onSaveEquipment={handleSaveEquipmentEdit}
        onRemoveExerciseFromRoutine={handleRemoveExerciseFromRoutine}
        onAddExerciseToRoutine={handleAddExerciseToRoutineInEdit}
        onClose={() => setEditModalItem(null)}
      />

      {/* Modal de Confirmación para Borrar de la BD */}
      <ConfirmDeleteModal
        visible={Boolean(deleteConfirmItem)}
        colors={colors}
        itemTitle={deleteConfirmItem?.title || ""}
        itemType={deleteConfirmItem?.type || "routine"}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmItem(null)}
      />

      {/* Notificaciones Animadas Flotantes */}
      <AnimatedToast toast={toast} onDismiss={() => setToast(null)} />
    </View>
  );
};
