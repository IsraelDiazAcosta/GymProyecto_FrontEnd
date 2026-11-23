import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { getEquipmentTypeLabel } from "@/i18n";
import {
  pickAndCompressImage,
  PickedImageAsset,
  resolveMediaUrl,
} from "@/services/api";
import { EQUIPMENT_TYPES } from "../../equipment/AddEquipmentModal";
import { DashboardColors } from "../../types";

interface EditEquipmentFormProps {
  colors: DashboardColors;
  eqName: string;
  setEqName: (val: string) => void;
  eqType: string;
  setEqType: (val: string) => void;
  eqBrand: string;
  setEqBrand: (val: string) => void;
  eqDescription: string;
  setEqDescription: (val: string) => void;
  eqSetupGuide: string;
  setEqSetupGuide: (val: string) => void;
  currentImageUrl?: string | null;
  pickedImage: PickedImageAsset | null;
  setPickedImage: (val: PickedImageAsset | null) => void;
}

/**
 * Modular form for editing gym machine or equipment details.
 */
export const EditEquipmentForm: React.FC<EditEquipmentFormProps> = ({
  colors,
  eqName,
  setEqName,
  eqType,
  setEqType,
  eqBrand,
  setEqBrand,
  eqDescription,
  setEqDescription,
  eqSetupGuide,
  setEqSetupGuide,
  currentImageUrl,
  pickedImage,
  setPickedImage,
}) => {
  const { language, t } = useLanguage();
  const previewUri = pickedImage?.uri || resolveMediaUrl(currentImageUrl);

  const handlePickImage = async (source: "camera" | "gallery") => {
    try {
      const asset = await pickAndCompressImage(source);
      if (asset) setPickedImage(asset);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <AppInput
        label={t("modals.editEquipNameLabel")}
        placeholder={t("modals.editEquipNamePlaceholder")}
        leftIcon="cog"
        value={eqName}
        onChangeText={setEqName}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t("modals.editEquipTypeLabel")}
      </Text>
      <View style={styles.typesGrid}>
        {EQUIPMENT_TYPES.map((typeOpt) => {
          const isSelected = eqType === typeOpt.value;
          return (
            <Pressable
              key={typeOpt.value}
              onPress={() => setEqType(typeOpt.value)}
              style={[
                styles.typeChip,
                {
                  backgroundColor: isSelected
                    ? colors.primaryGlow
                    : colors.backgroundElevated,
                  borderColor: isSelected
                    ? colors.primary
                    : colors.borderSubtle,
                },
              ]}
            >
              <GymIcon
                name={typeOpt.icon}
                size={15}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeLabel,
                  { color: isSelected ? colors.primary : colors.text },
                ]}
              >
                {getEquipmentTypeLabel(language, typeOpt.value, typeOpt.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AppInput
        label={t("modals.editEquipBrandLabel")}
        placeholder={t("modals.editEquipBrandPlaceholder")}
        leftIcon="award"
        value={eqBrand}
        onChangeText={setEqBrand}
      />

      <AppInput
        label={t("modals.editEquipDescLabel")}
        placeholder={t("modals.editEquipDescPlaceholder")}
        value={eqDescription}
        onChangeText={setEqDescription}
      />

      <AppInput
        label={t("modals.editEquipSetupLabel")}
        placeholder={t("modals.editEquipSetupPlaceholder")}
        value={eqSetupGuide}
        onChangeText={setEqSetupGuide}
        multiline
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t("modals.editEquipPhotoLabel")}
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
          <Text style={[styles.typeLabel, { color: colors.text }]}>
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
          <Text style={[styles.typeLabel, { color: colors.text }]}>
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
    marginBottom: 8,
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "800",
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
