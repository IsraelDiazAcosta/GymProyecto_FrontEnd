import { Image } from "expo-image";
import React, { useState } from "react";
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
import { GymIcon, IconName } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { getEquipmentTypeLabel } from "@/i18n";
import { pickAndCompressImage, PickedImageAsset } from "@/services/api";
import { DashboardColors } from "../types";

export const EQUIPMENT_TYPES: {
  value: string;
  label: string;
  icon: IconName;
}[] = [
  { value: "plate_loaded", label: "Plate Loaded", icon: "cog" },
  { value: "pin_selected", label: "Pin Selected", icon: "sliders" },
  { value: "cable", label: "Cable / Pulley", icon: "activity" },
  { value: "smith", label: "Smith Machine", icon: "layers" },
  { value: "free_weight", label: "Free Weight / Dumbbell", icon: "dumbbell" },
  { value: "bodyweight", label: "Bodyweight / Calisthenics", icon: "user" },
  { value: "cardio", label: "Cardio", icon: "flame" },
  { value: "accessory", label: "Accessory / Bench", icon: "target" },
];

export interface AddEquipmentModalProps {
  visible: boolean;
  colors: DashboardColors;
  onSubmit: (payload: {
    name: string;
    equipment_type: string;
    brand?: string;
    description?: string;
    setup_guide?: string;
    image?: PickedImageAsset | null;
  }) => Promise<void>;
  onClose: () => void;
}

/**
 * Admin modal for registering a new gym machine or equipment item
 * with biomechanical categorization using vector icons.
 */
export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  visible,
  colors,
  onSubmit,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [name, setName] = useState("");
  const [equipmentType, setEquipmentType] = useState("plate_loaded");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [setupGuide, setSetupGuide] = useState("");
  const [pickedImage, setPickedImage] = useState<PickedImageAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePickImage = async (source: "camera" | "gallery") => {
    try {
      const asset = await pickAndCompressImage(source);
      if (asset) setPickedImage(asset);
    } catch {}
  };

  const handleSave = async () => {
    setSubmitError(null);
    if (!name.trim()) {
      setNameError(t("toasts.nameRequiredTitle"));
      return;
    }
    setNameError(undefined);
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        equipment_type: equipmentType,
        brand: brand.trim(),
        description: description.trim(),
        setup_guide: setupGuide.trim(),
        image: pickedImage,
      });
      setName("");
      setEquipmentType("plate_loaded");
      setBrand("");
      setDescription("");
      setSetupGuide("");
      setPickedImage(null);
      setSubmitError(null);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || t("toasts.createEquipmentError"));
    } finally {
      setSubmitting(false);
    }
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
                <GymIcon name="cog" size={13} color={colors.primary} />
                <Text style={[styles.kicker, { color: colors.primary }]}>
                  {t("equipment.addKicker")}
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {t("equipment.addTitle")}
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
              label={t("equipment.nameLabel")}
              placeholder={t("equipment.namePlaceholder")}
              leftIcon="cog"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (nameError) setNameError(undefined);
              }}
              error={nameError}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("equipment.typeLabel")}
            </Text>
            <View style={styles.typesGrid}>
              {EQUIPMENT_TYPES.map((item) => {
                const isSelected = equipmentType === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setEquipmentType(item.value)}
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
                      name={item.icon}
                      size={16}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeLabel,
                        {
                          color: isSelected ? colors.primary : colors.text,
                        },
                      ]}
                    >
                      {getEquipmentTypeLabel(language, item.value, item.label)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <AppInput
              label={t("equipment.brandLabel")}
              placeholder={t("equipment.brandPlaceholder")}
              leftIcon="award"
              value={brand}
              onChangeText={setBrand}
            />

            <AppInput
              label={t("equipment.descLabel")}
              placeholder={t("equipment.descPlaceholder")}
              value={description}
              onChangeText={setDescription}
            />

            <AppInput
              label={t("equipment.setupLabel")}
              placeholder={t("equipment.setupPlaceholder")}
              value={setupGuide}
              onChangeText={setSetupGuide}
              multiline
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("equipment.photoLabel")}
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
                <Text style={[styles.pickerBtnText, { color: colors.text }]}>
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
                <Text style={[styles.pickerBtnText, { color: colors.text }]}>
                  {t("common.gallery")}
                </Text>
              </Pressable>
              {pickedImage && (
                <Pressable
                  onPress={() => setPickedImage(null)}
                  style={[
                    styles.pickerClearBtn,
                    { backgroundColor: colors.dangerGlow },
                  ]}
                >
                  <GymIcon name="trash" size={15} color={colors.danger} />
                </Pressable>
              )}
            </View>
            {pickedImage && (
              <Image
                source={{ uri: pickedImage.uri }}
                style={[styles.previewImage, { borderColor: colors.border }]}
                contentFit="cover"
              />
            )}

            {submitError && (
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
                  {submitError}
                </Text>
              </View>
            )}

            <View style={styles.actionsRow}>
              <AppButton
                title={t("equipment.saveBtn")}
                icon="check"
                onPress={handleSave}
                loading={submitting}
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
    marginBottom: 16,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: 7,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "800",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
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
    marginBottom: 12,
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
  pickerBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  pickerClearBtn: {
    width: 42,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 12,
  },
});
