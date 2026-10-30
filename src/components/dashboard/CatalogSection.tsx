import { Exercise } from "@/services/api";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors } from "./types";

interface CatalogSectionProps {
  colors: DashboardColors;
  exercises: Exercise[];
  isStaff?: boolean;
  onOpenAddExercise: () => void;
  onOpenExerciseDetail: (exerciseId: string) => void;
}

// TAB 3: CATÁLOGO
export const CatalogSection: React.FC<CatalogSectionProps> = ({
  colors,
  exercises,
  isStaff,
  onOpenAddExercise,
  onOpenExerciseDetail,
}) => {
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
            <Text style={styles.btnTextWhite}>➕ Nuevo (Admin)</Text>
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
        >
          <View>
            <Text style={[styles.exerciseName, { color: colors.text }]}>
              {ex.name}
            </Text>
            <Text style={[styles.exerciseInfo, { color: colors.textSecondary }]}>
              Máquina: {ex.equipment_name || "Sin máquina"}
            </Text>
          </View>
          <View style={styles.verMasBadge}>
            <Text style={styles.verMasText}>Ver Detalle / Video ›</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
