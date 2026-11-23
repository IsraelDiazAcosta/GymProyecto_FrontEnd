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
import { useLanguage } from "@/context/LanguageContext";
import {
  Equipment,
  Exercise,
  MuscleGroup,
  PickedImageAsset,
  Routine,
} from "@/services/api";
import { DashboardColors } from "../types";
import { EditEquipmentForm } from "./edit-forms/EditEquipmentForm";
import { EditExerciseForm } from "./edit-forms/EditExerciseForm";
import { EditRecordForm } from "./edit-forms/EditRecordForm";
import { EditRoutineForm } from "./edit-forms/EditRoutineForm";

export interface EditItemModalProps {
  visible: boolean;
  colors: DashboardColors;
  itemType: "routine" | "exercise" | "record" | "equipment";
  routineData?: Routine | null;
  exerciseData?: {
    id: string;
    name: string;
    equipment_id: number | null;
    muscle_id?: number | null;
    instructions: string;
    video_url?: string;
    image?: string | null;
  } | null;
  recordData?: {
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
    image?: string | null;
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
    image?: PickedImageAsset | null,
  ) => Promise<void>;
  onSaveRecord?: (
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
      image?: PickedImageAsset | null;
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
  onUpdateRoutineExercise?: (
    routineExerciseId: string,
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
    title: "Edit Routine",
    kicker: "ROUTINE SETTINGS",
    icon: "layers",
  },
  exercise: {
    title: "Edit Exercise",
    kicker: "BIOMECHANICAL CATALOG",
    icon: "dumbbell",
  },
  equipment: {
    title: "Edit Machine",
    kicker: "GYM INVENTORY",
    icon: "cog",
  },
  record: {
    title: "Edit Record (1RM)",
    kicker: "STRENGTH LOG",
    icon: "trending-up",
  },
};

/**
 * Modular edit modal coordinator delegating each entity
 * to its own specialized form under `./edit-forms/`.
 */
export const EditItemModal: React.FC<EditItemModalProps> = ({
  visible,
  colors,
  itemType,
  routineData,
  exerciseData,
  recordData,
  equipmentData,
  equipmentList,
  muscleList = [],
  allExercises = [],
  onSaveRoutine,
  onSaveExercise,
  onSaveRecord,
  onSaveEquipment,
  onRemoveExerciseFromRoutine,
  onAddExerciseToRoutine,
  onUpdateRoutineExercise,
  onClose,
}) => {
  const { t } = useLanguage();
  const [routineTitle, setRoutineTitle] = useState("");
  const [routineFocus, setRoutineFocus] = useState("fullbody");

  const [exName, setExName] = useState("");
  const [exEquipment, setExEquipment] = useState<number | null>(null);
  const [exMuscle, setExMuscle] = useState<number | null>(null);
  const [exVideo, setExVideo] = useState("");
  const [exInstructions, setExInstructions] = useState("");
  const [exPickedImage, setExPickedImage] = useState<PickedImageAsset | null>(
    null,
  );

  const [recordWeight, setRecordWeight] = useState("100");
  const [recordReps, setRecordReps] = useState("10");
  const [recordRpe, setRecordRpe] = useState("");

  const [eqName, setEqName] = useState("");
  const [eqType, setEqType] = useState("plate_loaded");
  const [eqBrand, setEqBrand] = useState("");
  const [eqDescription, setEqDescription] = useState("");
  const [eqSetupGuide, setEqSetupGuide] = useState("");
  const [eqPickedImage, setEqPickedImage] = useState<PickedImageAsset | null>(
    null,
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setSaveError(null);
    setExPickedImage(null);
    setEqPickedImage(null);
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
    } else if (itemType === "record" && recordData) {
      setRecordWeight(String(recordData.weight || 100));
      setRecordReps(String(recordData.reps || 10));
      setRecordRpe(recordData.rpe ? String(recordData.rpe) : "");
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
    recordData,
    equipmentData,
  ]);

