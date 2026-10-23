import { ProgressionItem, Routine } from "@/services/api";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface RMTrackingChartProps {
  colors: {
    backgroundElement: string;
    text: string;
    textSecondary: string;
  };
  routines: Routine[];
  trackingRoutineId: string;
  marcaHistory: ProgressionItem[];
  onSelectRoutine: (routineId: string) => void;
}

export const RMTrackingChart: React.FC<RMTrackingChartProps> = ({
  colors,
  routines,
  trackingRoutineId,
  marcaHistory,
  onSelectRoutine,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          📊 Tu Progreso de 1RM
        </Text>
        <Text style={[styles.chartSub, { color: colors.textSecondary }]}>
          Histórico de fuerza
        </Text>
      </View>

      {/* Selectores de Rutina */}
      <View style={styles.chartFilters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 6 }}
        >
          {routines.map((r) => (
            <TouchableOpacity
              key={`chart-r-${r.id}`}
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
                {r.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Puntos de 1RM */}
      {marcaHistory.length > 0 ? (
        <View style={styles.chartContainer}>
          <View style={styles.chartVisualBox}>
            <View style={styles.pointsRow}>
              {marcaHistory.slice(-6).map((item, index) => {
                const oneRm =
                  item.reps > 0 && item.reps < 37
                    ? parseFloat(
                        (item.weight * (36 / (37 - item.reps))).toFixed(1),
                      )
                    : item.weight;

                return (
                  <View key={index} style={styles.pointColumn}>
                    <Text style={styles.pointValueText}>{oneRm}kg</Text>
                    <View style={styles.pointDot} />
                    <Text style={styles.pointDateText}>
                      {new Date(item.logged_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
          <Text
            style={[
              styles.emptyHint,
              {
                textAlign: "center",
                marginTop: 8,
                color: colors.textSecondary,
              },
            ]}
          >
            💡 Mostrando los últimos registros de tu 1RM estimado.
          </Text>
        </View>
      ) : (
        <View style={styles.emptyChartBox}>
          <Text
            style={[
              styles.emptyHint,
              { color: colors.textSecondary, textAlign: "center" },
            ]}
          >
            Selecciona una rutina y un ejercicio con registros en la pestaña
            "Marcas" para ver tu gráfica aquí.
          </Text>
        </View>
      )}
    </View>
  );
};

// Exportación por defecto para evitar problemas de tipos en Expo
export default RMTrackingChart;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chartSub: {
    fontSize: 12,
  },
  chartFilters: {
    marginBottom: 10,
  },
  chip: {
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: "#ff6b00",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  chartContainer: {
    marginTop: 4,
  },
  chartVisualBox: {
    backgroundColor: "rgba(255, 107, 0, 0.05)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    alignItems: "flex-end",
    height: 70,
  },
  pointColumn: {
    alignItems: "center",
    flex: 1,
  },
  pointValueText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ff6b00",
    marginBottom: 4,
  },
  pointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff6b00",
    marginVertical: 4,
  },
  pointDateText: {
    fontSize: 9,
    color: "#888",
    marginTop: 2,
  },
  emptyChartBox: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHint: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
