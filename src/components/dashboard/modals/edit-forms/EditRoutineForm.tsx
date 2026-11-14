import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { Exercise, Routine } from "@/services/api";
import {
  getExerciseMuscleLabel,
  isExerciseCompatibleWithFocus,
} from "../../muscleValidation";
import { DashboardColors, RoutineExerciseItem } from "../../types";

const FOCUS_OPTIONS = [
  { value: "pecho", label: "Pecho" },
  { value: "espalda", label: "Espalda" },
  { value: "pierna", label: "Pierna" },
  { value: "hombro", label: "Hombro" },
  { value: "brazo", label: "Brazo" },
  { value: "core", label: "Core" },
  { value: "fullbody", label: "Full Body" },
];

interface EditRoutineFormProps {
  colors: DashboardColors;
  routineData: Routine;
  routineTitle: string;
  setRoutineTitle: (val: string) => void;
  routineFocus: string;
  setRoutineFocus: (val: string) => void;
  allExercises: Exercise[];
  onRemoveExerciseFromRoutine?: (
    routineExerciseId: string,
    exerciseName: string,
  ) => Promise<void>;
  onAddExerciseToRoutine?: (
    routineId: string,
    exerciseId: string,
    setsCount: number,
    minReps: number,
    maxReps: number,
  ) => Promise<void>;
  onUpdateRoutineExercise?: (
    routineExerciseId: string,
    setsCount: number,
    minReps: number,
    maxReps: number,
  ) => Promise<void>;
}

/**
 * Formulario modular para editar los datos de una rutina y gestionar sus ejercicios internos.
 */
