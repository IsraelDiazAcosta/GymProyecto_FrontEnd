import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import {
  api,
  ProgressionItem,
  Routine,
  RoutineSessionSummaryItem,
  WorkoutSessionDetail,
  WorkoutSessionItem,
} from "@/services/api";
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

export interface RoutineSessionHistorySectionProps {
  colors: DashboardColors;
  routines: Routine[];
  refreshTrigger?: unknown;
}

type PeriodFilter = "week" | "month" | "all";
type HistoryViewMode = "sessions" | "by_routine";

const MONTHS_SHORT_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

const formatReadableDuration = (seconds?: number | null): string => {
  const safe = Math.max(0, Math.floor(seconds ?? 0));
  if (safe === 0) return "0 min";
  if (safe < 60) return `${safe} s`;
  const totalMinutes = Math.floor(safe / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} h ${minutes} min`;
  if (hours > 0) return `${hours} h`;
  return `${minutes} min`;
};

const parseSessionDate = (raw?: string | null): Date | null => {
  if (!raw) return null;
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const formatLocalDateTime = (raw?: string | null): string => {
  const dt = parseSessionDate(raw);
  if (!dt) return "Fecha reciente";
  const day = dt.getDate();
  const month = MONTHS_SHORT_ES[dt.getMonth()];
  const year = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} • ${hh}:${mm}`;
};

const formatLocalDateOnly = (raw?: string | null): string => {
  const dt = parseSessionDate(raw);
  if (!dt) return "Sin fecha";
  const day = dt.getDate();
  const month = MONTHS_SHORT_ES[dt.getMonth()];
  const year = dt.getFullYear();
  return `${day} ${month} ${year}`;
};

const getLocalPeriodBounds = (period: PeriodFilter) => {
  if (period === "all") return { desde: undefined, hasta: undefined };
  const now = new Date();
  if (period === "week") {
    const dayIdx = (now.getDay() + 6) % 7;
    const monday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - dayIdx,
      0,
      0,
      0,
      0,
    );
    const sundayEnd = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + 6,
      23,
      59,
      59,
      999,
    );
    return {
      desde: monday.toISOString(),
      hasta: sundayEnd.toISOString(),
    };
  }
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return {
    desde: monthStart.toISOString(),
    hasta: monthEnd.toISOString(),
  };
};

const resolveSessionRoutineName = (item: WorkoutSessionItem): string => {
  if (item.routine && typeof item.routine === "object") {
    return item.routine.name || item.routine.title || "Rutina";
  }
  if (item.routine_detail) {
    return item.routine_detail.name || item.routine_detail.title || "Rutina";
  }
  return item.routine_title || item.title || "Rutina";
};

const resolveSessionDurationSeconds = (item: WorkoutSessionItem): number => {
  if (typeof item.duration_seconds === "number") {
    return Math.max(0, item.duration_seconds);
  }
  if (typeof item.duration_minutes === "number") {
    return Math.max(0, Math.round(item.duration_minutes * 60));
  }
  return 0;
};

/**
 * Sección "Historial de rutinas" para la pestaña Progreso:
 * resumen superior, filtros por periodo/rutina, vista cronológica paginada,
 * agrupación por rutina y modal de detalle con series o ejercicios planeados.
 */
export const RoutineSessionHistorySection: React.FC<
  RoutineSessionHistorySectionProps
