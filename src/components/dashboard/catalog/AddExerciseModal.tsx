import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { getEquipmentTypeLabel } from "@/i18n";
import {
  Equipment,
  MuscleGroup,
  pickAndCompressImage,
  PickedImageAsset,
  resolveMediaUrl,
} from "@/services/api";
import { isEquipmentCompatibleWithMuscle } from "../muscleValidation";
import { DashboardColors } from "../types";

export interface AddExerciseModalProps {
  colors: DashboardColors;
  visible: boolean;
  newExName: string;
  setNewExName: (value: string) => void;
  newExVideo: string;
  setNewExVideo: (value: string) => void;
  newExInstructions: string;
  setNewExInstructions: (value: string) => void;
  equipmentList: Equipment[];
  selectedEquipment: number | null;
  setSelectedEquipment: (id: number | null) => void;
  muscleList: MuscleGroup[];
  selectedMuscle: number | null;
  setSelectedMuscle: (id: number | null) => void;
  newExImage?: PickedImageAsset | null;
  setNewExImage?: (asset: PickedImageAsset | null) => void;
  onSubmit: () => void;
  onClose: () => void;
}

/**
 * Admin modal for creating a catalog exercise with explicit selection
 * of a database Muscle Group and linked Machine.
 */
export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  colors,
  visible,
  newExName,
  setNewExName,
  newExVideo,
  setNewExVideo,
  newExInstructions,
  setNewExInstructions,
  equipmentList,
  selectedEquipment,
  setSelectedEquipment,
  muscleList,
  selectedMuscle,
  setSelectedMuscle,
  newExImage,
  setNewExImage,
  onSubmit,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [muscleDropdownOpen, setMuscleDropdownOpen] = useState(false);

  const selectedEquipObj = equipmentList.find(
    (eq) => eq.id === selectedEquipment,
  );
  const selectedMuscleObj = muscleList.find((m) => m.id === selectedMuscle);
  const previewUri =
    newExImage?.uri || resolveMediaUrl(selectedEquipObj?.image);

  const filteredEquipmentList = useMemo(() => {
    if (!selectedMuscleObj) return equipmentList;
    return equipmentList.filter((eq) =>
      isEquipmentCompatibleWithMuscle(
        eq.name,
        `${selectedMuscleObj.name} ${selectedMuscleObj.body_part || ""}`,
      ),
    );
  }, [equipmentList, selectedMuscleObj]);

  const handlePickImage = async (source: "camera" | "gallery") => {
    try {
      const asset = await pickAndCompressImage(source);
      if (asset) setNewExImage?.(asset);
    } catch {}
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
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
                <GymIcon name="sparkles" size={13} color={colors.primary} />
                <Text style={[styles.kicker, { color: colors.primary }]}>
                  {t("catalog.addKicker")}
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {t("catalog.addTitle")}
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
            <AppInput
              label={t("catalog.exNameLabel")}
              placeholder={t("catalog.exNamePlaceholder")}
              leftIcon="dumbbell"
              value={newExName}
              onChangeText={setNewExName}
            />

            {/* Primary Muscle Group Selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t("catalog.muscleLabel")}
            </Text>
            <Pressable
              onPress={() => setMuscleDropdownOpen((prev) => !prev)}
              style={[
                styles.dropdownButton,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: muscleDropdownOpen
                    ? colors.primary
                    : colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.dropdownLeft}>
                <View
                  style={[
                    styles.dropdownIconBox,
                    { backgroundColor: colors.primaryGlow },
                  ]}
                >
                  <GymIcon name="target" size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.dropdownMainText, { color: colors.text }]}
                  >
                    {selectedMuscleObj
                      ? selectedMuscleObj.name
                      : t("catalog.noMuscleAssigned")}
                  </Text>
                  <Text
                    style={[
                      styles.dropdownSubText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedMuscleObj
                      ? t("catalog.muscleHintSelected")
                      : t("catalog.muscleHintSelect")}
                  </Text>
                </View>
              </View>
              <GymIcon
                name={muscleDropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.primary}
              />
            </Pressable>

            {muscleDropdownOpen && (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ScrollView
                  nestedScrollEnabled
                  style={{ maxHeight: 200 }}
                  showsVerticalScrollIndicator
                >
                  <Pressable
                    onPress={() => {
                      setSelectedMuscle(null);
                      setMuscleDropdownOpen(false);
                    }}
                    style={[
                      styles.dropdownOption,
                      { borderBottomColor: colors.borderSubtle },
                      selectedMuscle === null && {
                        backgroundColor: colors.primaryGlow,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionTitle,
                        {
                          color:
                            selectedMuscle === null
                              ? colors.primary
                              : colors.text,
                        },
                      ]}
                    >
                      {t("catalog.noSpecificMuscle")}
                    </Text>
                    {selectedMuscle === null && (
                      <GymIcon name="check" size={16} color={colors.primary} />
                    )}
                  </Pressable>

                  {muscleList.map((muscle) => {
                    const isSelected = selectedMuscle === muscle.id;
                    return (
                      <Pressable
                        key={muscle.id}
                        onPress={() => {
                          setSelectedMuscle(muscle.id);
                          if (selectedEquipObj) {
                            const compatible = isEquipmentCompatibleWithMuscle(
                              selectedEquipObj.name,
                              `${muscle.name} ${muscle.body_part || ""}`,
                            );
                            if (!compatible) {
                              setSelectedEquipment(null);
                            }
                          }
                          setMuscleDropdownOpen(false);
                        }}
                        style={[
                          styles.dropdownOption,
                          { borderBottomColor: colors.borderSubtle },
                          isSelected && {
                            backgroundColor: colors.primaryGlow,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionTitle,
                            {
                              color: isSelected ? colors.primary : colors.text,
                            },
                          ]}
                        >
                          {muscle.name}
                        </Text>
                        {isSelected && (
                          <GymIcon
                            name="check"
                            size={16}
                            color={colors.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Machine Selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t("catalog.machineAssignedLabel")}
            </Text>
            <Pressable
              onPress={() => setDropdownOpen((prev) => !prev)}
              style={[
                styles.dropdownButton,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: dropdownOpen
                    ? colors.primary
                    : colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.dropdownLeft}>
                <View
                  style={[
                    styles.dropdownIconBox,
                    { backgroundColor: colors.primaryGlow },
                  ]}
                >
                  <GymIcon name="cog" size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.dropdownMainText, { color: colors.text }]}
                  >
                    {selectedEquipObj
                      ? selectedEquipObj.name
                      : t("catalog.noMachineAssigned")}
                  </Text>
                  <Text
                    style={[
                      styles.dropdownSubText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedEquipObj
                      ? getEquipmentTypeLabel(
                          language,
                          selectedEquipObj.equipment_type,
                          selectedEquipObj.type_display,
                        )
                      : t("catalog.machineHintSelect")}
                  </Text>
                </View>
              </View>
              <GymIcon
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.primary}
              />
            </Pressable>

            {dropdownOpen && (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ScrollView
                  nestedScrollEnabled
                  style={{ maxHeight: 200 }}
                  showsVerticalScrollIndicator
                >
                  <Pressable
                    onPress={() => {
                      setSelectedEquipment(null);
                      setDropdownOpen(false);
                    }}
                    style={[
                      styles.dropdownOption,
                      { borderBottomColor: colors.borderSubtle },
                      selectedEquipment === null && {
                        backgroundColor: colors.primaryGlow,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionTitle,
                        {
                          color:
                            selectedEquipment === null
                              ? colors.primary
                              : colors.text,
                        },
                      ]}
                    >
                      {t("catalog.noMachineAssigned")}
                    </Text>
                    {selectedEquipment === null && (
                      <GymIcon name="check" size={16} color={colors.primary} />
                    )}
                  </Pressable>

                  {filteredEquipmentList.map((eq) => {
                    const isSelected = selectedEquipment === eq.id;
                    return (
                      <Pressable
                        key={eq.id}
                        onPress={() => {
                          setSelectedEquipment(eq.id);
                          setDropdownOpen(false);
                        }}
                        style={[
                          styles.dropdownOption,
                          { borderBottomColor: colors.borderSubtle },
                          isSelected && {
                            backgroundColor: colors.primaryGlow,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.optionTitle,
                              {
                                color: isSelected
                                  ? colors.primary
                                  : colors.text,
                              },
                            ]}
                          >
                            {eq.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: colors.textSecondary,
                            }}
                          >
                            {getEquipmentTypeLabel(
                              language,
                              eq.equipment_type,
                              eq.type_display,
                            )}
                          </Text>
                        </View>
                        {isSelected && (
                          <GymIcon
                            name="check"
                            size={16}
                            color={colors.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <AppInput
              label={t("catalog.videoUrlLabel")}
              placeholder="https://youtube.com/watch?v=..."
              leftIcon="video"
              value={newExVideo}
              onChangeText={setNewExVideo}
            />

            <AppInput
              label={t("catalog.instructionsLabel")}
              placeholder={t("catalog.instructionsPlaceholder")}
              value={newExInstructions}
              onChangeText={setNewExInstructions}
              multiline
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t("catalog.ownPhotoLabel")}
            </Text>
            <View style={styles.imagePickerRow}>
              <Pressable
                onPress={() => handlePickImage("camera")}
                style={[
                  styles.pickerBtn,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <GymIcon name="camera" size={16} color={colors.primary} />
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {t("common.camera")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handlePickImage("gallery")}
                style={[
                  styles.pickerBtn,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <GymIcon name="image" size={16} color={colors.primary} />
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {t("common.gallery")}
                </Text>
              </Pressable>
              {newExImage && (
                <Pressable
                  onPress={() => setNewExImage?.(null)}
                  style={[
                    styles.pickerClearBtn,
                    { backgroundColor: colors.dangerGlow },
                  ]}
                >
                  <GymIcon name="trash" size={15} color={colors.danger} />
                </Pressable>
              )}
            </View>
            {previewUri && (
              <Image
                source={{ uri: previewUri }}
                style={[styles.previewImage, { borderColor: colors.border }]}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            )}

            <View style={styles.actionsRow}>
              <AppButton
                title={t("catalog.saveExBtn")}
                icon="check"
                onPress={onSubmit}
                style={{ flex: 1 }}
              />
              <AppButton
                title={t("common.cancel")}
                variant="outline"
                onPress={onClose}
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dropdownIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownMainText: {
    fontSize: 14,
    fontWeight: "800",
  },
  dropdownSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  dropdownMenu: {
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: -8,
    marginBottom: 14,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  imagePickerRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  pickerClearBtn: {
    width: 42,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: 140,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 10,
  },
});
