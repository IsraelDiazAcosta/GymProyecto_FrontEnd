import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { Exercise } from "@/services/api";
import { DashboardColors } from "../types";

interface RoutineAddExerciseFormProps {
  colors: DashboardColors;
  effectiveSelectedIds: string[];
  selectedExercisesDetails: Exercise[];
  setsCount: string;
  setSetsCount: (value: string) => void;
  minReps: string;
  setMinReps: (value: string) => void;
  maxReps: string;
  setMaxReps: (value: string) => void;
  onOpenModal: () => void;
  onRemoveSelectedId: (id: string) => void;
  onConfirmAdd: () => void;
  onCancel: () => void;
}

/**
 * Subformulario modular para anexar uno o varios ejercicios a una rutina existente
 * con configuración de series y repeticiones.
 */
export const RoutineAddExerciseForm: React.FC<RoutineAddExerciseFormProps> = ({
  colors,
  effectiveSelectedIds,
  selectedExercisesDetails,
  setsCount,
  setSetsCount,
  minReps,
  setMinReps,
  maxReps,
  setMaxReps,
  onOpenModal,
  onRemoveSelectedId,
  onConfirmAdd,
  onCancel,
}) => {
  return (
    <View
      style={[
        styles.formContainer,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Anexar Ejercicios a la Rutina
      </Text>

      <Pressable
        onPress={onOpenModal}
        style={[
          styles.pickerTrigger,
          {
            borderColor:
              effectiveSelectedIds.length > 0 ? colors.primary : colors.borderSubtle,
            backgroundColor:
              effectiveSelectedIds.length > 0
                ? colors.primaryGlow
                : colors.backgroundElement,
          },
        ]}
      >
        <View style={styles.pickerContent}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: colors.primaryGlow, borderColor: colors.border },
            ]}
          >
            <GymIcon name="dumbbell" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>
              {effectiveSelectedIds.length > 0
                ? `${effectiveSelectedIds.length} ejercicio(s) seleccionado(s)`
                : "Elegir ejercicios del catálogo"}
            </Text>
            <Text style={[styles.pickerSubtitle, { color: colors.textSecondary }]}>
              {effectiveSelectedIds.length > 0
                ? "Toca para añadir o quitar ejercicios"
                : "Búsqueda rápida con filtro muscular"}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.changeBadge,
            { backgroundColor: colors.primaryGlow },
          ]}
        >
          <Text style={[styles.changeBadgeText, { color: colors.primary }]}>
            {effectiveSelectedIds.length > 0 ? "Editar" : "Elegir"}
          </Text>
        </View>
      </Pressable>

      {selectedExercisesDetails.length > 0 && (
        <View style={styles.chipsWrap}>
          {selectedExercisesDetails.map((ex) => (
            <View
              key={ex.id}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.primaryGlow,
                  borderColor: colors.border,
                },
              ]}
            >
              <GymIcon name="check" size={12} color={colors.primary} />
              <Text
                style={[styles.chipText, { color: colors.primary }]}
                numberOfLines={1}
              >
                {ex.name}
              </Text>
              <Pressable onPress={() => onRemoveSelectedId(ex.id)} hitSlop={8}>
                <GymIcon name="x" size={12} color={colors.primary} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={styles.metricsRow}>
        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Series
          </Text>
          <TextInput
            style={[
              styles.metricInput,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElement,
                borderColor: colors.borderSubtle,
              },
            ]}
            keyboardType="numeric"
            value={setsCount}
            onChangeText={setSetsCount}
            placeholder="4"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Reps Mín
          </Text>
          <TextInput
            style={[
              styles.metricInput,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElement,
                borderColor: colors.borderSubtle,
              },
            ]}
            keyboardType="numeric"
            value={minReps}
            onChangeText={setMinReps}
            placeholder="8"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Reps Máx
          </Text>
          <TextInput
            style={[
              styles.metricInput,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElement,
                borderColor: colors.borderSubtle,
              },
            ]}
            keyboardType="numeric"
            value={maxReps}
            onChangeText={setMaxReps}
            placeholder="12"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.actionsRow}>
        <AppButton
          title={
            effectiveSelectedIds.length > 1
              ? `Guardar (${effectiveSelectedIds.length})`
              : "Guardar"
          }
          icon="check"
          onPress={onConfirmAdd}
          style={{ flex: 1 }}
        />
        <AppButton
          title="Cancelar"
          variant="outline"
          onPress={onCancel}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 14,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: 10,
    gap: 10,
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  pickerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  changeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  metricCol: {
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  metricInput: {
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
});