> = ({ colors, routines, refreshTrigger }) => {
  const [viewMode, setViewMode] = useState<HistoryViewMode>("sessions");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>("all");

  const [sessions, setSessions] = useState<WorkoutSessionItem[]>([]);
  const [routineSummaries, setRoutineSummaries] = useState<
    RoutineSessionSummaryItem[]
  >([]);
  const [summaryTotals, setSummaryTotals] = useState({
    total_sessions: 0,
    total_duration_seconds: 0,
    average_duration_seconds: 0,
  });

  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSession, setDetailSession] =
    useState<WorkoutSessionDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const requestSeqRef = useRef(0);

  const filterParams = useMemo(() => {
    const { desde, hasta } = getLocalPeriodBounds(periodFilter);
    return {
      desde,
      hasta,
      routine_id: selectedRoutineId === "all" ? undefined : selectedRoutineId,
    };
  }, [periodFilter, selectedRoutineId]);

  const loadHistoryInitial = useCallback(async () => {
    const seq = ++requestSeqRef.current;
    setLoadingInitial(true);
    setLoadError(null);
    try {
      const [paginatedRes, routineSummaryRes] = await Promise.all([
        api.getCompletedSessionsPaginated({
          page: 1,
          ...filterParams,
        }),
        api.getRoutineSessionsSummary(filterParams),
      ]);

      if (seq !== requestSeqRef.current) return;

      const list = paginatedRes.results || [];
      setSessions(list);
      setTotalCount(paginatedRes.count ?? list.length);
      setHasNextPage(Boolean(paginatedRes.next));
      setPage(1);
      setRoutineSummaries(routineSummaryRes || []);

      if (paginatedRes.summary) {
        setSummaryTotals(paginatedRes.summary);
      } else {
        const count = list.length;
        const totalDuration = list.reduce(
          (acc, s) => acc + resolveSessionDurationSeconds(s),
          0,
        );
        setSummaryTotals({
          total_sessions: count,
          total_duration_seconds: totalDuration,
          average_duration_seconds:
            count > 0 ? Math.round(totalDuration / count) : 0,
        });
      }
    } catch {
      if (seq !== requestSeqRef.current) return;
      setLoadError("No se pudo cargar el historial de rutinas.");
    } finally {
      if (seq === requestSeqRef.current) {
        setLoadingInitial(false);
      }
    }
  }, [filterParams]);

  useEffect(() => {
    loadHistoryInitial();
  }, [loadHistoryInitial, refreshTrigger]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage) return;
    const seq = requestSeqRef.current;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await api.getCompletedSessionsPaginated({
        page: nextPage,
        ...filterParams,
      });
      if (seq !== requestSeqRef.current) return;
      const incoming = res.results || [];
      setSessions((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const uniqueIncoming = incoming.filter((item) => !seen.has(item.id));
        return [...prev, ...uniqueIncoming];
      });
      setTotalCount(res.count ?? totalCount);
      setHasNextPage(Boolean(res.next));
      setPage(nextPage);
    } catch {
      // Mantener los elementos ya cargados si falla la paginación puntual
    } finally {
      if (seq === requestSeqRef.current) {
        setLoadingMore(false);
      }
    }
  };

  const handleOpenSessionDetail = async (sessionItem: WorkoutSessionItem) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailSession({
      ...sessionItem,
      has_logged_sets: false,
      exercises: [],
    });

    try {
      const detail = await api.getWorkoutSessionDetail(sessionItem.id);
      setDetailSession(detail);
    } catch {
      setDetailError("No se pudo cargar el detalle de esta sesión.");
    } finally {
      setDetailLoading(false);
    }
  };

  const periodOptions: { key: PeriodFilter; label: string }[] = [
    { key: "week", label: "Esta semana" },
    { key: "month", label: "Este mes" },
    { key: "all", label: "Todo" },
  ];

  const isEmpty =
    !loadingInitial &&
    (viewMode === "sessions"
      ? sessions.length === 0
      : routineSummaries.length === 0);

  return (
    <AnimatedCard
      style={[
        historySectionStyles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      {/* Cabecera de la sección */}
      <View style={historySectionStyles.headerRow}>
        <View style={historySectionStyles.titleRow}>
          <View
            style={[
              historySectionStyles.iconBox,
              {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.border,
              },
            ]}
          >
            <GymIcon name="calendar" size={19} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[historySectionStyles.title, { color: colors.text }]}>
              Historial de rutinas
            </Text>
            <Text
              style={[
                historySectionStyles.subtitle,
                { color: colors.textSecondary },
              ]}
            >
              Sesiones completadas, duración y detalle por rutina
            </Text>
          </View>
        </View>
      </View>

      {/* Resumen superior */}
      <View style={historySectionStyles.summaryGrid}>
        <View
          style={[
            historySectionStyles.summaryBox,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Text
            style={[
              historySectionStyles.summaryLabel,
              { color: colors.textSecondary },
            ]}
          >
            Sesiones
          </Text>
          <Text
            style={[historySectionStyles.summaryValue, { color: colors.primary }]}
          >
            {summaryTotals.total_sessions}
          </Text>
        </View>

        <View
          style={[
            historySectionStyles.summaryBox,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Text
            style={[
              historySectionStyles.summaryLabel,
              { color: colors.textSecondary },
            ]}
          >
            Tiempo total
          </Text>
          <Text
            style={[historySectionStyles.summaryValue, { color: colors.text }]}
          >
            {formatReadableDuration(summaryTotals.total_duration_seconds)}
          </Text>
        </View>

        <View
          style={[
            historySectionStyles.summaryBox,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Text
            style={[
              historySectionStyles.summaryLabel,
              { color: colors.textSecondary },
            ]}
          >
            Promedio
          </Text>
          <Text
            style={[historySectionStyles.summaryValue, { color: colors.text }]}
          >
            {formatReadableDuration(summaryTotals.average_duration_seconds)}
          </Text>
        </View>
      </View>

      {/* Selector de vista */}
      <View
        style={[
          historySectionStyles.segmentedBar,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        {(
          [
            { key: "sessions", label: "Sesiones" },
            { key: "by_routine", label: "Por rutina" },
          ] as const
        ).map((tab) => {
          const active = viewMode === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setViewMode(tab.key)}
              style={[
                historySectionStyles.segmentedBtn,
                active && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  historySectionStyles.segmentedText,
                  { color: active ? colors.onPrimary : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Filtro rápido por periodo */}
      <View style={historySectionStyles.filtersGroup}>
        <View style={historySectionStyles.filterHeader}>
          <GymIcon name="clock" size={12} color={colors.textSecondary} />
          <Text
            style={[
              historySectionStyles.filterLabel,
              { color: colors.textSecondary },
            ]}
          >
            Periodo
          </Text>
        </View>
        <View style={historySectionStyles.periodRow}>
          {periodOptions.map((opt) => {
            const active = periodFilter === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setPeriodFilter(opt.key)}
                style={[
                  historySectionStyles.filterChip,
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
                    historySectionStyles.filterChipText,
                    { color: active ? colors.onPrimary : colors.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Filtro rápido por rutina */}
      {routines.length > 0 && (
        <View style={historySectionStyles.filtersGroup}>
          <View style={historySectionStyles.filterHeader}>
            <GymIcon name="filter" size={12} color={colors.textSecondary} />
            <Text
              style={[
                historySectionStyles.filterLabel,
                { color: colors.textSecondary },
              ]}
            >
              Rutina
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={historySectionStyles.chipsScrollRow}
          >
            <Pressable
              onPress={() => setSelectedRoutineId("all")}
              style={[
                historySectionStyles.filterChip,
                {
                  backgroundColor:
                    selectedRoutineId === "all"
                      ? colors.primary
                      : colors.backgroundElevated,
                  borderColor:
                    selectedRoutineId === "all"
                      ? colors.primaryLight
                      : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  historySectionStyles.filterChipText,
                  {
                    color:
                      selectedRoutineId === "all"
                        ? colors.onPrimary
                        : colors.textSecondary,
                  },
                ]}
              >
                Todas
              </Text>
            </Pressable>

            {routines.map((r) => {
              const active = selectedRoutineId === r.id;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setSelectedRoutineId(r.id)}
                  style={[
                    historySectionStyles.filterChip,
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
                      historySectionStyles.filterChipText,
                      {
                        color: active ? colors.onPrimary : colors.textSecondary,
                      },
                    ]}
                  >
                    {r.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Contenido */}
      {loadingInitial ? (
        <View style={historySectionStyles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text
            style={[
              historySectionStyles.loadingText,
              { color: colors.textSecondary },
            ]}
          >
            Cargando historial...
          </Text>
        </View>
      ) : loadError ? (
        <View
          style={[
            historySectionStyles.emptyBox,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="info" size={20} color={colors.textSecondary} />
          <Text
            style={[
              historySectionStyles.emptyText,
              { color: colors.textSecondary },
            ]}
          >
            {loadError}
          </Text>
          <Pressable
            onPress={loadHistoryInitial}
            style={[
              historySectionStyles.retryBtn,
              {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[historySectionStyles.retryText, { color: colors.primary }]}
            >
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : isEmpty ? (
        <View
          style={[
            historySectionStyles.emptyBox,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="layers" size={22} color={colors.textSecondary} />
          <Text
            style={[
              historySectionStyles.emptyText,
              { color: colors.textSecondary },
            ]}
          >
            Aún no has completado rutinas
          </Text>
        </View>
      ) : viewMode === "sessions" ? (
        <View style={historySectionStyles.listWrap}>
          {sessions.map((item) => {
            const routineName = resolveSessionRoutineName(item);
            const durationSec = resolveSessionDurationSeconds(item);
            const rawDate =
              item.ended_at ||
              item.end_time ||
              item.started_at ||
              item.start_time;
            const totalEx = item.total_exercises ?? 0;
            const totalSets = item.total_sets ?? 0;
            const totalVol = item.total_volume ?? 0;

            return (
              <Pressable
                key={item.id}
                onPress={() => handleOpenSessionDetail(item)}
                style={[
                  historySectionStyles.sessionCard,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View style={historySectionStyles.sessionCardTop}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text
                      style={[
                        historySectionStyles.sessionRoutineTitle,
                        { color: colors.text },
                      ]}
                      numberOfLines={1}
                    >
                      {routineName}
                    </Text>
                    <View style={historySectionStyles.metaRow}>
                      <GymIcon
                        name="calendar"
                        size={12}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          historySectionStyles.sessionDateText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {formatLocalDateTime(rawDate)}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      historySectionStyles.durationBadge,
                      {
                        backgroundColor: colors.primaryGlow,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <GymIcon name="clock" size={12} color={colors.primary} />
                    <Text
                      style={[
                        historySectionStyles.durationBadgeText,
                        { color: colors.primary },
                      ]}
                    >
                      {formatReadableDuration(durationSec)}
                    </Text>
                  </View>
                </View>

                <View style={historySectionStyles.sessionStatsRow}>
                  <View
                    style={[
                      historySectionStyles.statPill,
                      {
                        backgroundColor: colors.backgroundElement,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        historySectionStyles.statPillText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {totalEx} {totalEx === 1 ? "ejercicio" : "ejercicios"}
                    </Text>
                  </View>

                  <View
                    style={[
                      historySectionStyles.statPill,
                      {
                        backgroundColor: colors.backgroundElement,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        historySectionStyles.statPillText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {totalSets} {totalSets === 1 ? "serie" : "series"}
                    </Text>
                  </View>

                  {totalVol > 0 && (
                    <View
                      style={[
                        historySectionStyles.statPill,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: colors.borderSubtle,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          historySectionStyles.statPillText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {Math.round(totalVol)} kg vol.
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }} />
                  <GymIcon
                    name="chevron-right"
                    size={16}
                    color={colors.textSecondary}
                  />
                </View>
              </Pressable>
            );
          })}

          {hasNextPage && (
            <Pressable
              onPress={handleLoadMore}
              disabled={loadingMore}
              style={[
                historySectionStyles.loadMoreBtn,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text
                  style={[
                    historySectionStyles.loadMoreText,
                    { color: colors.primary },
                  ]}
                >
                  Cargar más sesiones ({sessions.length} de {totalCount})
                </Text>
              )}
            </Pressable>
          )}
        </View>
      ) : (
        <View style={historySectionStyles.listWrap}>
          {routineSummaries.map((entry, idx) => (
            <View
              key={entry.routine_id || `${entry.routine_name}-${idx}`}
              style={[
                historySectionStyles.routineSummaryCard,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <View style={historySectionStyles.routineSummaryTop}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={[
                      historySectionStyles.sessionRoutineTitle,
                      { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {entry.routine_name}
                  </Text>
                  <Text
                    style={[
                      historySectionStyles.sessionDateText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Última vez: {formatLocalDateOnly(entry.last_session_at)}
                  </Text>
                </View>

                <View
                  style={[
                    historySectionStyles.sessionsCountBadge,
                    { backgroundColor: colors.primaryGlow },
                  ]}
                >
                  <Text
                    style={[
                      historySectionStyles.sessionsCountText,
                      { color: colors.primary },
                    ]}
                  >
                    {entry.sessions_count}{" "}
                    {entry.sessions_count === 1 ? "sesión" : "sesiones"}
                  </Text>
                </View>
              </View>

              <View style={historySectionStyles.routineMetricsRow}>
                <View
                  style={[
                    historySectionStyles.routineMetricCell,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      historySectionStyles.routineMetricLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Duración promedio
                  </Text>
                  <Text
                    style={[
                      historySectionStyles.routineMetricVal,
                      { color: colors.primary },
                    ]}
                  >
                    {formatReadableDuration(entry.average_duration_seconds)}
                  </Text>
                </View>

                <View
                  style={[
                    historySectionStyles.routineMetricCell,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      historySectionStyles.routineMetricLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Tiempo acumulado
                  </Text>
                  <Text
                    style={[
                      historySectionStyles.routineMetricVal,
                      { color: colors.text },
                    ]}
                  >
                    {formatReadableDuration(entry.total_duration_seconds)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Modal de detalle de sesión */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View
          style={[
            historySectionStyles.modalOverlay,
            { backgroundColor: colors.overlay },
          ]}
        >
          <View
            style={[
              historySectionStyles.modalSheet,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Header con botón volver */}
            <View style={historySectionStyles.modalHeader}>
              <Pressable
                onPress={() => setDetailModalVisible(false)}
                style={[
                  historySectionStyles.backBtn,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View style={{ transform: [{ rotate: "180deg" }] }}>
                  <GymIcon
                    name="chevron-right"
                    size={16}
                    color={colors.primary}
                  />
                </View>
                <Text
                  style={[
                    historySectionStyles.backBtnText,
                    { color: colors.text },
                  ]}
                >
                  Volver
                </Text>
              </Pressable>

              {detailSession && (
                <View
                  style={[
                    historySectionStyles.durationBadge,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <GymIcon name="clock" size={12} color={colors.primary} />
                  <Text
                    style={[
                      historySectionStyles.durationBadgeText,
                      { color: colors.primary },
                    ]}
                  >
                    {formatReadableDuration(
                      resolveSessionDurationSeconds(detailSession),
                    )}
                  </Text>
                </View>
              )}
            </View>

            {detailSession && (
              <View style={historySectionStyles.modalTitleWrap}>
                <Text
                  style={[
                    historySectionStyles.modalTitle,
                    { color: colors.text },
                  ]}
                >
                  {resolveSessionRoutineName(detailSession)}
                </Text>
                <Text
                  style={[
                    historySectionStyles.modalSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {formatLocalDateTime(
                    detailSession.ended_at ||
                      detailSession.end_time ||
                      detailSession.started_at ||
                      detailSession.start_time,
                  )}
                </Text>
              </View>
            )}

            {detailLoading ? (
              <View style={historySectionStyles.loadingBox}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[
                    historySectionStyles.loadingText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cargando ejercicios de la sesión...
                </Text>
              </View>
            ) : detailError ? (
              <View
                style={[
                  historySectionStyles.emptyBox,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    historySectionStyles.emptyText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {detailError}
                </Text>
              </View>
            ) : !detailSession || detailSession.exercises.length === 0 ? (
              <View
                style={[
                  historySectionStyles.emptyBox,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <GymIcon
                  name="barbell"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    historySectionStyles.emptyText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Sin registro de series
                </Text>
              </View>
            ) : (
              <ScrollView
                style={{ maxHeight: 420 }}
                contentContainerStyle={{ gap: 10 }}
                showsVerticalScrollIndicator={false}
              >
                {detailSession.exercises.map((ex, idx) => (
                  <View
                    key={`${ex.id}-${idx}`}
                    style={[
                      historySectionStyles.detailExCard,
                      {
                        backgroundColor: colors.backgroundElevated,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <View style={historySectionStyles.detailExHeader}>
                      <View
                        style={[
                          historySectionStyles.exOrderBadge,
                          { backgroundColor: colors.primaryGlow },
                        ]}
                      >
                        <Text
                          style={[
                            historySectionStyles.exOrderText,
                            { color: colors.primary },
                          ]}
                        >
                          {ex.order || idx + 1}
                        </Text>
                      </View>
                      <Text
                        style={[
                          historySectionStyles.detailExName,
                          { color: colors.text },
                        ]}
                        numberOfLines={2}
                      >
                        {ex.exercise_name}
                      </Text>
                    </View>

                    {ex.unrecorded || ex.sets.length === 0 ? (
                      <View
                        style={[
                          historySectionStyles.unrecordedBanner,
                          {
                            backgroundColor: colors.backgroundElement,
                            borderColor: colors.borderSubtle,
                          },
                        ]}
                      >
                        <GymIcon
                          name="info"
                          size={13}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            historySectionStyles.unrecordedText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Sin registro de series
                          {ex.planned_sets
                            ? ` • Planeado: ${ex.planned_sets} × ${ex.planned_reps || "-"} reps`
                            : ""}
                        </Text>
                      </View>
                    ) : (
                      <View style={historySectionStyles.setsList}>
                        {ex.sets.map((s) => (
                          <View
                            key={s.id}
                            style={[
                              historySectionStyles.setRow,
                              {
                                backgroundColor: colors.backgroundElement,
                                borderColor: colors.borderSubtle,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                historySectionStyles.setNumText,
                                { color: colors.textSecondary },
                              ]}
                            >
                              Serie {s.set_number}
                            </Text>
                            <Text
                              style={[
                                historySectionStyles.setLoadText,
                                { color: colors.text },
                              ]}
                            >
                              {s.weight} kg × {s.reps} reps
                            </Text>
                            {s.rpe !== null && s.rpe !== undefined && (
                              <Text
                                style={[
                                  historySectionStyles.setRpeText,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                RPE {s.rpe}
                              </Text>
                            )}
                            <View
                              style={[
                                historySectionStyles.setRmBadge,
                                { backgroundColor: colors.primaryGlow },
                              ]}
                            >
                              <Text
                                style={[
                                  historySectionStyles.setRmText,
                                  { color: colors.primary },
                                ]}
                              >
                                1RM {Number(s.estimated_1rm).toFixed(1)}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </AnimatedCard>
  );
};

const historySectionStyles = StyleSheet.create({
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
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
  },
  summaryBox: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 3,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "900",
  },
  segmentedBar: {
    flexDirection: "row",
    padding: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: "800",
  },
  filtersGroup: {
    gap: 6,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
  },
  chipsScrollRow: {
    gap: 8,
    paddingBottom: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  retryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "800",
  },
  listWrap: {
    gap: 9,
  },
  sessionCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  sessionCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  sessionRoutineTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sessionDateText: {
    fontSize: 11,
    fontWeight: "600",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  durationBadgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  sessionStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  statPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  loadMoreBtn: {
    paddingVertical: 11,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  loadMoreText: {
    fontSize: 12,
    fontWeight: "800",
  },
  routineSummaryCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  routineSummaryTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sessionsCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  sessionsCountText: {
    fontSize: 11,
    fontWeight: "900",
  },
  routineMetricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  routineMetricCell: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 9,
    gap: 2,
  },
  routineMetricLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  routineMetricVal: {
    fontSize: 13,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalSheet: {
    width: "100%",
    maxWidth: 440,
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  modalTitleWrap: {
    gap: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailExCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  detailExHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exOrderBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  exOrderText: {
    fontSize: 12,
    fontWeight: "900",
  },
  detailExName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  unrecordedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  unrecordedText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  setsList: {
    gap: 6,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  setNumText: {
    fontSize: 11,
    fontWeight: "800",
  },
  setLoadText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  setRpeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  setRmBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  setRmText: {
    fontSize: 10,
    fontWeight: "900",
  },
});
