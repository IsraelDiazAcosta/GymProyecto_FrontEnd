import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { GymIcon, IconName } from "@/components/ui/GymIcon";
import { Equipment, Exercise, MuscleGroup, Routine } from "@/services/api";
import { DashboardColors } from "../types";
import { EditEquipmentForm } from "./edit-forms/EditEquipmentForm";
import { EditExerciseForm } from "./edit-forms/EditExerciseForm";
import { EditMarcaForm } from "./edit-forms/EditMarcaForm";
import { EditRoutineForm } from "./edit-forms/EditRoutineForm";

export interface EditItemModalProps {
  visible: boolean;
  colors: DashboardColors;
  itemType: "routine" | "exercise" | "marca" | "equipment";
  routineData?: Routine | null;
  exerciseData?: {
    id: string;
    name: string;
    equipment_id: number | null;
    muscle_id?: number | null;
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
  muscleList?: MuscleGroup[];
  allExercises?: Exercise[];
  onSaveRoutine: (id: string, title: string, focus: string) => Promise<void>;
  onSaveExercise: (
    id: string,
    name: string,
    equipment_id: number | null,
    instructions: string,
    video_url?: string,
    muscle_id?: number | null,
  ) => Promise<void>;
  onSaveMarca?: (
    id: string,
    weight: number,
    reps: number,
    rpe?: number,
  ) => Promise<void>;
  onSaveEquipment?: (
    id: number,
    payload: {
      name: string;
      equipment_type: string;
      brand?: string;
      description?: string;
      setup_guide?: string;
    },
  ) => Promise<void>;
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
  onClose: () => void;
}

const HEADER_META: Record<
  EditItemModalProps["itemType"],
  { title: string; kicker: string; icon: IconName }
> = {
  routine: {
    title: "Editar Rutina",
    kicker: "CONFIGURACIÓN DE RUTINA",
    icon: "layers",
  },
  exercise: {
    title: "Editar Ejercicio",
    kicker: "CATÁLOGO BIOMECÁNICO",
    icon: "dumbbell",
  },
  equipment: {
    title: "Editar Máquina",
    kicker: "INVENTARIO DE GIMNASIO",
    icon: "cog",
  },
  marca: {
    title: "Editar Marca (1RM)",
    kicker: "REGISTRO DE FUERZA",
    icon: "trending-up",
  },
};

/**
 * Coordinador modular de edición (reemplaza el archivo monolítico de +1,370 líneas
 * delegando cada entidad a su propio formulario especializado en `./edit-forms/`).
 */
export const EditItemModal: React.FC<EditItemModalProps> = ({
  visible,
  colors,
  itemType,
  routineData,
  exerciseData,
  marcaData,
  equipmentData,
  equipmentList,
  muscleList = [],
  allExercises = [],
  onSaveRoutine,
  onSaveExercise,
  onSaveMarca,
  onSaveEquipment,
  onRemoveExerciseFromRoutine,
  onAddExerciseToRoutine,
  onClose,
}) => {
  const [routineTitle, setRoutineTitle] = useState("");
  const [routineFocus, setRoutineFocus] = useState("fullbody");

  const [exName, setExName] = useState("");
  const [exEquipment, setExEquipment] = useState<number | null>(null);
  const [exMuscle, setExMuscle] = useState<number | null>(null);
  const [exVideo, setExVideo] = useState("");
  const [exInstructions, setExInstructions] = useState("");

  const [marcaWeight, setMarcaWeight] = useState("100");
  const [marcaReps, setMarcaReps] = useState("10");
  const [marcaRpe, setMarcaRpe] = useState("");

  const [eqName, setEqName] = useState("");
  const [eqType, setEqType] = useState("plate_loaded");
  const [eqBrand, setEqBrand] = useState("");
  const [eqDescription, setEqDescription] = useState("");
  const [eqSetupGuide, setEqSetupGuide] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (itemType === "routine" && routineData) {
      setRoutineTitle(
        routineData.title || (routineData as any).name || "",
      );
      setRoutineFocus(
        routineData.focus || (routineData as any).muscle_focus || "fullbody",
      );
    } else if (itemType === "exercise" && exerciseData) {
      setExName(exerciseData.name || "");
      setExEquipment(exerciseData.equipment_id ?? null);
      setExMuscle(exerciseData.muscle_id ?? null);
      setExVideo(exerciseData.video_url || "");
      setExInstructions(exerciseData.instructions || "");
    } else if (itemType === "marca" && marcaData) {
      setMarcaWeight(String(marcaData.weight || 100));
      setMarcaReps(String(marcaData.reps || 10));
      setMarcaRpe(marcaData.rpe ? String(marcaData.rpe) : "");
    } else if (itemType === "equipment" && equipmentData) {
      setEqName(equipmentData.name || "");
      setEqType(equipmentData.equipment_type || "plate_loaded");
      setEqBrand(equipmentData.brand || "");
      setEqDescription(equipmentData.description || "");
      setEqSetupGuide(equipmentData.setup_guide || "");
    }
  }, [
    visible,
    itemType,
    routineData,
    exerciseData,
    marcaData,
    equipmentData,
  ]);

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
          exVideo,
          exMuscle,
        );
      } else if (itemType === "marca" && marcaData && onSaveMarca) {
        await onSaveMarca(
          marcaData.id,
          Number(marcaWeight) || 0,
          Number(marcaReps) || 0,
          marcaRpe ? Number(marcaRpe) : undefined,
        );
      } else if (itemType === "equipment" && equipmentData && onSaveEquipment) {
        await onSaveEquipment(equipmentData.id, {
          name: eqName.trim(),
          equipment_type: eqType,
          brand: eqBrand.trim(),
          description: eqDescription.trim(),
          setup_guide: eqSetupGuide.trim(),
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const meta = HEADER_META[itemType];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Cabecera */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.kickerRow}>
                <GymIcon name={meta.icon} size={13} color={colors.primary} />
                <Text style={[styles.kicker, { color: colors.primary }]}>
                  {meta.kicker}
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {meta.title}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.backgroundElevated },
              ]}
            >
              <GymIcon name="x" size={18} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {itemType === "routine" && routineData && (
              <EditRoutineForm
                colors={colors}
                routineData={routineData}
                routineTitle={routineTitle}
                setRoutineTitle={setRoutineTitle}
                routineFocus={routineFocus}
                setRoutineFocus={setRoutineFocus}
                allExercises={allExercises}
                onRemoveExerciseFromRoutine={onRemoveExerciseFromRoutine}
                onAddExerciseToRoutine={onAddExerciseToRoutine}
              />
            )}

            {itemType === "exercise" && (
              <EditExerciseForm
                colors={colors}
                exName={exName}
                setExName={setExName}
                exEquipment={exEquipment}
                setExEquipment={setExEquipment}
                exMuscle={exMuscle}
                setExMuscle={setExMuscle}
                exVideo={exVideo}
                setExVideo={setExVideo}
                exInstructions={exInstructions}
                setExInstructions={setExInstructions}
                equipmentList={equipmentList}
                muscleList={muscleList}
              />
            )}

            {itemType === "equipment" && (
              <EditEquipmentForm
                colors={colors}
                eqName={eqName}
                setEqName={setEqName}
                eqType={eqType}
                setEqType={setEqType}
                eqBrand={eqBrand}
                setEqBrand={setEqBrand}
                eqDescription={eqDescription}
                setEqDescription={setEqDescription}
                eqSetupGuide={eqSetupGuide}
                setEqSetupGuide={setEqSetupGuide}
              />
            )}

            {itemType === "marca" && (
              <EditMarcaForm
                colors={colors}
                marcaWeight={marcaWeight}
                setMarcaWeight={setMarcaWeight}
                marcaReps={marcaReps}
                setMarcaReps={setMarcaReps}
                marcaRpe={marcaRpe}
                setMarcaRpe={setMarcaRpe}
              />
            )}

            <View style={styles.actionsRow}>
              <AppButton
                title="Guardar Cambios"
                icon="check"
                loading={saving}
                onPress={handleSave}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                disabled={saving}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "90%",
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
});
