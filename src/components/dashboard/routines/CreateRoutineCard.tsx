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
import { Exercise } from "@/services/api";
import { DashboardColors } from "../types";

const FOCUS_OPTIONS = [
  { value: "pecho", label: "Pecho" },
  { value: "espalda", label: "Espalda" },
  { value: "pierna", label: "Pierna" },
  { value: "hombro", label: "Hombro" },
  { value: "brazo", label: "Brazo" },
  { value: "core", label: "Core" },
  { value: "fullbody", label: "Full Body" },
];

export interface CreateRoutineCardProps {
  colors: DashboardColors;
  newRoutineTitle: string;
  setNewRoutineTitle: (value: string) => void;
  newRoutineFocus: string;
  setNewRoutineFocus: (value: string) => void;
  selectedExercises: Exercise[];
  onOpenSelectExercises: () => void;
  onRemoveExercise: (id: string) => void;
  onCreate: () => void;
}

/**
 * Tarjeta interactiva para crear una nueva rutina con selección múltiple de ejercicios
 * y enfoque muscular categorizado.
 */
export const CreateRoutineCard: React.FC<CreateRoutineCardProps> = ({
  colors,
  newRoutineTitle,
  setNewRoutineTitle,
  newRoutineFocus,
  setNewRoutineFocus,
  selectedExercises,
  onOpenSelectExercises,
  onRemoveExercise,
  onCreate,
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
          <GymIcon name="plus" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Diseñar Nueva Rutina
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Configura el grupo muscular y añade ejercicios en bloque
          </Text>
        </View>
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Enfoque Muscular Principal
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {FOCUS_OPTIONS.map((option) => {
          const active = newRoutineFocus === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setNewRoutineFocus(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.backgroundElevated,
                  borderColor: active ? colors.primaryLight : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? "#FFFFFF" : colors.textSecondary },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.inputSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Nombre del Plan o Rutina
        </Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="layers" size={17} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ej: Lunes - Hipertrofia Pecho, Pierna Pesada"
            placeholderTextColor={colors.textSecondary}
            value={newRoutineTitle}
            onChangeText={setNewRoutineTitle}
          />
        </View>
      </View>

      <View style={styles.exercisesSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>
            Ejercicios incluidos ({selectedExercises.length})
          </Text>
          <Pressable
            onPress={onOpenSelectExercises}
            style={styles.addExercisesBtn}
          >
            <GymIcon name="plus" size={14} color={colors.primary} />
            <Text style={[styles.addExercisesBtnText, { color: colors.primary }]}>
              {selectedExercises.length > 0
                ? "Modificar / Agregar"
                : "Seleccionar del Catálogo"}
            </Text>
          </Pressable>
        </View>

        {selectedExercises.length > 0 ? (
          <View style={styles.selectedChipsWrap}>
            {selectedExercises.map((ex) => (
              <View
                key={ex.id}
                style={[
                  styles.selectedExChip,
                  {
                    backgroundColor: colors.primaryGlow,
                    borderColor: colors.border,
                  },
                ]}
              >
                <GymIcon name="check" size={13} color={colors.primary} />
                <Text
                  style={[styles.selectedExText, { color: colors.primary }]}
                  numberOfLines={1}
                >
                  {ex.name}
                </Text>
                <Pressable
                  onPress={() => onRemoveExercise(ex.id)}
                  hitSlop={8}
                  style={styles.removeChipBtn}
                >
                  <GymIcon name="x" size={13} color={colors.primary} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Pressable
            onPress={onOpenSelectExercises}
            style={[
              styles.emptyBox,
              {
                borderColor: colors.border,
                backgroundColor: colors.backgroundElevated,
              },
            ]}
          >
            <GymIcon name="dumbbell" size={18} color={colors.primary} />
            <Text style={[styles.emptyBoxText, { color: colors.textSecondary }]}>
              Toca aquí para elegir uno o varios ejercicios del catálogo
            </Text>
          </Pressable>
        )}
      </View>

      <AppButton
        title={
          selectedExercises.length > 0
            ? `Crear Rutina (${selectedExercises.length} ejercicios)`
            : "Crear Rutina"
        }
        icon="sparkles"
        onPress={onCreate}
      />
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
    marginBottom: 4,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 4,
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
  inputSection: {
    marginTop: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 13,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  exercisesSection: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addExercisesBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  addExercisesBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  selectedChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  selectedExChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    maxWidth: "100%",
  },
  selectedExText: {
    fontSize: 12,
    fontWeight: "800",
    flexShrink: 1,
  },
  removeChipBtn: {
    padding: 2,
  },
  emptyBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  emptyBoxText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    flexShrink: 1,
  },
});
