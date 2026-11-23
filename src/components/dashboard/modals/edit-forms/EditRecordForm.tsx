import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { DashboardColors } from "../../types";

export interface EditRecordFormProps {
  colors: DashboardColors;
  recordWeight: string;
  setRecordWeight: (val: string) => void;
  recordReps: string;
  setRecordReps: (val: string) => void;
  recordRpe: string;
  setRecordRpe: (val: string) => void;
}

/**
 * Modular form for editing a lift record (Weight, Reps, and RPE)
 * with a live preview of the recalculated 1RM.
 */
export const EditRecordForm: React.FC<EditRecordFormProps> = ({
  colors,
  recordWeight,
  setRecordWeight,
  recordReps,
  setRecordReps,
  recordRpe,
  setRecordRpe,
}) => {
  const { t } = useLanguage();
  const w = parseFloat(recordWeight.replace(",", ".")) || 0;
  const r = parseInt(recordReps, 10) || 0;
  const preview1RM =
    w > 0 && r > 0 && r < 37
      ? (w * (36 / (37 - r))).toFixed(1)
      : w > 0
        ? w.toFixed(1)
        : "0.0";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.previewBox,
          {
            backgroundColor: colors.primaryGlow,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.previewHeader}>
          <GymIcon name="award" size={16} color={colors.primary} />
          <Text style={[styles.previewLabel, { color: colors.primary }]}>
            {t("modals.editMarcaPreviewLabel")}
          </Text>
        </View>
        <Text style={[styles.previewValue, { color: colors.primary }]}>
          {preview1RM} kg
        </Text>
      </View>

      <AppInput
        label={t("modals.editMarcaWeightLabel")}
        placeholder={t("modals.editMarcaWeightPlaceholder")}
        keyboardType="numeric"
        leftIcon="barbell"
        value={recordWeight}
        onChangeText={setRecordWeight}
      />

      <AppInput
        label={t("modals.editMarcaRepsLabel")}
        placeholder={t("modals.editMarcaRepsPlaceholder")}
        keyboardType="numeric"
        leftIcon="activity"
        value={recordReps}
        onChangeText={setRecordReps}
      />

      <AppInput
        label={t("modals.editMarcaRpeLabel")}
        placeholder={t("modals.editMarcaRpePlaceholder")}
        keyboardType="numeric"
        leftIcon="flame"
        value={recordRpe}
        onChangeText={setRecordRpe}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  previewBox: {
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 12,
    gap: 4,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  previewValue: {
    fontSize: 26,
    fontWeight: "900",
  },
});
