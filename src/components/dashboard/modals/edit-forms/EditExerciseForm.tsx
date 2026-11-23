import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { getEquipmentTypeLabel, getMuscleFocusLabel } from "@/i18n";
import {
  Equipment,
  MuscleGroup,
  pickAndCompressImage,
  PickedImageAsset,
  resolveMediaUrl,
} from "@/services/api";
import { isEquipmentCompatibleWithMuscle } from "../../muscleValidation";
import { DashboardColors } from "../../types";

interface EditExerciseFormProps {
  colors: DashboardColors;
  exName: string;
  setExName: (val: string) => void;
  exEquipment: number | null;
  setExEquipment: (val: number | null) => void;
  exMuscle: number | null;
  setExMuscle: (val: number | null) => void;
  exVideo: string;
  setExVideo: (val: string) => void;
  exInstructions: string;
  setExInstructions: (val: string) => void;
  equipmentList: Equipment[];
  muscleList: MuscleGroup[];
  currentImageUrl?: string | null;
  pickedImage: PickedImageAsset | null;
  setPickedImage: (val: PickedImageAsset | null) => void;
}

/**
 * Modular form for editing a catalog exercise (name, primary muscle group,
 * linked machine, video, and instructions).
 */
export const EditExerciseForm: React.FC<EditExerciseFormProps> = ({
  colors,
  exName,
  setExName,
  exEquipment,
  setExEquipment,
  exMuscle,
  setExMuscle,
  exVideo,
  setExVideo,
  exInstructions,
  setExInstructions,
  equipmentList,
  muscleList,
  currentImageUrl,
  pickedImage,
  setPickedImage,
}) => {
  const { language, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [muscleDropdownOpen, setMuscleDropdownOpen] = useState(false);

  const selectedEquipObj = equipmentList.find((eq) => eq.id === exEquipment);
  const selectedMuscleObj = muscleList.find((m) => m.id === exMuscle);
  const previewUri =
    pickedImage?.uri ||
    resolveMediaUrl(currentImageUrl || selectedEquipObj?.image);


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
      if (asset) setPickedImage(asset);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <AppInput
        label={t("modals.editExNameLabel")}
        placeholder={t("modals.editExNamePlaceholder")}
        leftIcon="dumbbell"
        value={exName}
        onChangeText={setExName}
      />

      {/* Muscle Group Selector */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t("catalog.muscleLabel")}
      </Text>
      <Pressable
        onPress={() => setMuscleDropdownOpen((prev) => !prev)}
        style={[
          styles.dropdownBtn,
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
              styles.iconBox,
              { backgroundColor: colors.primaryGlow },
            ]}
          >
            <GymIcon name="target" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.mainText, { color: colors.text }]}>
              {selectedMuscleObj
                ? getMuscleFocusLabel(language, selectedMuscleObj.name)
                : t("catalog.noSpecificMuscle")}
            </Text>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              {t("modals.editExMuscleDbSub")}
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
        <ScrollView
          nestedScrollEnabled
          style={[
            styles.dropdownMenu,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              setExMuscle(null);
              setMuscleDropdownOpen(false);
            }}
            style={[
              styles.dropdownOption,
              { borderBottomColor: colors.borderSubtle },
              exMuscle === null && { backgroundColor: colors.primaryGlow },
            ]}
          >
            <Text
              style={[
                styles.optionText,
                { color: exMuscle === null ? colors.primary : colors.text },
              ]}
            >
              {t("catalog.noSpecificMuscle")}
            </Text>
            {exMuscle === null && (
              <GymIcon name="check" size={15} color={colors.primary} />
            )}
          </Pressable>

          {muscleList.map((m) => {
            const isSel = exMuscle === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => {
                  setExMuscle(m.id);
                  if (selectedEquipObj) {
                    const compatible = isEquipmentCompatibleWithMuscle(
                      selectedEquipObj.name,
                      `${m.name} ${m.body_part || ""}`,
                    );
                    if (!compatible) {
                      setExEquipment(null);
                    }
                  }
                  setMuscleDropdownOpen(false);
                }}
                style={[
                  styles.dropdownOption,
                  { borderBottomColor: colors.borderSubtle },
                  isSel && { backgroundColor: colors.primaryGlow },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isSel ? colors.primary : colors.text },
                  ]}
                >
                  {getMuscleFocusLabel(language, m.name)}
                </Text>
                {isSel && (
                  <GymIcon name="check" size={15} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Machine Selector */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t("catalog.machineAssignedLabel")}
      </Text>
      <Pressable
        onPress={() => setDropdownOpen((prev) => !prev)}
        style={[
          styles.dropdownBtn,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: dropdownOpen ? colors.primary : colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.dropdownLeft}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: colors.primaryGlow },
            ]}
          >
            <GymIcon name="cog" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.mainText, { color: colors.text }]}>
              {selectedEquipObj
                ? selectedEquipObj.name
                : t("catalog.noMachineAssigned")}
            </Text>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              {selectedEquipObj
                ? getEquipmentTypeLabel(
                    language,
                    selectedEquipObj.equipment_type,
                    selectedEquipObj.type_display,
                  )
                : t("modals.editExEquipSub")}
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
        <ScrollView
          nestedScrollEnabled
          style={[
            styles.dropdownMenu,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              setExEquipment(null);
              setDropdownOpen(false);
            }}
            style={[
              styles.dropdownOption,
              { borderBottomColor: colors.borderSubtle },
              exEquipment === null && { backgroundColor: colors.primaryGlow },
            ]}
          >
            <Text
              style={[
                styles.optionText,
                { color: exEquipment === null ? colors.primary : colors.text },
              ]}
            >
              {t("catalog.noMachineAssigned")}
            </Text>
            {exEquipment === null && (
              <GymIcon name="check" size={15} color={colors.primary} />
            )}
          </Pressable>

          {filteredEquipmentList.map((eq) => {
            const isSel = exEquipment === eq.id;
            return (
              <Pressable
                key={eq.id}
                onPress={() => {
                  setExEquipment(eq.id);
                  setDropdownOpen(false);
                }}
                style={[
                  styles.dropdownOption,
                  { borderBottomColor: colors.borderSubtle },
                  isSel && { backgroundColor: colors.primaryGlow },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isSel ? colors.primary : colors.text },
                  ]}
                >
                  {eq.name}
                </Text>
                {isSel && (
                  <GymIcon name="check" size={15} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <AppInput
        label={t("modals.editExVideoLabel")}
        placeholder="https://youtube.com/watch?v=..."
        leftIcon="video"
        value={exVideo}
        onChangeText={setExVideo}
      />

      <AppInput
        label={t("modals.editExInstructionsLabel")}
        placeholder={t("modals.editExInstructionsPlaceholder")}
        value={exInstructions}
        onChangeText={setExInstructions}
        multiline
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t("modals.editExImageLabel")}
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
          <GymIcon name="camera" size={15} color={colors.primary} />
          <Text style={[styles.optionText, { color: colors.text }]}>
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
          <GymIcon name="image" size={15} color={colors.primary} />
          <Text style={[styles.optionText, { color: colors.text }]}>
            {t("common.gallery")}
          </Text>
        </Pressable>
      </View>
      {previewUri && (
        <Image
          source={{ uri: previewUri }}
          style={[styles.previewImage, { borderColor: colors.border }]}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mainText: {
    fontSize: 14,
    fontWeight: "800",
  },
  subText: {
    fontSize: 11,
    marginTop: 1,
  },
  dropdownMenu: {
    maxHeight: 190,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: -6,
    marginBottom: 14,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "700",
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
  previewImage: {
    width: "100%",
    height: 140,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
});