  const handleSave = async () => {
    setSaveError(null);
    if (itemType === "routine" && !routineTitle.trim()) {
      setSaveError(t("toasts.routineNameRequiredMsg"));
      return;
    }
    if (itemType === "exercise" && !exName.trim()) {
      setSaveError(t("toasts.exerciseNameRequiredMsg"));
      return;
    }
    if (itemType === "equipment" && !eqName.trim()) {
      setSaveError(t("toasts.nameRequiredTitle"));
      return;
    }

    setSaving(true);
    try {
      if (itemType === "routine" && routineData) {
        await onSaveRoutine(routineData.id, routineTitle.trim(), routineFocus);
      } else if (itemType === "exercise" && exerciseData) {
        await onSaveExercise(
          exerciseData.id,
          exName.trim(),
          exEquipment,
          exInstructions.trim() || t("toasts.defaultInstructions"),
          exVideo.trim(),
          exMuscle,
          exPickedImage,
        );
      } else if (itemType === "record" && recordData && onSaveRecord) {
        const w = parseFloat(recordWeight.replace(",", "."));
        const r = parseInt(recordReps, 10);
        const rpeVal = recordRpe.trim()
          ? parseFloat(recordRpe.replace(",", "."))
          : undefined;
        if (
          !Number.isFinite(w) ||
          w <= 0 ||
          w >= 10000 ||
          !Number.isFinite(r) ||
          r <= 0 ||
          r > 1000 ||
          (rpeVal !== undefined &&
            (!Number.isFinite(rpeVal) || rpeVal < 1 || rpeVal > 10))
        ) {
          setSaveError(t("toasts.invalidDataMsg"));
          return;
        }
        await onSaveRecord(recordData.id, w, r, rpeVal);
      } else if (itemType === "equipment" && equipmentData && onSaveEquipment) {
        await onSaveEquipment(equipmentData.id, {
          name: eqName.trim(),
          equipment_type: eqType,
          brand: eqBrand.trim(),
          description: eqDescription.trim(),
          setup_guide: eqSetupGuide.trim(),
          image: eqPickedImage,
        });
      }
      onClose();
    } catch (err: any) {
      setSaveError(err?.message || t("toasts.deleteError"));
    } finally {
      setSaving(false);
    }
  };

  const meta = HEADER_META[itemType];
  const localizedMeta: Record<
    EditItemModalProps["itemType"],
    { title: string; kicker: string }
  > = {
    routine: {
      title: t("modals.editRoutineTitle"),
      kicker: t("modals.editRoutineKicker"),
    },
    exercise: {
      title: t("modals.editExerciseTitle"),
      kicker: t("modals.editExerciseKicker"),
    },
    equipment: {
      title: t("modals.editEquipmentTitle"),
      kicker: t("modals.editEquipmentKicker"),
    },
    record: {
      title: t("modals.editMarcaTitle"),
      kicker: t("modals.editMarcaKicker"),
    },
  };
  const headerTexts = localizedMeta[itemType] ?? meta;

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
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.kickerRow}>
                <GymIcon name={meta.icon} size={13} color={colors.primary} />
                <Text style={[styles.kicker, { color: colors.primary }]}>
                  {headerTexts.kicker}
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {headerTexts.title}
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
                onUpdateRoutineExercise={onUpdateRoutineExercise}
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
                currentImageUrl={exerciseData?.image}
                pickedImage={exPickedImage}
                setPickedImage={setExPickedImage}
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
                currentImageUrl={equipmentData?.image}
                pickedImage={eqPickedImage}
                setPickedImage={setEqPickedImage}
              />
            )}

            {itemType === "record" && (
              <EditRecordForm
                colors={colors}
                recordWeight={recordWeight}
                setRecordWeight={setRecordWeight}
                recordReps={recordReps}
                setRecordReps={setRecordReps}
                recordRpe={recordRpe}
                setRecordRpe={setRecordRpe}
              />
            )}

            {saveError && (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: colors.dangerGlow,
                    borderColor: colors.danger,
                  },
                ]}
              >
                <GymIcon
                  name="alert-triangle"
                  size={16}
                  color={colors.danger}
                />
                <Text style={[styles.errorBannerText, { color: colors.danger }]}>
                  {saveError}
                </Text>
              </View>
            )}

            <View style={styles.actionsRow}>
              <AppButton
                title={t("modals.saveChangesBtn")}
                icon="check"
                loading={saving}
                onPress={handleSave}
                style={{ flex: 1 }}
              />
              <AppButton
                title={t("common.cancel")}
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
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
});
