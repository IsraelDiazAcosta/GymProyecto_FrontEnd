import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { DashboardColors } from "../../types";

interface EditMarcaFormProps {
  colors: DashboardColors;
  marcaWeight: string;
  setMarcaWeight: (val: string) => void;
  marcaReps: string;
  setMarcaReps: (val: string) => void;
  marcaRpe: string;
  setMarcaRpe: (val: string) => void;
}

/**
 * Formulario modular para editar un registro de levantamiento (Peso, Repeticiones y RPE)
 * con previsualización en vivo del 1RM recalculado.
 */
export const EditMarcaForm: React.FC<EditMarcaFormProps> = ({
  colors,
  marcaWeight,
  setMarcaWeight,
  marcaReps,
  setMarcaReps,
  marcaRpe,
  setMarcaRpe,
}) => {
  const w = Number(marcaWeight) || 0;
  const r = Number(marcaReps) || 0;
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
            1RM ESTIMADO RECALCULADO
          </Text>
        </View>
        <Text style={[styles.previewValue, { color: colors.primary }]}>
          {preview1RM} kg
        </Text>
      </View>

      <AppInput
        label="Peso Levantado (kg)"
        placeholder="Ej: 100"
        keyboardType="numeric"
        leftIcon="barbell"
        value={marcaWeight}
        onChangeText={setMarcaWeight}
      />

      <AppInput
        label="Repeticiones Completadas"
        placeholder="Ej: 8"
        keyboardType="numeric"
        leftIcon="activity"
        value={marcaReps}
        onChangeText={setMarcaReps}
      />

      <AppInput
        label="Esfuerzo Percibido RPE (1 - 10)"
        placeholder="Ej: 8.5"
        keyboardType="numeric"
        leftIcon="flame"
        value={marcaRpe}
        onChangeText={setMarcaRpe}
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
