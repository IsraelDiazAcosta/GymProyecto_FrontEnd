import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Equipment, Exercise, Routine } from "@/services/api";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import {
  getExerciseMuscleLabel,
  isExerciseCompatibleWithFocus,
} from "./muscleValidation";
import { EQUIPMENT_TYPES } from "./AddEquipmentModal";
import { DashboardColors, RoutineExerciseItem } from "./types";

const FOCUS_OPTIONS = [
  { value: "pecho", label: "Pecho" },
  { value: "espalda", label: "Espalda" },
  { value: "pierna", label: "Pierna" },
  { value: "hombro", label: "Hombro" },
  { value: "brazo", label: "Brazo" },
  { value: "core", label: "Core" },
  { value: "fullbody", label: "Full Body" },
];

interface EditItemModalProps {
  visible: boolean;
  colors: DashboardColors;
  itemType: "routine" | "exercise" | "marca" | "equipment";
  routineData?: Routine | null;
  exerciseData?: {
    id: string;
    name: string;
    equipment_id: number | null;
    instructions: string;
    video_url?: string;
  } | null;
  marcaData?: {
    id: string;
    weight: number;
    reps: number;
    rpe?: number;
  } | null;
  equipmentData?: {
    id: number;
    name: string;
    equipment_type: string;
    brand: string;
    description?: string;
    setup_guide?: string;
  } | null;
  equipmentList: Equipment[];
  allExercises?: Exercise[];
  onSaveRoutine: (id: string, title: string, focus: string) => Promise<void>;
  onSaveExercise: (
    id: string,
    name: string,
    equipment_id: number | null,
    instructions: string,
    video_url?: string
  ) => Promise<void>;
  onSaveMarca?: (
    id: string,
    weight: number,
    reps: number,
    rpe?: number
  ) => Promise<void>;
  onSaveEquipment?: (
    id: number,
    payload: {
      name: string;
      equipment_type: string;
      brand?: string;
      description?: string;
      setup_guide?: string;
    }
  ) => Promise<void>;
  onRemoveExerciseFromRoutine?: (
    routineExerciseId: string,
    exerciseName: string
  ) => Promise<void>;
  onAddExerciseToRoutine?: (
    routineId: string,
    exerciseId: string,
    setsCount: number,
    minReps: number,
    maxReps: number
  ) => Promise<void>;
  onClose: () => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  visible,
  colors,
  itemType,
  routineData,
  exerciseData,
  marcaData,
  equipmentData,
  equipmentList,
  allExercises = [],
  onSaveRoutine,
  onSaveExercise,
  onSaveMarca,
  onSaveEquipment,
  onRemoveExerciseFromRoutine,
  onAddExerciseToRoutine,
  onClose,
}) => {
  // Estados para Rutina
  const [routineTitle, setRoutineTitle] = useState("");
  const [routineFocus, setRoutineFocus] = useState("fullbody");

  // Estados para agregar ejercicio a rutina
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [selectedExToAddId, setSelectedExToAddId] = useState("");
  const [newSets, setNewSets] = useState("3");
  const [newMinReps, setNewMinReps] = useState("8");
  const [newMaxReps, setNewMaxReps] = useState("12");
  const [exDropdownOpen, setExDropdownOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Estados para Ejercicio del Catálogo
  const [exName, setExName] = useState("");
  const [exEquipment, setExEquipment] = useState<number | null>(null);
  const [exVideo, setExVideo] = useState("");
  const [exInstructions, setExInstructions] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Estados para Marca / Registro de serie
  const [marcaWeight, setMarcaWeight] = useState("100");
  const [marcaReps, setMarcaReps] = useState("10");
  const [marcaRpe, setMarcaRpe] = useState("");

  // Estados para Equipo / Máquina
  const [eqName, setEqName] = useState("");
  const [eqType, setEqType] = useState("plate_loaded");
  const [eqBrand, setEqBrand] = useState("");
  const [eqSetupGuide, setEqSetupGuide] = useState("");
  const [eqDescription, setEqDescription] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (routineData && itemType === "routine") {
      setRoutineTitle(routineData.title);
      setRoutineFocus(routineData.focus || "fullbody");
      setIsAddingExercise(false);
      setSelectedExToAddId("");
      setExDropdownOpen(false);
    }
    if (exerciseData && itemType === "exercise") {
      setExName(exerciseData.name);
      setExEquipment(exerciseData.equipment_id);
      setExVideo(exerciseData.video_url || "");
      setExInstructions(exerciseData.instructions || "");
      setDropdownOpen(false);
    }
    if (marcaData && itemType === "marca") {
      setMarcaWeight(String(marcaData.weight));
      setMarcaReps(String(marcaData.reps));
      setMarcaRpe(
        marcaData.rpe !== undefined && marcaData.rpe !== null
          ? String(marcaData.rpe)
          : ""
      );
    }
    if (equipmentData && itemType === "equipment") {
      setEqName(equipmentData.name);
      setEqType(equipmentData.equipment_type || "plate_loaded");
      setEqBrand(equipmentData.brand || "");
      setEqSetupGuide(equipmentData.setup_guide || "");
      setEqDescription(equipmentData.description || "");
    }
  }, [
    routineData,
    exerciseData,
    marcaData,
    equipmentData,
    itemType,
    visible,
  ]);

  // Obtener lista de ejercicios actualmente en la rutina
  const assignedExercises: RoutineExerciseItem[] = [];
  if (routineData?.days) {
    routineData.days.forEach((d) => {
      d.exercises?.forEach((e) => {
        const setsCount = e.target_sets?.length || 3;
        const firstSet = e.target_sets?.[0];
        assignedExercises.push({
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
  }

  // Filtrar ejercicios disponibles para agregar (compatibles y no repetidos)
  const assignedExerciseIds = new Set(assignedExercises.map((ae) => ae.id));
  const availableExercises = allExercises.filter(
    (ex) =>
      !assignedExerciseIds.has(ex.id) &&
      isExerciseCompatibleWithFocus(ex, routineFocus)
  );

  const selectedExerciseToAdd = allExercises.find(
    (ex) => ex.id === selectedExToAddId
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      if (itemType === "routine" && routineData) {
        await onSaveRoutine(routineData.id, routineTitle.trim(), routineFocus);
      } else if (itemType === "exercise" && exerciseData) {
        await onSaveExercise(
          exerciseData.id,
          exName.trim(),
          exEquipment,
          exInstructions,
          exVideo.trim() || undefined
        );
      } else if (itemType === "marca" && marcaData) {
        const w = parseFloat(marcaWeight) || 0;
        const r = parseInt(marcaReps) || 0;
        const rpeVal = marcaRpe.trim() ? parseFloat(marcaRpe) : undefined;
        await onSaveMarca?.(marcaData.id, w, r, rpeVal);
      } else if (itemType === "equipment" && equipmentData) {
        await onSaveEquipment?.(equipmentData.id, {
          name: eqName.trim(),
          equipment_type: eqType,
          brand: eqBrand.trim() || undefined,
          setup_guide: eqSetupGuide.trim() || undefined,
          description: eqDescription.trim() || undefined,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExercise = async (
    routineExerciseId: string,
    exName: string
  ) => {
    if (!routineExerciseId) return;
    try {
      Vibration.vibrate(40);
    } catch {}
    setActionLoadingId(routineExerciseId);
    try {
      await onRemoveExerciseFromRoutine?.(routineExerciseId, exName);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmAddExercise = async () => {
    if (!selectedExToAddId || !routineData) return;
    try {
      Vibration.vibrate(40);
    } catch {}
    setActionLoadingId("adding_ex");
    try {
      await onAddExerciseToRoutine?.(
        routineData.id,
        selectedExToAddId,
        parseInt(newSets) || 3,
        parseInt(newMinReps) || 8,
        parseInt(newMaxReps) || 12
      );
      setSelectedExToAddId("");
      setIsAddingExercise(false);
      setExDropdownOpen(false);
    } finally {
      setActionLoadingId(null);
    }
  };

  const selectedEquipmentObj = equipmentList.find((e) => e.id === exEquipment);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={editStyles.overlay}>
        <View
          style={[editStyles.card, { backgroundColor: colors.background }]}
        >
          {/* Header */}
          <View style={editStyles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[editStyles.title, { color: colors.text }]}>
                {itemType === "routine"
                  ? "✏️ Editar Rutina"
                  : itemType === "marca"
                    ? "✏️ Editar Marca"
                    : itemType === "equipment"
                      ? "✏️ Editar Máquina / Equipo"
                      : "✏️ Editar Ejercicio"}
              </Text>
              <Text style={[editStyles.subtitle, { color: colors.textSecondary }]}>
                {itemType === "routine"
                  ? "Modifica nombre, grupo muscular y administra sus ejercicios"
                  : itemType === "marca"
                    ? "Actualiza peso, repeticiones o RPE de esta serie en la BD"
                    : itemType === "equipment"
                      ? "Actualiza nombre, tipo, marca o ajustes en la BD"
                      : "Actualiza los datos técnicos en la base de datos"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={editStyles.closeBtn}>
              <Text
                style={[
                  editStyles.closeBtnText,
                  { color: colors.textSecondary },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 6 }}
          >
            {itemType === "marca" ? (
              /* ================= FORMULARIO MARCA ================= */
              <View style={{ paddingVertical: 4 }}>
                <Text
                  style={[
                    editStyles.fieldLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Peso levantado (kg):
                </Text>
                <TextInput
                  style={[
                    editStyles.repsInput,
                    {
                      backgroundColor: colors.backgroundElement,
                      color: colors.text,
                      borderColor: "rgba(150, 150, 150, 0.3)",
                      height: 48,
                      marginBottom: 12,
                      fontSize: 18,
                    },
                  ]}
                  keyboardType="numeric"
                  value={marcaWeight}
                  onChangeText={setMarcaWeight}
                  placeholder="Ej: 100"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text
                  style={[
                    editStyles.fieldLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Repeticiones completadas:
                </Text>
                <TextInput
                  style={[
                    editStyles.repsInput,
                    {
                      backgroundColor: colors.backgroundElement,
                      color: colors.text,
                      borderColor: "rgba(150, 150, 150, 0.3)",
                      height: 48,
                      marginBottom: 12,
                      fontSize: 18,
                    },
                  ]}
                  keyboardType="numeric"
                  value={marcaReps}
                  onChangeText={setMarcaReps}
                  placeholder="Ej: 10"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text
                  style={[
                    editStyles.fieldLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Esfuerzo percibido RPE (1-10, opcional):
                </Text>
                <TextInput
                  style={[
                    editStyles.repsInput,
                    {
                      backgroundColor: colors.backgroundElement,
                      color: colors.text,
                      borderColor: "rgba(150, 150, 150, 0.3)",
                      height: 48,
                      marginBottom: 16,
                      fontSize: 18,
                    },
                  ]}
                  keyboardType="numeric"
                  value={marcaRpe}
                  onChangeText={setMarcaRpe}
                  placeholder="Ej: 8.5"
                  placeholderTextColor={colors.textSecondary}
                />

                {/* Cálculo en vivo de 1RM */}
                {Boolean(
                  parseFloat(marcaWeight) > 0 && parseInt(marcaReps) > 0
                ) && (
                  <View
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                      borderRadius: 12,
                      padding: 12,
                      alignItems: "center",
                      marginBottom: 14,
                      borderWidth: 1,
                      borderColor: "rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#10b981",
                        fontWeight: "800",
                        fontSize: 15,
                      }}
                    >
                      1RM Estimado:{" "}
                      {parseInt(marcaReps) > 0 && parseInt(marcaReps) < 37
                        ? (
                            parseFloat(marcaWeight) *
                            (36 / (37 - parseInt(marcaReps)))
                          ).toFixed(1)
                        : parseFloat(marcaWeight)}{" "}
                      kg
                    </Text>
                  </View>
                )}
              </View>
            ) : itemType === "routine" ? (
              /* ================= FORMULARIO RUTINA ================= */
              <>
                <AppInput
                  label="Nombre de la Rutina"
                  placeholder="Ej: Lunes-Pecho Pesado"
                  value={routineTitle}
                  onChangeText={setRoutineTitle}
                />

                <Text
                  style={[
                    editStyles.fieldLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Grupo muscular principal:
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 14 }}
                >
                  {FOCUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        editStyles.chip,
                        routineFocus === option.value && editStyles.chipActive,
                      ]}
                      onPress={() => setRoutineFocus(option.value)}
                    >
                      <Text
                        style={[
                          editStyles.chipText,
                          routineFocus === option.value &&
                            editStyles.chipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* ===== SECCIÓN: EJERCICIOS DE LA RUTINA ===== */}
                <View
                  style={[
                    editStyles.routineExercisesSection,
                    { borderColor: "rgba(150, 150, 150, 0.2)" },
                  ]}
                >
                  <View style={editStyles.routineExercisesHeader}>
                    <Text
                      style={[
                        editStyles.routineExercisesTitle,
                        { color: colors.text },
                      ]}
                    >
                      🏋️ Ejercicios ({assignedExercises.length})
                    </Text>

                    <TouchableOpacity
                      style={[
                        editStyles.toggleAddExBtn,
                        isAddingExercise && editStyles.toggleAddExBtnActive,
                      ]}
                      onPress={() => {
                        try {
                          Vibration.vibrate(30);
                        } catch {}
                        setIsAddingExercise(!isAddingExercise);
                        setExDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          editStyles.toggleAddExBtnText,
                          isAddingExercise && editStyles.toggleAddExBtnTextActive,
                        ]}
                      >
                        {isAddingExercise ? "✕ Cerrar" : "+ Añadir"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Formulario desplegable para agregar nuevo ejercicio a la rutina */}
                  {isAddingExercise && (
                    <View
                      style={[
                        editStyles.addExerciseBox,
                        { backgroundColor: "rgba(16, 185, 129, 0.07)" },
                      ]}
                    >
                      <Text
                        style={[
                          editStyles.addExerciseBoxTitle,
                          { color: "#10b981" },
                        ]}
                      >
                        Agregar Ejercicio ({routineFocus.toUpperCase()})
                      </Text>

                      {availableExercises.length === 0 ? (
                        <View style={editStyles.emptyAvailableBox}>
                          <Text style={{ fontSize: 20, marginBottom: 4 }}>
                            📋
                          </Text>
                          <Text
                            style={[
                              editStyles.emptyAvailableText,
                              { color: colors.textSecondary },
                            ]}
                          >
                            No hay más ejercicios disponibles para{" "}
                            {routineFocus.toUpperCase()}.
                          </Text>
                        </View>
                      ) : (
                        <>
                          {/* Desplegable de selección de ejercicio */}
                          <TouchableOpacity
                            style={[
                              editStyles.dropdownTrigger,
                              {
                                backgroundColor: colors.backgroundElement,
                                borderColor: exDropdownOpen
                                  ? "#10b981"
                                  : "rgba(150, 150, 150, 0.3)",
                              },
                            ]}
                            onPress={() => setExDropdownOpen(!exDropdownOpen)}
                          >
                            <Text
                              style={[
                                editStyles.dropdownSelectedText,
                                {
                                  color: selectedExerciseToAdd
                                    ? colors.text
                                    : colors.textSecondary,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {selectedExerciseToAdd
                                ? `🏋️ ${selectedExerciseToAdd.name}`
                                : "Selecciona un ejercicio compatible..."}
                            </Text>
                            <Text style={{ color: colors.textSecondary }}>
                              {exDropdownOpen ? "▲" : "▼"}
                            </Text>
                          </TouchableOpacity>

                          {exDropdownOpen && (
                            <View
                              style={[
                                editStyles.dropdownList,
                                { backgroundColor: colors.backgroundElement },
                              ]}
                            >
                              <ScrollView
                                nestedScrollEnabled
                                style={{ maxHeight: 150 }}
                              >
                                {availableExercises.map((ex) => (
                                  <TouchableOpacity
                                    key={ex.id}
                                    style={[
                                      editStyles.dropdownOption,
                                      selectedExToAddId === ex.id &&
                                        editStyles.dropdownOptionActive,
                                    ]}
                                    onPress={() => {
                                      setSelectedExToAddId(ex.id);
                                      setExDropdownOpen(false);
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color:
                                          selectedExToAddId === ex.id
                                            ? "#10b981"
                                            : colors.text,
                                        fontWeight:
                                          selectedExToAddId === ex.id
                                            ? "700"
                                            : "500",
                                        fontSize: 13,
                                      }}
                                    >
                                      ✓ {ex.name}
                                    </Text>
                                    <Text
                                      style={{
                                        color: colors.textSecondary,
                                        fontSize: 11,
                                        marginTop: 2,
                                      }}
                                    >
                                      ⚙️ {ex.equipment_name || "Sin máquina"} •{" "}
                                      {getExerciseMuscleLabel(ex)}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}

                          {/* Inputs de series y reps */}
                          {Boolean(selectedExToAddId) && (
                            <View style={{ marginTop: 10 }}>
                              <View style={editStyles.repsRow}>
                                <View style={editStyles.repsCol}>
                                  <Text
                                    style={[
                                      editStyles.repsLabel,
                                      { color: colors.textSecondary },
                                    ]}
                                  >
                                    Series
                                  </Text>
                                  <TextInput
                                    style={[
                                      editStyles.repsInput,
                                      {
                                        backgroundColor:
                                          colors.backgroundElement,
                                        color: colors.text,
                                        borderColor: "rgba(150, 150, 150, 0.3)",
                                      },
                                    ]}
                                    keyboardType="numeric"
                                    value={newSets}
                                    onChangeText={setNewSets}
                                  />
                                </View>

                                <View style={editStyles.repsCol}>
                                  <Text
                                    style={[
                                      editStyles.repsLabel,
                                      { color: colors.textSecondary },
                                    ]}
                                  >
                                    Reps Mín
                                  </Text>
                                  <TextInput
                                    style={[
                                      editStyles.repsInput,
                                      {
                                        backgroundColor:
                                          colors.backgroundElement,
                                        color: colors.text,
                                        borderColor: "rgba(150, 150, 150, 0.3)",
                                      },
                                    ]}
                                    keyboardType="numeric"
                                    value={newMinReps}
                                    onChangeText={setNewMinReps}
                                  />
                                </View>

                                <View style={editStyles.repsCol}>
                                  <Text
                                    style={[
                                      editStyles.repsLabel,
                                      { color: colors.textSecondary },
                                    ]}
                                  >
                                    Reps Máx
                                  </Text>
                                  <TextInput
                                    style={[
                                      editStyles.repsInput,
                                      {
                                        backgroundColor:
                                          colors.backgroundElement,
                                        color: colors.text,
                                        borderColor: "rgba(150, 150, 150, 0.3)",
                                      },
                                    ]}
                                    keyboardType="numeric"
                                    value={newMaxReps}
                                    onChangeText={setNewMaxReps}
                                  />
                                </View>
                              </View>

                              <TouchableOpacity
                                style={editStyles.confirmAddBtn}
                                onPress={handleConfirmAddExercise}
                                disabled={actionLoadingId === "adding_ex"}
                              >
                                <Text style={editStyles.confirmAddBtnText}>
                                  {actionLoadingId === "adding_ex"
                                    ? "Añadiendo..."
                                    : "✓ Añadir a esta Rutina"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  )}

                  {/* Lista de Ejercicios ya asignados */}
                  {assignedExercises.length === 0 ? (
                    <Text
                      style={[
                        editStyles.emptyRoutineNotice,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Esta rutina aún no tiene ejercicios asignados.
                    </Text>
                  ) : (
                    <View style={{ marginTop: 6 }}>
                      {assignedExercises.map((ex, idx) => (
                        <View
                          key={ex.routineExerciseId || `${ex.id}-${idx}`}
                          style={[
                            editStyles.assignedExCard,
                            { backgroundColor: "rgba(150, 150, 150, 0.08)" },
                          ]}
                        >
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text
                              style={[
                                editStyles.assignedExName,
                                { color: colors.text },
                              ]}
                              numberOfLines={1}
                            >
                              ✓ {ex.name}
                            </Text>
                            <Text
                              style={[
                                editStyles.assignedExDetail,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {ex.setsCount || 3} series • {ex.minReps || 8}-
                              {ex.maxReps || 12} reps
                              {ex.equipmentName
                                ? ` • ⚙️ ${ex.equipmentName}`
                                : ""}
                            </Text>
                          </View>

                          {/* Botón de quitar ejercicio de la rutina */}
                          <TouchableOpacity
                            style={editStyles.removeExBtn}
                            onPress={() =>
                              handleRemoveExercise(
                                ex.routineExerciseId || "",
                                ex.name
                              )
                            }
                            disabled={
                              actionLoadingId === ex.routineExerciseId
                            }
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Text style={editStyles.removeExBtnText}>
                              {actionLoadingId === ex.routineExerciseId
                                ? "..."
                                : "🗑️ Quitar"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </>
            ) : itemType === "equipment" ? (
              /* ================= FORMULARIO EQUIPAMIENTO / MÁQUINA ================= */
              <>
                <AppInput
                  label="Nombre de la Máquina o Equipo *"
                  placeholder="Ej: Prensa Inclinada 45°, Mancuernas"
                  value={eqName}
                  onChangeText={setEqName}
                />

                <Text
                  style={[
                    editStyles.fieldLabel,
                    {
                      color: colors.textSecondary,
                      marginTop: 12,
                      marginBottom: 8,
                    },
                  ]}
                >
                  Tipo / Categoría:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 14 }}
                >
                  {EQUIPMENT_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      style={[
                        editStyles.chip,
                        eqType === t.value && editStyles.chipActive,
                      ]}
                      onPress={() => setEqType(t.value)}
                    >
                      <Text
                        style={[
                          editStyles.chipText,
                          eqType === t.value && editStyles.chipTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <AppInput
                  label="Marca / Fabricante (opcional)"
                  placeholder="Ej: Hammer Strength, Life Fitness, Eleiko"
                  value={eqBrand}
                  onChangeText={setEqBrand}
                />

                <AppInput
                  label="Guía de Ajuste y Uso (opcional)"
                  placeholder="Ej: Colocar el asiento en nivel 3 y trabar seguros..."
                  value={eqSetupGuide}
                  onChangeText={setEqSetupGuide}
                  multiline
                />

                <AppInput
                  label="Descripción y Notas (opcional)"
                  placeholder="Ej: Máquina para tren inferior con discos olímpicos..."
                  value={eqDescription}
                  onChangeText={setEqDescription}
                  multiline
                />
              </>
            ) : (
              <>
                <AppInput
                  label="Nombre del Ejercicio"
                  placeholder="Ej: Press Inclinado"
                  value={exName}
                  onChangeText={setExName}
                />

                {/* Selector de Máquina */}
                <View style={editStyles.dropdownSection}>
                  <Text
                    style={[
                      editStyles.fieldLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Máquina / Equipamiento (BD):
                  </Text>

                  <TouchableOpacity
                    style={[
                      editStyles.dropdownTrigger,
                      {
                        backgroundColor: "rgba(150, 150, 150, 0.12)",
                        borderColor: dropdownOpen
                          ? "#10b981"
                          : "rgba(150, 150, 150, 0.25)",
                      },
                    ]}
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 16, marginRight: 8 }}>
                      {selectedEquipmentObj ? "⚙️" : "🏋️"}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          editStyles.dropdownSelectedText,
                          {
                            color: selectedEquipmentObj
                              ? colors.text
                              : colors.textSecondary,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {selectedEquipmentObj
                          ? `${selectedEquipmentObj.name} (${selectedEquipmentObj.brand || "Genérica"})`
                          : "Sin máquina / Peso libre"}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textSecondary }}>
                      {dropdownOpen ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                  {dropdownOpen && (
                    <View
                      style={[
                        editStyles.dropdownList,
                        { backgroundColor: colors.backgroundElement },
                      ]}
                    >
                      <ScrollView
                        nestedScrollEnabled
                        style={{ maxHeight: 160 }}
                      >
                        <TouchableOpacity
                          style={editStyles.dropdownOption}
                          onPress={() => {
                            setExEquipment(null);
                            setDropdownOpen(false);
                          }}
                        >
                          <Text style={{ color: colors.text }}>
                            🚫 Sin máquina / Peso Libre
                          </Text>
                        </TouchableOpacity>

                        {equipmentList.map((eq) => (
                          <TouchableOpacity
                            key={eq.id}
                            style={[
                              editStyles.dropdownOption,
                              exEquipment === eq.id &&
                                editStyles.dropdownOptionActive,
                            ]}
                            onPress={() => {
                              setExEquipment(eq.id);
                              setDropdownOpen(false);
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  exEquipment === eq.id ? "#10b981" : colors.text,
                                fontWeight:
                                  exEquipment === eq.id ? "700" : "500",
                              }}
                            >
                              ⚙️ {eq.name} ({eq.brand || "Genérica"})
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <AppInput
                  label="URL del Video (Demostración)"
                  placeholder="https://youtu.be/..."
                  value={exVideo}
                  onChangeText={setExVideo}
                />

                <AppInput
                  label="Instrucciones Técnicas"
                  placeholder="Paso a paso de ejecución..."
                  value={exInstructions}
                  onChangeText={setExInstructions}
                  multiline
                />
              </>
            )}
          </ScrollView>

          <AppButton
            title={saving ? "Guardando en BD..." : "✓ Guardar Cambios en la BD"}
            onPress={handleSave}
            disabled={saving}
          />

          <TouchableOpacity
            onPress={onClose}
            style={editStyles.cancelButton}
          >
            <Text style={{ color: "#888" }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const editStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderRadius: 22,
    padding: 20,
    maxHeight: "92%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 3,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
  closeBtnText: {
    fontSize: 20,
    fontWeight: "700",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#10b981",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  // Sección de ejercicios de la rutina
  routineExercisesSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginVertical: 10,
  },
  routineExercisesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  routineExercisesTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  toggleAddExBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  toggleAddExBtnActive: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  toggleAddExBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
  toggleAddExBtnTextActive: {
    color: "#ef4444",
  },
  addExerciseBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  addExerciseBoxTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyAvailableBox: {
    alignItems: "center",
    paddingVertical: 12,
  },
  emptyAvailableText: {
    fontSize: 14,
    textAlign: "center",
  },
  repsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  repsCol: {
    flex: 1,
  },
  repsLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  repsInput: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  confirmAddBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmAddBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  emptyRoutineNotice: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10,
  },
  assignedExCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 6,
  },
  assignedExName: {
    fontSize: 15,
    fontWeight: "700",
  },
  assignedExDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  removeExBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeExBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
  },
  dropdownSection: {
    marginBottom: 12,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownSelectedText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dropdownList: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.25)",
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.15)",
  },
  dropdownOptionActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
});
