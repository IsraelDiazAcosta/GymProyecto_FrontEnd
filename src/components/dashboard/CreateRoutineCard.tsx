import { Exercise } from "@/services/api";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors } from "./types";

const FOCUS_OPTIONS = [
  { value: "pecho", label: "Pecho" },
  { value: "espalda", label: "Espalda" },
  { value: "pierna", label: "Pierna" },
  { value: "hombro", label: "Hombro" },
  { value: "brazo", label: "Brazo" },
  { value: "core", label: "Core" },
  { value: "fullbody", label: "Full Body" },
];

interface CreateRoutineCardProps {
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

// Card "➕ Nueva Rutina"
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
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>
         Nueva Rutina
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          marginTop: 8,
          marginBottom: 4,
          fontSize: 14,
          fontWeight: "600",
        }}
      >
        Grupo muscular principal:
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 10 }}
      >
        {FOCUS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip,
              newRoutineFocus === option.value && styles.chipActive,
            ]}
            onPress={() => setNewRoutineFocus(option.value)}
          >
            <Text
              style={[
                styles.chipText,
                newRoutineFocus === option.value && styles.chipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nombre de la rutina */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            color: colors.textSecondary,
            marginBottom: 4,
            fontSize: 13,
            fontWeight: "600",
          }}
        >
          Nombre del plan o rutina:
        </Text>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Ej: Lunes-Pecho, Pierna Pesada"
          placeholderTextColor={colors.textSecondary}
          value={newRoutineTitle}
          onChangeText={setNewRoutineTitle}
        />
      </View>

      {/* Sección para agregar uno o más ejercicios a la rutina */}
      <View style={cardLocalStyles.exercisesSection}>
        <View style={cardLocalStyles.sectionHeader}>
          <Text
            style={[
              cardLocalStyles.sectionLabel,
              { color: colors.textSecondary },
            ]}
          >
            Ejercicios a incluir ({selectedExercises.length}):
          </Text>
          <TouchableOpacity
            onPress={onOpenSelectExercises}
            style={cardLocalStyles.addExercisesBtn}
          >
            <Text style={cardLocalStyles.addExercisesBtnText}>
              {selectedExercises.length > 0
                ? "+ Modificar / Agregar más"
                : "+ Seleccionar Ejercicios"}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedExercises.length > 0 ? (
          <View style={cardLocalStyles.selectedChipsWrap}>
            {selectedExercises.map((ex) => (
              <View
                key={ex.id}
                style={[
                  cardLocalStyles.selectedExChip,
                  { backgroundColor: "rgba(16, 185, 129, 0.12)" },
                ]}
              >
                <Text style={cardLocalStyles.selectedExText} numberOfLines={1}>
                  ✓ {ex.name}
                </Text>
                <TouchableOpacity
                  onPress={() => onRemoveExercise(ex.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={cardLocalStyles.removeChipBtn}
                >
                  <Text style={cardLocalStyles.removeChipText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            onPress={onOpenSelectExercises}
            style={[
              cardLocalStyles.emptyBox,
              { borderColor: "rgba(150, 150, 150, 0.25)" },
            ]}
          >
            <Text
              style={[
                cardLocalStyles.emptyBoxText,
                { color: colors.textSecondary },
              ]}
            >
              Toca aquí para seleccionar uno o varios ejercicios del catálogo
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Botón Crear */}
      <TouchableOpacity
        style={[cardLocalStyles.submitBtn, { backgroundColor: "#10b981" }]}
        onPress={onCreate}
      >
        <Text style={cardLocalStyles.submitBtnText}>
          {selectedExercises.length > 0
            ? `Crear Rutina con ${selectedExercises.length} ejercicio(s)`
            : "Crear Rutina"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const cardLocalStyles = StyleSheet.create({
  exercisesSection: {
    marginTop: 4,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  addExercisesBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  addExercisesBtnText: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "700",
  },
  selectedChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  selectedExChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    maxWidth: "100%",
  },
  selectedExText: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "700",
    marginRight: 6,
    flexShrink: 1,
  },
  removeChipBtn: {
    padding: 2,
  },
  removeChipText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  emptyBoxText: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
  },
  submitBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
});
