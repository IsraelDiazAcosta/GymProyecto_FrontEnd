import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { ProgressionItem } from "@/services/api";
import { DashboardColors } from "../types";

export interface MarcaHistoryListProps {
  colors: DashboardColors;
  marcaHistory: ProgressionItem[];
  onMarcaOptionsPress?: (item: ProgressionItem) => void;
}

/**
 * Listado histórico de levantamientos con cálculo 1RM, fecha e interacción
 * de opciones para editar o eliminar registros.
 */
export const MarcaHistoryList: React.FC<MarcaHistoryListProps> = ({
  colors,
  marcaHistory,
  onMarcaOptionsPress,
}) => {
  const handleTriggerOptions = (item: ProgressionItem) => {
    try {
      Vibration.vibrate(45);
    } catch {}
    onMarcaOptionsPress?.(item);
  };

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
        <View style={styles.titleRow}>
          <GymIcon name="activity" size={18} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Historial de Levantamientos
          </Text>
        </View>
        <View
          style={[
            styles.countBadge,
            { backgroundColor: colors.primaryGlow },
          ]}
        >
          <Text style={[styles.countText, { color: colors.primary }]}>
            {marcaHistory.length}
          </Text>
        </View>
      </View>

      {marcaHistory.length > 0 ? (
        <View style={styles.listWrap}>
          {marcaHistory.map((item, idx) => {
            const oneRm =
              item.reps > 0 && item.reps < 37
                ? (item.weight * (36 / (37 - item.reps))).toFixed(1)
                : item.weight;
            const fecha = item.logged_at
              ? new Date(item.logged_at).toLocaleDateString()
              : "Reciente";

            return (
              <Pressable
                key={item.id ?? idx}
                onLongPress={() => handleTriggerOptions(item)}
                delayLongPress={380}
                style={[
                  styles.itemRow,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: colors.primaryGlow },
                  ]}
                >
                  <GymIcon name="barbell" size={18} color={colors.primary} />
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.weightText, { color: colors.text }]}>
                    {item.weight} kg × {item.reps} reps
                  </Text>
                  <View style={styles.metaRow}>
                    <GymIcon
                      name="calendar"
                      size={11}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {fecha} • RPE {item.rpe || 8}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.rmPill,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.rmPillLabel, { color: colors.primary }]}>
                    1RM
                  </Text>
                  <Text style={[styles.rmPillValue, { color: colors.primary }]}>
                    {oneRm} kg
                  </Text>
                </View>

                {onMarcaOptionsPress && (
                  <Pressable
                    onPress={() => onMarcaOptionsPress(item)}
                    hitSlop={10}
                    style={styles.moreBtn}
                  >
                    <GymIcon
                      name="more-vertical"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View
          style={[
            styles.emptyBox,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="trending-up" size={22} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Aún no hay levantamientos registrados para este ejercicio.
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
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  countText: {
    fontSize: 12,
    fontWeight: "800",
  },
  listWrap: {
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  weightText: {
    fontSize: 15,
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "600",
  },
  rmPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  rmPillLabel: {
    fontSize: 9,
    fontWeight: "800",
  },
  rmPillValue: {
    fontSize: 13,
    fontWeight: "900",
  },
  moreBtn: {
    padding: 4,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
});
