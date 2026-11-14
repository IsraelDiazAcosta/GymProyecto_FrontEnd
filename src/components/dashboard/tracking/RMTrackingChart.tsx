import React, { useState } from "react";
import {
  LayoutRectangle,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle as SvgCircle,
  Defs,
  LinearGradient,
  Polygon,
  Polyline,
  Stop,
} from "react-native-svg";

import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { ProgressionItem, Routine } from "@/services/api";
import { DashboardColors } from "../types";

export interface RMTrackingChartProps {
  colors: DashboardColors;
  routines: Routine[];
  trackingRoutineId: string;
  trackingExerciseId: string;
  exercises: {
    id: string;
    name: string;
  }[];
  marcaHistory: ProgressionItem[];
  onSelectRoutine: (routineId: string) => void;
  onSelectExercise: (exerciseId: string) => void;
}

/**
 * Gráfica interactiva de evolución 1RM con degradado SVG Esmeralda,
 * récord personal destacado y comparativa porcentual de fuerza.
 */
export const RMTrackingChart: React.FC<RMTrackingChartProps> = ({
  colors,
  routines,
  trackingRoutineId,
  trackingExerciseId,
  exercises,
  marcaHistory,
  onSelectRoutine,
  onSelectExercise,
}) => {
  const [chartSize, setChartSize] = useState<LayoutRectangle | null>(null);

  const validHistory = (marcaHistory || []).filter(
    (item) =>
      typeof item.weight === "number" &&
      typeof item.reps === "number" &&
      item.weight > 0 &&
      item.reps > 0,
  );

  const rmList = validHistory.map((item) => {
    const reps = item.reps;
    const weight = item.weight;
    const oneRm =
      reps > 0 && reps < 37 ? weight * (36 / (37 - reps)) : weight;
    const dateLabel = item.logged_at
      ? new Date(item.logged_at).toLocaleDateString()
      : "Reciente";

    return {
      oneRm: Number(oneRm.toFixed(1)),
      weight,
      reps,
      dateLabel,
    };
  });

  const bestRM =
    rmList.length > 0 ? Math.max(...rmList.map((x) => x.oneRm)) : null;
  const lastRM = rmList.length > 0 ? rmList[rmList.length - 1] : null;
  const firstRM = rmList.length > 0 ? rmList[0] : null;
  const deltaPct =
    firstRM && lastRM && firstRM.oneRm > 0
      ? (((lastRM.oneRm - firstRM.oneRm) / firstRM.oneRm) * 100).toFixed(1)
      : null;

  let linePoints = "";
  let areaPoints = "";
  let pointCoords: { x: number; y: number; value: number; dateLabel: string }[] =
    [];

  if (chartSize && rmList.length > 0) {
    const { width, height } = chartSize;
    const paddingHorizontal = 24;
    const paddingVertical = 24;

    const values = rmList.map((x) => x.oneRm);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const span = maxVal - minVal || 1;

    const usableWidth = Math.max(width - paddingHorizontal * 2, 1);
    const usableHeight = Math.max(height - paddingVertical * 2, 1);

    pointCoords = rmList.map((item, index) => {
      const t = rmList.length === 1 ? 0.5 : index / (rmList.length - 1);
      const x = paddingHorizontal + t * usableWidth;
      const norm = (item.oneRm - minVal) / span;
      const y = paddingVertical + (1 - norm) * usableHeight;
      return { x, y, value: item.oneRm, dateLabel: item.dateLabel };
    });

    linePoints = pointCoords.map((p) => `${p.x},${p.y}`).join(" ");
    if (pointCoords.length > 1) {
      const firstX = pointCoords[0].x;
      const lastX = pointCoords[pointCoords.length - 1].x;
      const bottomY = height - 10;
      areaPoints = `${firstX},${bottomY} ${linePoints} ${lastX},${bottomY}`;
    }
  }

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
        <View style={{ flex: 1 }}>
          <View style={styles.kickerRow}>
            <GymIcon name="trending-up" size={15} color={colors.primary} />
            <Text style={[styles.kickerText, { color: colors.primary }]}>
              ANALÍTICA DE FUERZA
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Evolución de 1RM Estimado
          </Text>
        </View>

        {bestRM !== null && (
          <View
            style={[
              styles.prBadge,
              {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.prHeader}>
              <GymIcon name="award" size={12} color={colors.primary} />
              <Text style={[styles.prBadgeLabel, { color: colors.primary }]}>
                RÉCORD 1RM
              </Text>
            </View>
            <Text style={[styles.prBadgeValue, { color: colors.primary }]}>
              {bestRM} kg
            </Text>
          </View>
        )}
      </View>

      {/* Selector de rutina */}
      <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>
        Rutina activa
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {routines.map((r) => {
          const active = trackingRoutineId === r.id;
          return (
            <Pressable
              key={r.id}
              onPress={() => onSelectRoutine(r.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.backgroundElevated,
                  borderColor: active
                    ? colors.primaryLight
                    : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? colors.onPrimary : colors.textSecondary },
                ]}
              >
                {r.title || (r as any).name || "Rutina"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Selector de ejercicio */}
      <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>
        Ejercicio a graficar
      </Text>
      {exercises.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {exercises.map((ex) => {
            const active = trackingExerciseId === ex.id;
            return (
              <Pressable
                key={ex.id}
                onPress={() => onSelectExercise(ex.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : colors.backgroundElevated,
                    borderColor: active
                      ? colors.primaryLight
                      : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? colors.onPrimary : colors.textSecondary },
                  ]}
                >
                  {ex.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
          Esta rutina aún no tiene ejercicios asignados.
        </Text>
      )}

      {/* Lienzo de la gráfica */}
      <View
        style={[
          styles.chartVisualBox,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
        onLayout={(e) => setChartSize(e.nativeEvent.layout)}
      >
        {rmList.length === 0 ? (
          <View style={styles.emptyChartState}>
            <GymIcon name="activity" size={28} color={colors.textSecondary} />
            <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
              Registra al menos un levantamiento para visualizar la curva 1RM.
            </Text>
          </View>
        ) : (
          chartSize && (
            <>
              <Svg width={chartSize.width} height={chartSize.height}>
                <Defs>
                  <LinearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop
                      offset="0%"
                      stopColor={colors.primary}
                      stopOpacity="0.38"
                    />
                    <Stop
                      offset="100%"
                      stopColor={colors.primary}
                      stopOpacity="0.0"
                    />
                  </LinearGradient>
                </Defs>

                {pointCoords.length > 1 && (
                  <Polygon points={areaPoints} fill="url(#emeraldGrad)" />
                )}

                {pointCoords.length > 1 && (
                  <Polyline
                    points={linePoints}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {pointCoords.map((p, index) => (
                  <SvgCircle
                    key={index}
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill={colors.backgroundElement}
                    stroke={colors.primary}
                    strokeWidth={3}
                  />
                ))}
              </Svg>

              {pointCoords.map((p, index) => (
                <View
                  key={index}
                  style={[
                    styles.pointLabelContainer,
                    {
                      left: p.x - 28,
                      top: Math.max(p.y - 26, 4),
                    },
                  ]}
                >
                  <Text
                    style={[styles.pointValueText, { color: colors.text }]}
                  >
                    {p.value} kg
                  </Text>
                </View>
              ))}
            </>
          )
        )}
      </View>

      {/* Estadísticas inferiores */}
      {lastRM && (
        <View
          style={[
            styles.footerStats,
            { borderTopColor: colors.borderSubtle },
          ]}
        >
          <View style={styles.statColumn}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Último registro ({lastRM.dateLabel})
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {lastRM.weight} kg × {lastRM.reps} reps ({lastRM.oneRm} kg 1RM)
            </Text>
          </View>

          {deltaPct !== null && (
            <View
              style={[
                styles.deltaPill,
                {
                  backgroundColor:
                    Number(deltaPct) >= 0
                      ? colors.primaryGlow
                      : colors.dangerGlow,
                },
              ]}
            >
              <GymIcon
                name="trending-up"
                size={13}
                color={Number(deltaPct) >= 0 ? colors.primary : colors.danger}
              />
              <Text
                style={[
                  styles.deltaText,
                  {
                    color:
                      Number(deltaPct) >= 0 ? colors.primary : colors.danger,
                  },
                ]}
              >
                {Number(deltaPct) >= 0 ? `+${deltaPct}%` : `${deltaPct}%`}
              </Text>
            </View>
          )}
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
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  kickerText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  prBadge: {
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "flex-end",
    borderWidth: 1,
  },
  prHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  prBadgeLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  prBadgeValue: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 1,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 4,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
  },
  emptyHint: {
    fontSize: 12,
    fontStyle: "italic",
  },
  chartVisualBox: {
    height: 195,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: 6,
    overflow: "hidden",
    justifyContent: "center",
  },
  emptyChartState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyChartText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  pointLabelContainer: {
    position: "absolute",
    width: 56,
    alignItems: "center",
  },
  pointValueText: {
    fontSize: 10,
    fontWeight: "800",
  },
  footerStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
  },
  statColumn: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  deltaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: "900",
  },
});
