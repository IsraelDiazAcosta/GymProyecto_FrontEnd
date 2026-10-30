import { Exercise, Routine } from "@/services/api";
import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors, RoutineExerciseItem } from "./types";

interface RoutineCardProps {
  colors: DashboardColors;
  routine: Routine;
  routineExercises: RoutineExerciseItem[];
  exercises: Exercise[];
  isAdding: boolean;
  selectedExToAdd: string;
  setSelectedExToAdd: (id: string) => void;
  setsCount: string;
  setSetsCount: (value: string) => void;
  minReps: string;
  setMinReps: (value: string) => void;
  maxReps: string;
  setMaxReps: (value: string) => void;
  onStartAdding: () => void;
  onCancelAdding: () => void;
  onAddExercise: () => void;
}

// Card de una rutina con sus ejercicios y el formulario para agregar más
export const RoutineCard: React.FC<RoutineCardProps> = ({
  colors,
  routine,
  routineExercises,
  exercises,
  isAdding,
  selectedExToAdd,
  setSelectedExToAdd,
  setsCount,
  setSetsCount,
  minReps,
  setMinReps,
  maxReps,
  setMaxReps,
  onStartAdding,
  onCancelAdding,
  onAddExercise,
}) => {
  const filteredExercises = exercises.filter((ex) => {
    if (!routine.focus || routine.focus === "fullbody") {
      return true;
    }
    const bodyPart = ex.muscles?.[0]?.body_part?.toLowerCase();
    return bodyPart === routine.focus.toLowerCase();
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      <View style={styles.routineHeader}>
        <Text style={[styles.routineTitle, { color: colors.text }]}>
          📋 {routine.title}
        </Text>

        <Text style={[styles.routineSubtitle, { color: colors.textSecondary }]}>
          {routineExercises.length} ejercicio(s)
        </Text>
      </View>

      {/* Ejercicios agregados */}
      {routineExercises.length > 0 ? (
        routineExercises.map((ex, idx) => (
          <View key={idx} style={styles.exerciseBadge}>
            <Text style={styles.exerciseBadgeText}>✓ {ex.name}</Text>
          </View>
        ))
      ) : (
        <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
          (Aún no has agregado ejercicios a esta rutina)
        </Text>
      )}

      {/* Botón / Formulario para agregar ejercicio */}
      {isAdding ? (
        <View style={styles.addExerciseBox}>
          <Text style={styles.addExerciseBoxTitle}>
            Selecciona ejercicio del catálogo:
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 6 }}
          >
            {filteredExercises.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                style={[
                  styles.chip,
                  selectedExToAdd === ex.id && styles.chipActive,
                ]}
                onPress={() => setSelectedExToAdd(ex.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedExToAdd === ex.id && styles.chipTextActive,
                  ]}
                >
                  {ex.name} ({ex.muscles?.[0]?.body_part || "Sin músculo"})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inlineRow}>
            <TextInput
              style={[
                styles.input,
                { width: 70, textAlign: "center", color: colors.text },
              ]}
              placeholder="Series"
              value={setsCount}
              onChangeText={setSetsCount}
              keyboardType="numeric"
            />
            <TextInput
              style={[
                styles.input,
                { width: 60, textAlign: "center", color: colors.text },
              ]}
              placeholder="Min"
              value={minReps}
              onChangeText={setMinReps}
              keyboardType="numeric"
            />
            <TextInput
              style={[
                styles.input,
                { width: 60, textAlign: "center", color: colors.text },
              ]}
              placeholder="Max"
              value={maxReps}
              onChangeText={setMaxReps}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.smallPrimaryBtn}
              onPress={onAddExercise}
            >
              <Text style={styles.btnTextWhite}>Añadir</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onCancelAdding}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addBtnOutline} onPress={onStartAdding}>
          <Text style={styles.addBtnOutlineText}>
            + Agregar Ejercicio del Catálogo
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
