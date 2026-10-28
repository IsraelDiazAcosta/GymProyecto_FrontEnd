import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Colors, Spacing } from "@/constants/theme";
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
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import RMTrackingChart from "./RMTrackingChart";

type TabType = "catalog" | "routines" | "tracking" | "profile";

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
      {/* BARRA DE NAVEGACIÓN SUPERIOR (TABS DEPORTIVAS) */}
      <View
        style={[styles.tabBar, { backgroundColor: colors.backgroundElement }]}
      >
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "routines" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("routines")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "routines" && styles.tabTextActive,
            ]}
          >
            Rutinas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "tracking" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("tracking")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "tracking" && styles.tabTextActive,
            ]}
          >
            Marcas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "catalog" && styles.tabButtonActive,
          ]}
          onPress={() => {
            setActiveTab("catalog");
            loadCatalogExtras();
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "catalog" && styles.tabTextActive,
            ]}
          >
            Catálogo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "profile" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("profile")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "profile" && styles.tabTextActive,
            ]}
          >
            Perfil
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#ff6b00" size="small" />
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

            {/* Crear Rutina */}
            
<View
  style={[
    styles.card,
    { backgroundColor: colors.backgroundElement },
  ]}
>
  <Text style={[styles.cardTitle, { color: colors.text }]}>
    ➕ Nueva Rutina
  </Text>

  <Text
    style={{
      color: colors.textSecondary,
      marginTop: 8,
      marginBottom: 4,
      fontSize: 12,
    }}
  >
    Grupo muscular principal:
  </Text>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginBottom: 10 }}
  >
    {[
      { value: "pecho", label: "Pecho" },
      { value: "espalda", label: "Espalda" },
      { value: "pierna", label: "Pierna" },
      { value: "hombro", label: "Hombro" },
      { value: "brazo", label: "Brazo" },
      { value: "core", label: "Core" },
      { value: "fullbody", label: "Full Body" },
    ].map((option) => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.chip,
          newRoutineFocus === option.value &&
            styles.chipActive,
        ]}
        onPress={() =>
          setNewRoutineFocus(option.value)
        }
      >
        <Text
          style={[
            styles.chipText,
            newRoutineFocus === option.value &&
              styles.chipTextActive,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>

  <View style={styles.inlineRow}>
    <TextInput
      style={[styles.input, { color: colors.text, flex: 1 }]}
      placeholder="Ej: Lunes-Pecho, Pierna Pesada"
      placeholderTextColor={colors.textSecondary}
      value={newRoutineTitle}
      onChangeText={setNewRoutineTitle}
    />

    <TouchableOpacity
      style={styles.smallPrimaryBtn}
      onPress={handleCreateRoutine}
    >
      <Text style={styles.btnTextWhite}>Crear</Text>
    </TouchableOpacity>
  </View>
</View>

            {/* Lista de Rutinas */}
            {routines.map((routine) => {
              const routineExercises = getExercisesOfRoutine(routine);
              const isAdding = selectedRoutineForAdd === routine.id;
              const filteredExercises = exercises.filter((ex) => {
                if (!routine.focus || routine.focus === "fullbody") {
              return true;}
              const bodyPart =ex.muscles?.[0]?.body_part?.toLowerCase();
                return bodyPart === routine.focus.toLowerCase();});
              return (
                <View
                  key={routine.id}
                  style={[
                    styles.card,
                    { backgroundColor: colors.backgroundElement },
                  ]}
                >
                 <View style={styles.routineHeader}>
                  <Text style={[styles.routineTitle, { color: colors.text }]}>
                    📋 {routine.title}
                  </Text>

                 

                  <Text
                    style={[
                      styles.routineSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {routineExercises.length} ejercicio(s)
                  </Text>
                </View>

                  {/* Ejercicios agregados */}
                  {routineExercises.length > 0 ? (
                    routineExercises.map((ex, idx) => (
                      <View key={idx} style={styles.exerciseBadge}>
                        <Text style={styles.exerciseBadgeText}>
                          ✓ {ex.name}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text
                      style={[
                        styles.emptyHint,
                        { color: colors.textSecondary },
                      ]}
                    >
                      (Aún no has agregado ejercicios a esta rutina)
                    </Text>
                  )}

                  {/* Botón / Formulario para agregar ejercicio */}
                  {isAdding ? (
                    <View style={styles.addExerciseBox}>
                      <Text style={styles.addExerciseBoxTitle}>
                        Selecciona ejercicio del catálogo:
                      </Text>
                      
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginVertical: 6 }}
                      >
                        {filteredExercises.map((ex) => (
                          <TouchableOpacity
                            key={ex.id}
                            style={[
                              styles.chip,
                              selectedExToAdd === ex.id && styles.chipActive,
                            ]}
                            onPress={() => setSelectedExToAdd(ex.id)}
                          >
                            <Text
                              style={[styles.chipText,selectedExToAdd === ex.id &&
                                styles.chipTextActive,]}>
                              {ex.name}
                              {" "}
                              (
                              {ex.muscles?.[0]?.body_part || "Sin músculo"}
                              )
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <View style={styles.inlineRow}>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              width: 70,
                              textAlign: "center",
                              color: colors.text,
                            },
                          ]}
                          placeholder="Series"
                          value={setsCount}
                          onChangeText={setSetsCount}
                          keyboardType="numeric"
                        />
                        <TextInput
                          style={[
                            styles.input,
                            {
                              width: 60,
                              textAlign: "center",
                              color: colors.text,
                            },
                          ]}
                          placeholder="Min"
                          value={minReps}
                          onChangeText={setMinReps}
                          keyboardType="numeric"
                        />
                        <TextInput
                          style={[
                            styles.input,
                            {
                              width: 60,
                              textAlign: "center",
                              color: colors.text,
                            },
                          ]}
                          placeholder="Max"
                          value={maxReps}
                          onChangeText={setMaxReps}
                          keyboardType="numeric"
                        />
                        <TouchableOpacity
                          style={styles.smallPrimaryBtn}
                          onPress={() => handleAddExerciseToRoutine(routine.id)}
                        >
                          <Text style={styles.btnTextWhite}>Añadir</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => setSelectedRoutineForAdd(null)}
                      >
                        <Text style={styles.cancelText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addBtnOutline}
                      onPress={() => {
                        setSelectedRoutineForAdd(routine.id);
                        if (exercises.length > 0)
                          setSelectedExToAdd(exercises[0].id);
                      }}
                    >
                      <Text style={styles.addBtnOutlineText}>
                        + Agregar Ejercicio del Catálogo
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ==================== TAB 2: MARCAS (TRACKING) ==================== */}
        {activeTab === "tracking" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Registro de Marcas (Progreso)
            </Text>

            <View
              style={[
                styles.card,
                { backgroundColor: colors.backgroundElement },
              ]}
            >
              {/* Paso 1: Elegir Rutina */}
              <Text style={styles.stepLabel}>1. Selecciona tu Rutina:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {routines.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.chip,
                      trackingRoutineId === r.id && styles.chipActive,
                    ]}
                    onPress={() => handleRoutineChangeInTracking(r.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        trackingRoutineId === r.id && styles.chipTextActive,
                      ]}
                    >
                      📋 {r.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Paso 2: Elegir Ejercicio de esa Rutina */}
              <Text style={styles.stepLabel}>2. Ejercicio de esta Rutina:</Text>
              {currentRoutineExercises.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 12 }}
                >
                  {currentRoutineExercises.map((ex) => (
                    <TouchableOpacity
                      key={ex.id}
                      style={[
                        styles.chip,
                        trackingExerciseId === ex.id && styles.chipActive,
                      ]}
                      onPress={() => {
                        setTrackingExerciseId(ex.id);
                        loadProgressionHistory(ex.id);
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          trackingExerciseId === ex.id && styles.chipTextActive,
                        ]}
                      >
                        🏋️ {ex.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text
                  style={[
                    styles.emptyHint,
                    { color: "#cf1322", marginBottom: 10 },
                  ]}
                >
                  ⚠️ Esta rutina no tiene ejercicios. Agrégalos en la pestaña
                  "Rutinas".
                </Text>
              )}

              {/* Paso 3: Inputs de Marca */}
              <View style={styles.inlineRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    Peso (kg)
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    keyboardType="numeric"
                    value={marcaWeight}
                    onChangeText={setMarcaWeight}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    Reps
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    keyboardType="numeric"
                    value={marcaReps}
                    onChangeText={setMarcaReps}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    RPE
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    keyboardType="numeric"
                    value={marcaRpe}
                    onChangeText={setMarcaRpe}
                  />
                </View>
              </View>

              <AppButton
                title="💾 Guardar Marca (Serie)"
                onPress={handleSaveMarca}
                loading={savingMarca}
                style={{ marginTop: 12 }}
              />

              {lastSavedSummary && (
                <Text style={styles.successSavedText}>{lastSavedSummary}</Text>
              )}
            </View>

            {/* Historial en Vivo */}
            <Text
              style={[styles.subTitle, { color: colors.text, marginTop: 14 }]}
            >
              📈 Historial de Levantamientos:
            </Text>
            {marcaHistory.length > 0 ? (
              marcaHistory.map((item, idx) => {
                const oneRm =
                  item.reps > 0 && item.reps < 37
                    ? (item.weight * (36 / (37 - item.reps))).toFixed(1)
                    : item.weight;
                const fecha = new Date(item.logged_at).toLocaleDateString();

                return (
                  <View
                    key={idx}
                    style={[
                      styles.historyRow,
                      { backgroundColor: colors.backgroundElement },
                    ]}
                  >
                    <View>
                      <Text
                        style={[styles.historyWeight, { color: colors.text }]}
                      >
                        {item.weight} kg × {item.reps} reps
                      </Text>
                      <Text
                        style={[
                          styles.historyDate,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {fecha} {item.rpe ? `| RPE ${item.rpe}` : ""}
                      </Text>
                    </View>
                    <View style={styles.oneRmBadge}>
                      <Text style={styles.oneRmBadgeText}>1RM: {oneRm} kg</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                Aún no hay marcas registradas para este ejercicio.
              </Text>
            )}
          </View>
        )}

        {/* ==================== TAB 3: CATÁLOGO ==================== */}
        {activeTab === "catalog" && (
          <View style={styles.section}>
            <View style={styles.headerWithBtn}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text, marginBottom: 0 },
                ]}
              >
                Catálogo de Ejercicios
              </Text>
              {user?.is_staff && (
                <TouchableOpacity
                  style={styles.adminActionBtn}
                  onPress={() => setShowAddExerciseModal(true)}
                >
                  <Text style={styles.btnTextWhite}>➕ Nuevo (Admin)</Text>
                </TouchableOpacity>
              )}
            </View>

            {exercises.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                style={[
                  styles.exerciseCard,
                  { backgroundColor: colors.backgroundElement },
                ]}
                onPress={() => openExerciseDetail(ex.id)}
              >
                <View>
                  <Text style={[styles.exerciseName, { color: colors.text }]}>
                    {ex.name}
                  </Text>
                  <Text
                    style={[
                      styles.exerciseInfo,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Máquina: {ex.equipment_name || "Sin máquina"}
                  </Text>
                </View>
                <View style={styles.verMasBadge}>
                  <Text style={styles.verMasText}>Ver Detalle / Video ›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ==================== TAB 4: PERFIL / ADMIN ==================== */}
        {activeTab === "profile" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Mi Cuenta
            </Text>

            <View
              style={[
                styles.card,
                { backgroundColor: colors.backgroundElement },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {user?.email}
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: colors.textSecondary }]}
              >
                Rol:{" "}
                {user?.is_staff
                  ? "🛡️ Administrador del Gimnasio"
                  : "👤 Atleta Convencional"}
              </Text>

              {user?.is_staff && (
                <TouchableOpacity
                  style={[
                    styles.adminActionBtn,
                    { alignSelf: "flex-start", marginVertical: 10 },
                  ]}
                  onPress={loadAdminUsers}
                >
                  <Text style={styles.btnTextWhite}>
                    👥 Ver Todos los Usuarios Registrados
                  </Text>
                </TouchableOpacity>
              )}

              {showAdminUsers && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.stepLabel, { color: colors.text }]}>
                    Usuarios en la Base de Datos:
                  </Text>
                  {adminUsers.map((u, i) => (
                    <View key={i} style={styles.adminUserItem}>
                      <Text style={{ fontWeight: "bold" }}>{u.email}</Text>
                      <Text style={{ fontSize: 12, color: "#666" }}>
                        Rol: {u.is_staff ? "Admin" : "Usuario"} | Rutinas:{" "}
                        {u.routines_count}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <AppButton
                title="Cerrar Sesión"
                variant="outline"
                onPress={logout}
                style={{ marginTop: 14 }}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* ==================== MODAL: DETALLE DEL EJERCICIO CON VIDEO ==================== */}
      <Modal visible={modalExerciseVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedExercise?.name}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={[styles.modalLabel, { color: colors.textSecondary }]}
              >
                Máquina / Equipo:
              </Text>
              <Text style={[styles.modalValue, { color: colors.text }]}>
                {selectedExercise?.equipment?.name ||
                  "Peso corporal / Sin máquina"}{" "}
                ({selectedExercise?.equipment?.brand || "Genérica"})
              </Text>

              <Text
                style={[
                  styles.modalLabel,
                  { color: colors.textSecondary, marginTop: 10 },
                ]}
              >
                Instrucciones Técnicas:
              </Text>
              <Text style={[styles.modalValue, { color: colors.text }]}>
                {selectedExercise?.instructions ||
                  "Sin instrucciones cargadas."}
              </Text>

              <Text
                style={[
                  styles.modalLabel,
                  { color: colors.textSecondary, marginTop: 10 },
                ]}
              >
                Demostración Multimedia:
              </Text>
              {selectedExercise?.media && selectedExercise.media.length > 0 ? (
                selectedExercise.media.map((m, idx) => (
                  <View key={idx} style={styles.mediaBox}>
                    <Text style={{ fontWeight: "bold", color: "#ff6b00" }}>
                      🎬 {m.title || "Video Demostrativo"}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#0066cc", marginTop: 4 }}
                    >
                      {m.external_url || m.file}
                    </Text>
                  </View>
                ))
              ) : (
                <Text
                  style={{ fontStyle: "italic", color: "#888", marginTop: 4 }}
                >
                  (Sin video o imagen asociada)
                </Text>
              )}
            </ScrollView>

            <AppButton
              title="Cerrar"
              variant="secondary"
              onPress={() => setModalExerciseVisible(false)}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL ADMIN: AGREGAR EJERCICIO ==================== */}
      <Modal visible={showAddExerciseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              ➕ Nuevo Ejercicio (Admin)
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <AppInput
                label="Nombre del Ejercicio"
                placeholder="Ej: Press Inclinado con Mancuernas"
                value={newExName}
                onChangeText={setNewExName}
              />

              <AppInput
                label="URL de Video (YouTube o MP4)"
                placeholder="https://youtu.be/..."
                value={newExVideo}
                onChangeText={setNewExVideo}
              />

              <AppInput
                label="Instrucciones"
                placeholder="Paso a paso de ejecución..."
                value={newExInstructions}
                onChangeText={setNewExInstructions}
                multiline
              />
            </ScrollView>

            <AppButton
              title="Publicar Ejercicio"
              onPress={handleCreateExercise}
            />
            <TouchableOpacity
              onPress={() => setShowAddExerciseModal(false)}
              style={{ marginTop: 8, alignItems: "center" }}
            >
              <Text style={{ color: "#888" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#ff6b00",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: Spacing.two,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  headerWithBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  card: {
    borderRadius: 14,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  routineHeader: {
    marginBottom: 8,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  routineSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  smallPrimaryBtn: {
    backgroundColor: "#ff6b00",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnTextWhite: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  exerciseBadge: {
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 2,
  },
  exerciseBadgeText: {
    color: "#ff6b00",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyHint: {
    fontSize: 12,
    fontStyle: "italic",
    marginVertical: 4,
  },
  addBtnOutline: {
    borderWidth: 1,
    borderColor: "#ff6b00",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: "center",
    marginTop: 8,
  },
  addBtnOutlineText: {
    color: "#ff6b00",
    fontSize: 12,
    fontWeight: "700",
  },
  addExerciseBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  addExerciseBoxTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff6b00",
  },
  chip: {
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: "#ff6b00",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  cancelText: {
    color: "#888",
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    color: "#ff6b00",
  },
  successSavedText: {
    color: "#28a745",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  historyWeight: {
    fontSize: 15,
    fontWeight: "700",
  },
  historyDate: {
    fontSize: 11,
    marginTop: 2,
  },
  oneRmBadge: {
    backgroundColor: "#ff6b00",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  oneRmBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  exerciseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "700",
  },
  exerciseInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  verMasBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verMasText: {
    color: "#ff6b00",
    fontSize: 12,
    fontWeight: "700",
  },
  adminActionBtn: {
    backgroundColor: "#d46b08",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminUserItem: {
    backgroundColor: "rgba(150,150,150,0.1)",
    padding: 6,
    borderRadius: 6,
    marginVertical: 3,
  },
  loadingOverlay: {
    padding: 4,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  modalValue: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 18,
  },
  mediaBox: {
    backgroundColor: "rgba(255,107,0,0.08)",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
});
