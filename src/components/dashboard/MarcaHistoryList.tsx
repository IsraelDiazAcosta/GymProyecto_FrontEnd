import { ProgressionItem } from "@/services/api";
import React from "react";
import { Text, View } from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors } from "./types";

interface MarcaHistoryListProps {
  colors: DashboardColors;
  marcaHistory: ProgressionItem[];
}

// Historial en Vivo de levantamientos
export const MarcaHistoryList: React.FC<MarcaHistoryListProps> = ({
  colors,
  marcaHistory,
}) => {
  return (
    <>
      <Text style={[styles.subTitle, { color: colors.text, marginTop: 14 }]}>
        📈 Historial de Levantamientos:
      </Text>
      {marcaHistory.length > 0 ? (
        marcaHistory.map((item, idx) => {
          const oneRm =
            item.reps > 0 && item.reps < 37
              ? (item.weight * (36 / (37 - item.reps))).toFixed(1)
              : item.weight;
          const fecha = new Date(item.logged_at).toLocaleDateString();

          return (
            <View
              key={idx}
              style={[
                styles.historyRow,
                { backgroundColor: colors.backgroundElement },
              ]}
            >
              <View>
                <Text style={[styles.historyWeight, { color: colors.text }]}>
                  {item.weight} kg × {item.reps} reps
                </Text>
                <Text
                  style={[styles.historyDate, { color: colors.textSecondary }]}
                >
                  {fecha} {item.rpe ? `| RPE ${item.rpe}` : ""}
                </Text>
              </View>
              <View style={styles.oneRmBadge}>
                <Text style={styles.oneRmBadgeText}>1RM: {oneRm} kg</Text>
              </View>
            </View>
          );
        })
      ) : (
        <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
          Aún no hay marcas registradas para este ejercicio.
        </Text>
      )}
    </>
  );
};
