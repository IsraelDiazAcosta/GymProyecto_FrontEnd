import { ProgressionItem } from "@/services/api";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors } from "./types";

interface MarcaHistoryListProps {
  colors: DashboardColors;
  marcaHistory: ProgressionItem[];
  onMarcaOptionsPress?: (item: ProgressionItem) => void;
}

// Historial en Vivo de levantamientos con opción de editar / borrar mediante Long-Press o botón ⋮
export const MarcaHistoryList: React.FC<MarcaHistoryListProps> = ({
  colors,
  marcaHistory,
  onMarcaOptionsPress,
}) => {
  const handleTriggerOptions = (item: ProgressionItem) => {
    try {
      Vibration.vibrate(50);
    } catch {}
    onMarcaOptionsPress?.(item);
  };

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
          const fecha = item.logged_at
            ? new Date(item.logged_at).toLocaleDateString()
            : "Reciente";

          return (
            <TouchableOpacity
              key={item.id || idx}
              style={[
                styles.historyRow,
                { backgroundColor: colors.backgroundElement },
              ]}
              onLongPress={() => handleTriggerOptions(item)}
              delayLongPress={350}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.historyWeight, { color: colors.text }]}>
                  {item.weight} kg × {item.reps} reps
                </Text>
                <Text
                  style={[styles.historyDate, { color: colors.textSecondary }]}
                >
                  {fecha} {item.rpe ? `| RPE ${item.rpe}` : ""}
                </Text>
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <View style={styles.oneRmBadge}>
                  <Text style={styles.oneRmBadgeText}>1RM: {oneRm} kg</Text>
                </View>

                {/* Botón de opciones ⋮ */}
                <TouchableOpacity
                  style={historyStyles.optionsBtn}
                  onPress={() => handleTriggerOptions(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      historyStyles.optionsText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    ⋮
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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

const historyStyles = StyleSheet.create({
  optionsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(150, 150, 150, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  optionsText: {
    fontSize: 18,
    fontWeight: "800",
  },
});
