import { AppButton } from "@/components/ui/AppButton";
import { Routine } from "@/services/api";
import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors, RoutineExerciseItem } from "./types";

interface MarcaFormCardProps {
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

// Card para registrar una marca (rutina → ejercicio → peso/reps/RPE)
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
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      {/* Paso 1: Elegir Rutina */}
      <Text style={styles.stepLabel}>1. Selecciona tu Rutina:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      >
        {routines.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[
              styles.chip,
              trackingRoutineId === r.id && styles.chipActive,
            ]}
            onPress={() => onSelectRoutine(r.id)}
          >
            <Text
              style={[
                styles.chipText,
                trackingRoutineId === r.id && styles.chipTextActive,
              ]}
            >
              📋 {r.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Paso 2: Elegir Ejercicio de esa Rutina */}
      <Text style={styles.stepLabel}>2. Ejercicio de esta Rutina:</Text>
      {currentRoutineExercises.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
        >
          {currentRoutineExercises.map((ex) => (
            <TouchableOpacity
              key={ex.id}
              style={[
                styles.chip,
                trackingExerciseId === ex.id && styles.chipActive,
              ]}
              onPress={() => onSelectExercise(ex.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  trackingExerciseId === ex.id && styles.chipTextActive,
                ]}
              >
                🏋️ {ex.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={[styles.emptyHint, { color: "#cf1322", marginBottom: 10 }]}>
          ⚠️ Esta rutina no tiene ejercicios. Agrégalos en la pestaña
          "Rutinas".
        </Text>
      )}

      {/* Paso 3: Inputs de Marca */}
      <View style={styles.inlineRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Peso (kg)
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            keyboardType="numeric"
            value={marcaWeight}
            onChangeText={setMarcaWeight}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Reps
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            keyboardType="numeric"
            value={marcaReps}
            onChangeText={setMarcaReps}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            RPE
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            keyboardType="numeric"
            value={marcaRpe}
            onChangeText={setMarcaRpe}
          />
        </View>
      </View>

      <AppButton
        title="💾 Guardar Marca (Serie)"
        onPress={onSave}
        loading={savingMarca}
        style={{ marginTop: 12 }}
      />

      {lastSavedSummary && (
        <Text style={styles.successSavedText}>{lastSavedSummary}</Text>
      )}
    </View>
  );
};
