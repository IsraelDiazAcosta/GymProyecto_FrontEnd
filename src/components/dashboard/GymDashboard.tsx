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
  Alert,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { AddExerciseModal } from "./AddExerciseModal";
import { CatalogSection } from "./CatalogSection";
import { CreateRoutineCard } from "./CreateRoutineCard";
import { DashboardTabBar } from "./DashboardTabBar";
import { styles } from "./dashboardStyles";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { MarcaFormCard } from "./MarcaFormCard";
import { MarcaHistoryList } from "./MarcaHistoryList";
import { ProfileSection } from "./ProfileSection";
import RMTrackingChart from "./RMTrackingChart";
import { RoutineCard } from "./RoutineCard";
import { TabType } from "./types";

export const GymDashboard: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("routines");
  const [loading, setLoading] = useState(false);

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
  const [newRoutineFocus, setNewRoutineFocus] =useState("fullbody");
  const [selectedRoutineForAdd, setSelectedRoutineForAdd] = useState<
    string | null
  >(null);
  const [selectedExToAdd, setSelectedExToAdd] = useState<string>("");
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

  // Estados de Admin
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showAdminUsers, setShowAdminUsers] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [exList, rList] = await Promise.all([
        api.getExercises(),
        api.getRoutines(),
      ]);
      setExercises(exList);
      setRoutines(rList);

      if (rList.length > 0) {
        setTrackingRoutineId(rList[0].id);
        const firstRoutineEx = getExercisesOfRoutine(rList[0]);
        if (firstRoutineEx.length > 0) {
          setTrackingExerciseId(firstRoutineEx[0].id);
          loadProgressionHistory(firstRoutineEx[0].id);
        }
      }
    } catch (e: any) {
      Alert.alert("Error de conexión", e.message);
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
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async () => {
    if (!newExName.trim())
      return Alert.alert("Error", "Ingresa el nombre del ejercicio");
    try {
      setLoading(true);
      await api.createExercise({
        name: newExName,
        instructions: newExInstructions || "Ejecución estándar.",
        video_url: newExVideo,
        equipment_id: newExEquipment,
        muscle_id: newExMuscle,
      });
      Alert.alert("¡Éxito!", "Ejercicio agregado al catálogo oficial");
      setShowAddExerciseModal(false);
      setNewExName("");
      setNewExInstructions("");
      setNewExVideo("");
      const updated = await api.getExercises();
      setExercises(updated);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RUTINAS ---
  const handleCreateRoutine = async () => {
    if (!newRoutineTitle.trim())
      return Alert.alert(
        "Error",
        "Ingresa el nombre de la rutina (ej. Lunes-Pecho)",
      );
    try {
      setLoading(true);
      await api.createRoutine(newRoutineTitle.trim(),newRoutineFocus);
      setNewRoutineTitle("");
      const updated = await api.getRoutines();
      setRoutines(updated);
      Alert.alert("¡Creada!", "Rutina creada correctamente");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExerciseToRoutine = async (routineId: string) => {
    if (!selectedExToAdd)
      return Alert.alert("Error", "Selecciona un ejercicio");
    const routine = routines.find((r) => r.id === routineId);

const existingExercises = getExercisesOfRoutine(routine);

const alreadyExists = existingExercises.some(
  (ex) => ex.id === selectedExToAdd
);

if (alreadyExists) {
  return Alert.alert(
    "Ejercicio duplicado",
    "Este ejercicio ya existe en la rutina seleccionada."
  );
}
    try {
      setLoading(true);
      await api.addExerciseToRoutine(routineId, {
        exercise_id: selectedExToAdd,
        sets_count: parseInt(setsCount) || 3,
        min_reps: parseInt(minReps) || 8,
        max_reps: parseInt(maxReps) || 12,
      });
      setSelectedRoutineForAdd(null);
      const updated = await api.getRoutines();
      setRoutines(updated);
      Alert.alert("¡Agregado!", "Ejercicio añadido a tu rutina");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const getExercisesOfRoutine = (routine?: Routine) => {
    if (!routine || !routine.days) return [];
    const list: { id: string; name: string }[] = [];
    routine.days.forEach((d) => {
      d.exercises?.forEach((e) => {
        list.push({ id: e.exercise, name: e.exercise_detail.name });
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
      return Alert.alert("Error", "Selecciona un ejercicio de tu rutina");
    const w = parseFloat(marcaWeight);
    const r = parseInt(marcaReps);
    const rpe = parseFloat(marcaRpe) || undefined;

    if (isNaN(w) || isNaN(r))
      return Alert.alert("Error", "Ingresa peso y reps válidos");

    try {
      setSavingMarca(true);
      const res = await api.saveMarca(trackingExerciseId, w, r, rpe);
      setLastSavedSummary(
        `✓ Guardado: ${w}kg x ${r} reps (1RM estimado: ${res.estimated_1rm}kg)`,
      );
      await loadProgressionHistory(trackingExerciseId);
    } catch (e: any) {
      Alert.alert("Error", e.message);
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
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const currentRoutineObj = routines.find((r) => r.id === trackingRoutineId);
  const currentRoutineExercises = getExercisesOfRoutine(currentRoutineObj);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <DashboardTabBar
        colors={colors}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCatalog={loadCatalogExtras}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#10b981" size="small" />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
              onSelectExercise={(exerciseId) => {
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
                setsCount={setsCount}
                setSetsCount={setSetsCount}
                minReps={minReps}
                setMinReps={setMinReps}
                maxReps={maxReps}
                setMaxReps={setMaxReps}
                onStartAdding={() => {
                  setSelectedRoutineForAdd(routine.id);
                  if (exercises.length > 0) setSelectedExToAdd(exercises[0].id);
                }}
                onCancelAdding={() => setSelectedRoutineForAdd(null)}
                onAddExercise={() => handleAddExerciseToRoutine(routine.id)}
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
              onSelectExercise={(exerciseId) => {
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

            <MarcaHistoryList colors={colors} marcaHistory={marcaHistory} />
          </View>
        )}

        {/* ==================== TAB 3: CATÁLOGO ==================== */}
        {activeTab === "catalog" && (
          <CatalogSection
            colors={colors}
            exercises={exercises}
            isStaff={user?.is_staff}
            onOpenAddExercise={() => setShowAddExerciseModal(true)}
            onOpenExerciseDetail={openExerciseDetail}
          />
        )}

        {/* ==================== TAB 4: PERFIL / ADMIN ==================== */}
        {activeTab === "profile" && (
          <ProfileSection
            colors={colors}
            showAdminUsers={showAdminUsers}
            adminUsers={adminUsers}
            onLoadAdminUsers={loadAdminUsers}
          />
        )}
      </ScrollView>

      <ExerciseDetailModal
        colors={colors}
        visible={modalExerciseVisible}
        exercise={selectedExercise}
        onClose={() => setModalExerciseVisible(false)}
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
        onSubmit={handleCreateExercise}
        onClose={() => setShowAddExerciseModal(false)}
      />
    </View>
  );
};
