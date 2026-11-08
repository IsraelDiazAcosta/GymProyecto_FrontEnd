import { Exercise } from "@/services/api";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors } from "./types";

interface CatalogSectionProps {
  colors: DashboardColors;
  exercises: Exercise[];
  isStaff?: boolean;
  onOpenAddExercise: () => void;
  onOpenExerciseDetail: (exerciseId: string) => void;
  onExerciseOptionsPress?: (exercise: Exercise) => void;
}

// TAB 3: CATÁLOGO
export const CatalogSection: React.FC<CatalogSectionProps> = ({
  colors,
  exercises,
  isStaff,
  onOpenAddExercise,
  onOpenExerciseDetail,
  onExerciseOptionsPress,
}) => {
  const handleTriggerOptions = (ex: Exercise) => {
    try {
      Vibration.vibrate(50);
    } catch (e) {}
    onExerciseOptionsPress?.(ex);
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerWithBtn}>
        <Text
          style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}
        >
          Catálogo de Ejercicios
        </Text>
        {isStaff && (
          <TouchableOpacity
            style={styles.adminActionBtn}
            onPress={onOpenAddExercise}
          >
            <Text style={styles.btnTextWhite}>+ Agregar ejercicio</Text>
          </TouchableOpacity>
        )}
      </View>

      {exercises.map((ex) => (
        <TouchableOpacity
          key={ex.id}
          style={[
            styles.exerciseCard,
            { backgroundColor: colors.backgroundElement },
          ]}
          onPress={() => onOpenExerciseDetail(ex.id)}
          onLongPress={() => handleTriggerOptions(ex)}
          delayLongPress={350}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={[styles.exerciseName, { color: colors.text }]}
              numberOfLines={1}
            >
              {ex.name}
            </Text>
            <Text
              style={[styles.exerciseInfo, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              ⚙️ Máquina: {ex.equipment_name || "Sin máquina / Libre"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={styles.verMasBadge}>
              <Text style={styles.verMasText}>Ver Detalle ›</Text>
            </View>

            {/* Select / Menú de opciones de lado derecho */}
            <TouchableOpacity
              style={catalogStyles.optionsBtn}
              onPress={() => handleTriggerOptions(ex)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  catalogStyles.optionsText,
                  { color: colors.textSecondary },
                ]}
              >
                ⋮
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const catalogStyles = StyleSheet.create({
  optionsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(150, 150, 150, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsText: {
    fontSize: 18,
    fontWeight: "800",
  },
});