export const EditRoutineForm: React.FC<EditRoutineFormProps> = ({
  colors,
  routineData,
  routineTitle,
  setRoutineTitle,
  routineFocus,
  setRoutineFocus,
  allExercises,
  onRemoveExerciseFromRoutine,
  onAddExerciseToRoutine,
  onUpdateRoutineExercise,
}) => {
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [selectedExToAddId, setSelectedExToAddId] = useState("");
  const [newSets, setNewSets] = useState("4");
  const [newMinReps, setNewMinReps] = useState("8");
  const [newMaxReps, setNewMaxReps] = useState("12");
  const [exDropdownOpen, setExDropdownOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [editingExId, setEditingExId] = useState<string | null>(null);
  const [editSets, setEditSets] = useState("4");
  const [editMinReps, setEditMinReps] = useState("8");
  const [editMaxReps, setEditMaxReps] = useState("12");

  const rawExercises =
    routineData.days?.[0]?.exercises || (routineData as any).exercises || [];
  const currentRoutineExercises: RoutineExerciseItem[] = rawExercises.map(
    (re: any) => ({
      id: String(re.exercise || re.id),
      routineExerciseId: String(re.id),
      name:
        re.exercise_detail?.name || re.exercise_name || re.name || "Ejercicio",
      equipmentName:
        re.exercise_detail?.equipment_name || re.equipment_name,
      setsCount: re.target_sets?.length || re.sets_count || 4,
      minReps: re.target_sets?.[0]?.min_reps || re.min_reps || 8,
      maxReps: re.target_sets?.[0]?.max_reps || re.max_reps || 12,
    }),
  );

  const selectedAddExObj = allExercises.find(
    (ex) => ex.id === selectedExToAddId,
  );

  const handleQuickRemoveExercise = async (
    routineExerciseId: string | undefined,
    name: string,
  ) => {
    if (!routineExerciseId || !onRemoveExerciseFromRoutine) return;
    try {
      Vibration.vibrate(40);
    } catch {}
    setActionLoadingId(routineExerciseId);
    try {
      await onRemoveExerciseFromRoutine(routineExerciseId, name);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickAddExercise = async () => {
    if (!routineData?.id || !selectedExToAddId || !onAddExerciseToRoutine)
      return;
    setActionLoadingId("adding_new");
    try {
      await onAddExerciseToRoutine(
        routineData.id,
        selectedExToAddId,
        Number(newSets) || 4,
        Number(newMinReps) || 8,
        Number(newMaxReps) || 12,
      );
      setIsAddingExercise(false);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <AppInput
        label="Nombre de la Rutina"
        placeholder="Ej: Lunes - Pecho Pesado"
        leftIcon="layers"
        value={routineTitle}
        onChangeText={setRoutineTitle}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Enfoque Muscular Principal
      </Text>
      <View style={styles.focusGrid}>
        {FOCUS_OPTIONS.map((opt) => {
          const isSelected = routineFocus === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setRoutineFocus(opt.value)}
              style={[
                styles.focusChip,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : colors.backgroundElevated,
                  borderColor: isSelected
                    ? colors.primaryLight
                    : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={{
                  color: isSelected ? colors.onPrimary : colors.text,
                  fontWeight: "800",
                  fontSize: 12,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Gestor de ejercicios de la rutina */}
      <View
        style={[
          styles.managerBox,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.managerHeader}>
          <View>
            <Text style={[styles.managerTitle, { color: colors.text }]}>
              Ejercicios Asignados ({currentRoutineExercises.length})
            </Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>
              Agrega o quita ejercicios directamente
            </Text>
          </View>

          {!isAddingExercise && (
            <Pressable
              onPress={() => setIsAddingExercise(true)}
              style={[
                styles.smallAddBtn,
                {
                  backgroundColor: colors.primaryGlow,
                  borderColor: colors.border,
                },
              ]}
            >
              <GymIcon name="plus" size={14} color={colors.primary} />
              <Text style={[styles.smallAddText, { color: colors.primary }]}>
                Agregar
              </Text>
            </Pressable>
          )}
        </View>

        {currentRoutineExercises.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Esta rutina no tiene ejercicios asignados.
          </Text>
        ) : (
          <View style={styles.exList}>
            {currentRoutineExercises.map((ex, idx) => {
              const isRemoving = actionLoadingId === ex.routineExerciseId;
              const catalogEx = allExercises.find(
                (e) =>
                  e.id === ex.id ||
                  e.name.toLowerCase() === ex.name.toLowerCase(),
              );
              const isCompatible = isExerciseCompatibleWithFocus(
                ex.name,
                routineFocus,
                catalogEx?.primary_muscle,
              );

              return (
                <View
                  key={`${ex.routineExerciseId || ex.id}-${idx}`}
                  style={[
                    styles.exRow,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: !isCompatible
                        ? colors.warning
                        : colors.borderSubtle,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.indexCircle,
                      {
                        backgroundColor: !isCompatible
                          ? colors.warningGlow
                          : colors.primaryGlow,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: !isCompatible ? colors.warning : colors.primary,
                        fontWeight: "900",
                        fontSize: 12,
                      }}
                    >
                      {idx + 1}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.exName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {ex.name}
                    </Text>
                    {editingExId === ex.routineExerciseId ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 6,
                        }}
                      >
                        <TextInput
                          style={[
                            styles.miniInput,
                            {
                              flex: 1,
                              height: 34,
                              color: colors.text,
                              backgroundColor: colors.backgroundElevated,
                              borderColor: colors.borderSubtle,
                            },
                          ]}
                          keyboardType="numeric"
                          value={editSets}
                          onChangeText={setEditSets}
                        />
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                          ×
                        </Text>
                        <TextInput
                          style={[
                            styles.miniInput,
                            {
                              flex: 1,
                              height: 34,
                              color: colors.text,
                              backgroundColor: colors.backgroundElevated,
                              borderColor: colors.borderSubtle,
                            },
                          ]}
                          keyboardType="numeric"
                          value={editMinReps}
                          onChangeText={setEditMinReps}
                        />
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                          -
                        </Text>
                        <TextInput
                          style={[
                            styles.miniInput,
                            {
                              flex: 1,
                              height: 34,
                              color: colors.text,
                              backgroundColor: colors.backgroundElevated,
                              borderColor: colors.borderSubtle,
                            },
                          ]}
                          keyboardType="numeric"
                          value={editMaxReps}
                          onChangeText={setEditMaxReps}
                        />
                        <Pressable
                          onPress={async () => {
                            if (!ex.routineExerciseId || !onUpdateRoutineExercise)
                              return;
                            setActionLoadingId(ex.routineExerciseId);
                            try {
                              await onUpdateRoutineExercise(
                                ex.routineExerciseId,
                                parseInt(editSets, 10) || 4,
                                parseInt(editMinReps, 10) || 8,
                                parseInt(editMaxReps, 10) || 12,
                              );
                              setEditingExId(null);
                            } finally {
                              setActionLoadingId(null);
                            }
                          }}
                          style={[
                            styles.trashBtn,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <GymIcon
                            name="check"
                            size={14}
                            color={colors.onPrimary}
                          />
                        </Pressable>
                      </View>
                    ) : (
                      <Text
                        style={{ fontSize: 11, color: colors.textSecondary }}
                      >
                        {ex.setsCount || 4} series × {ex.minReps || 8}-
                        {ex.maxReps || 12} reps
                      </Text>
                    )}
                  </View>

                  {onUpdateRoutineExercise && ex.routineExerciseId && (
                    <Pressable
                      onPress={() => {
                        if (editingExId === ex.routineExerciseId) {
                          setEditingExId(null);
                        } else {
                          setEditingExId(ex.routineExerciseId!);
                          setEditSets(String(ex.setsCount || 4));
                          setEditMinReps(String(ex.minReps || 8));
                          setEditMaxReps(String(ex.maxReps || 12));
                        }
                      }}
                      style={[
                        styles.trashBtn,
                        { backgroundColor: colors.primaryGlow },
                      ]}
                    >
                      <GymIcon
                        name={editingExId === ex.routineExerciseId ? "x" : "edit"}
                        size={14}
                        color={colors.primary}
                      />
                    </Pressable>
                  )}

                  <Pressable
                    disabled={isRemoving}
                    onPress={() =>
                      handleQuickRemoveExercise(ex.routineExerciseId, ex.name)
                    }
                    style={[
                      styles.trashBtn,
                      { backgroundColor: colors.dangerGlow },
                    ]}
                  >
                    <GymIcon name="trash" size={15} color={colors.danger} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {isAddingExercise && (
          <View
            style={[
              styles.addPanel,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.addPanelTitle, { color: colors.primary }]}>
              Seleccionar Ejercicio para Anexar
            </Text>

            <Pressable
              onPress={() => setExDropdownOpen((prev) => !prev)}
              style={[
                styles.dropdownTrigger,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.text,
                  fontWeight: "700",
                  fontSize: 13,
                  flex: 1,
                }}
              >
                {selectedAddExObj
                  ? selectedAddExObj.name
                  : "Elegir del catálogo..."}
              </Text>
              <GymIcon
                name={exDropdownOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.primary}
              />
            </Pressable>

            {exDropdownOpen && (
              <ScrollView
                nestedScrollEnabled
                style={[
                  styles.dropdownList,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                {allExercises.map((ex) => {
                  const isSel = ex.id === selectedExToAddId;
                  const muscleTag = getExerciseMuscleLabel(
                    ex.name,
                    ex.primary_muscle,
                  );
                  return (
                    <Pressable
                      key={ex.id}
                      onPress={() => {
                        setSelectedExToAddId(ex.id);
                        setExDropdownOpen(false);
                      }}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: colors.borderSubtle },
                        isSel && { backgroundColor: colors.primaryGlow },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: isSel ? colors.primary : colors.text,
                            fontWeight: "700",
                            fontSize: 13,
                          }}
                        >
                          {ex.name}
                        </Text>
                        <Text
                          style={{ fontSize: 11, color: colors.textSecondary }}
                        >
                          {muscleTag}
                        </Text>
                      </View>
                      {isSel && (
                        <GymIcon
                          name="check"
                          size={14}
                          color={colors.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.metricsRow}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.miniLabel, { color: colors.textSecondary }]}
                >
                  Series
                </Text>
                <TextInput
                  style={[
                    styles.miniInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundElevated,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                  keyboardType="numeric"
                  value={newSets}
                  onChangeText={setNewSets}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.miniLabel, { color: colors.textSecondary }]}
                >
                  Mín Reps
                </Text>
                <TextInput
                  style={[
                    styles.miniInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundElevated,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                  keyboardType="numeric"
                  value={newMinReps}
                  onChangeText={setNewMinReps}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.miniLabel, { color: colors.textSecondary }]}
                >
                  Máx Reps
                </Text>
                <TextInput
                  style={[
                    styles.miniInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundElevated,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                  keyboardType="numeric"
                  value={newMaxReps}
                  onChangeText={setNewMaxReps}
                />
              </View>
            </View>

            <View style={styles.addPanelActions}>
              <AppButton
                title="Incluir"
                icon="check"
                loading={actionLoadingId === "adding_new"}
                onPress={handleQuickAddExercise}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Cerrar"
                variant="outline"
                onPress={() => setIsAddingExercise(false)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  focusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  focusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  managerBox: {
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 10,
  },
  managerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  managerTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  smallAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  smallAddText: {
    fontSize: 12,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  exList: {
    gap: 8,
  },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 10,
  },
  indexCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  exName: {
    fontSize: 13,
    fontWeight: "800",
  },
  trashBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  addPanel: {
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 10,
    marginTop: 4,
  },
  addPanelTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  dropdownList: {
    maxHeight: 160,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  miniInput: {
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    textAlign: "center",
    fontWeight: "800",
  },
  addPanelActions: {
    flexDirection: "row",
    gap: 8,
  },
});
