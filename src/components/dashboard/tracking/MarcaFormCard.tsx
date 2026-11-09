import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { Routine } from "@/services/api";
import { DashboardColors, RoutineExerciseItem } from "../types";

export interface MarcaFormCardProps {
  colors: DashboardColors;
  routines: Routine[];
  trackingRoutineId: string;
  trackingExerciseId: string;
  currentRoutineExercises: RoutineExerciseItem[];
  onSelectRoutine: (routineId: string) => void;
  onSelectExercise: (exerciseId: string) => void;
  marcaWeight: string;
  setMarcaWeight: (value: string) => void;
  marcaReps: string;
  setMarcaReps: (value: string) => void;
  marcaRpe: string;
  setMarcaRpe: (value: string) => void;
  savingMarca: boolean;
  onSave: () => void;
  lastSavedSummary: string | null;
}

/**
 * Tarjeta para registrar un nuevo levantamiento (Peso, Repeticiones y RPE)
 * y calcular automáticamente el 1RM con fórmula de Brzycki.
 */
export const MarcaFormCard: React.FC<MarcaFormCardProps> = ({
  colors,
  routines,
  trackingRoutineId,
  trackingExerciseId,
  currentRoutineExercises,
  onSelectRoutine,
  onSelectExercise,
  marcaWeight,
  setMarcaWeight,
  marcaReps,
  setMarcaReps,
  marcaRpe,
  setMarcaRpe,
  savingMarca,
  onSave,
  lastSavedSummary,
}) => {
  return (
    <AnimatedCard
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <GymIcon name="flame" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Registrar Marca (1RM)
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Selecciona rutina, ejercicio e ingresa los datos de tu serie
          </Text>
        </View>
      </View>

      <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
        1. Selecciona la Rutina
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {routines.map((r) => {
          const active = trackingRoutineId === r.id;
          return (
            <Pressable
              key={r.id}
              onPress={() => onSelectRoutine(r.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.backgroundElevated,
                  borderColor: active
                    ? colors.primaryLight
                    : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? "#FFFFFF" : colors.textSecondary },
                ]}
              >
                {r.title || (r as any).name || "Rutina"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
        2. Selecciona el Ejercicio
      </Text>
      {currentRoutineExercises.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {currentRoutineExercises.map((ex) => {
            const active = trackingExerciseId === ex.id;
            return (
              <Pressable
                key={ex.id}
                onPress={() => onSelectExercise(ex.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : colors.backgroundElevated,
                    borderColor: active
                      ? colors.primaryLight
                      : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? "#FFFFFF" : colors.textSecondary },
                  ]}
                >
                  {ex.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.emptyNotice,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="info" size={15} color={colors.textSecondary} />
          <Text style={[styles.emptyNoticeText, { color: colors.textSecondary }]}>
            Esta rutina no tiene ejercicios aún. Agrégalos en la pestaña Rutinas.
          </Text>
        </View>
      )}

      <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
        3. Datos del Levantamiento
      </Text>
      <View style={styles.inputsRow}>
        <View style={styles.inputCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Peso (kg)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
            placeholder="80"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={marcaWeight}
            onChangeText={setMarcaWeight}
          />
        </View>

        <View style={styles.inputCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Repeticiones
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
            placeholder="8"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={marcaReps}
            onChangeText={setMarcaReps}
          />
        </View>

        <View style={styles.inputCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            RPE (1-10)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
            placeholder="9"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={marcaRpe}
            onChangeText={setMarcaRpe}
          />
        </View>
      </View>

      <AppButton
        title="Guardar Marca"
        icon="check"
        onPress={onSave}
        loading={savingMarca}
      />

      {lastSavedSummary && (
        <View
          style={[
            styles.summaryBanner,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <GymIcon name="check-circle" size={16} color={colors.primary} />
          <Text style={[styles.summaryText, { color: colors.primary }]}>
            {lastSavedSummary}
          </Text>
        </View>
      )}
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.three + 2,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 2,
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  emptyNoticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  inputsRow: {
    flexDirection: "row",
    gap: 8,
  },
  inputCol: {
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  input: {
    height: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  summaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
});
