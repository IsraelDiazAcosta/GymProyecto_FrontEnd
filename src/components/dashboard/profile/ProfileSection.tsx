import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import {
  LayoutRectangle,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Polyline, Circle as SvgCircle } from "react-native-svg";

import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getExperienceLevelLabel,
  getTrainingGoalLabel,
} from "@/i18n";
import {
  api,
  BodyWeightLogItem,
  Exercise,
  resolveMediaUrl,
  Weight1RMPoint,
} from "@/services/api";
import { WeeklyAttendanceCard } from "../routines/WeeklyAttendanceCard";
import { DashboardColors } from "../types";
import { EditProfileForm } from "./EditProfileForm";
import { SettingsModal } from "./SettingsModal";

const formatDecimal = (v?: number | string | null) => {
  const n = Number(v);
  return v === null || v === undefined || v === "" || !Number.isFinite(n)
    ? null
    : n;
};

export interface ProfileSectionProps {
  colors: DashboardColors;
  exercises?: Exercise[];
  showAdminUsers: boolean;
  adminUsers: any[];
  onLoadAdminUsers: () => void;
  trainedDayFlags?: number[];
  todayWeekIndex?: number;
  trainedCount?: number;
}

/**
 * Sección de Perfil y Administración con insignia vectorial de rol,
 * historial de peso corporal cruzado con curva 1RM, directorio de atletas y cierre de sesión seguro.
 */
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  colors,
  exercises = [],
  showAdminUsers,
  adminUsers,
  onLoadAdminUsers,
  trainedDayFlags = [0, 0, 0, 0, 0, 0, 0],
  todayWeekIndex = 0,
  trainedCount = 0,
}) => {
  const { user, logout, updateProfile } = useAuth();
  const { language, t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [weightLogs, setWeightLogs] = useState<BodyWeightLogItem[]>([]);
  const [rmProgress, setRmProgress] = useState<Weight1RMPoint[]>([]);
  const [selectedExId, setSelectedExId] = useState<string>("");
  const [newWeightInput, setNewWeightInput] = useState("");
  const [savingWeightLog, setSavingWeightLog] = useState(false);
  const [chartSize, setChartSize] = useState<LayoutRectangle | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const loadWeightAnd1RM = useCallback(async (exId?: string) => {
    try {
      const [logs, crossData] = await Promise.all([
        api.getWeightLogs().catch(() => []),
        api
          .getWeight1RMProgress(exId || undefined)
          .catch(() => ({ weight_logs: [], progress: [] })),
      ]);
      setWeightLogs(logs);
      setRmProgress(crossData.progress || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadWeightAnd1RM(selectedExId);
  }, [loadWeightAnd1RM, selectedExId]);

  const handleAddWeightLog = async () => {
    const clean = newWeightInput.trim().replace(",", ".");
    const num = Number(clean);
    if (!Number.isFinite(num) || num <= 0 || num >= 1000) return;
    setSavingWeightLog(true);
    try {
      await api.createWeightLog(Number(num.toFixed(2)));
      await updateProfile({ current_weight: num.toFixed(2) }).catch(
        () => undefined,
      );
      setNewWeightInput("");
      await loadWeightAnd1RM(selectedExId);
    } finally {
      setSavingWeightLog(false);
    }
  };

  const initial = (user?.username || user?.email || "A")[0].toUpperCase();
  const avatarUrl = resolveMediaUrl(user?.avatar);

  const latestLogWeight =
    weightLogs.length > 0 ? formatDecimal(weightLogs[0].weight) : null;
  const weight = latestLogWeight ?? formatDecimal(user?.current_weight);
  const height = formatDecimal(user?.height);
  const bmi =
    weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(1) : null;
  const levelLabel = getExperienceLevelLabel(language, user?.experience_level);
  const goalLabel = getTrainingGoalLabel(language, user?.training_goal);
  const favoritesCount = user?.favorite_exercises?.length ?? 0;

  const stats = [
    { icon: "award" as const, label: t("profile.statLevel"), value: levelLabel },
    { icon: "flame" as const, label: t("profile.statGoal"), value: goalLabel },
    {
      icon: "activity" as const,
      label: t("profile.statWeight"),
      value: weight ? `${weight} kg` : "--",
    },
    {
      icon: "trending-up" as const,
      label: t("profile.statHeight"),
      value: height ? `${height} cm` : "--",
    },
    { icon: "target" as const, label: t("profile.statBmi"), value: bmi ?? "--" },
  ];

  // Preparar series para la gráfica dual (Peso Corporal vs Curva 1RM)
  const sortedLogs = [...weightLogs]
    .map((l) => ({ date: l.date, val: Number(l.weight) }))
    .filter((l) => Number.isFinite(l.val) && l.val > 0)
    .reverse();

  const rmSeries = rmProgress
    .map((p) => ({
      date: p.date,
      rm: Number(p.estimated_1rm),
      bw: p.body_weight ? Number(p.body_weight) : null,
    }))
    .filter((p) => Number.isFinite(p.rm) && p.rm > 0);

  let bwPointsStr = "";
  let rmPointsStr = "";
  let bwDots: { x: number; y: number; val: number }[] = [];
  let rmDots: { x: number; y: number; val: number }[] = [];

  if (chartSize) {
    const padX = 20;
    const padY = 20;
    const wBox = Math.max(chartSize.width - padX * 2, 1);
    const hBox = Math.max(chartSize.height - padY * 2, 1);

    if (sortedLogs.length > 0) {
      const vals = sortedLogs.map((x) => x.val);
      const minV = Math.min(...vals);
      const maxV = Math.max(...vals);
      const span = maxV - minV || 1;
      bwDots = sortedLogs.map((pt, i) => {
        const t = sortedLogs.length === 1 ? 0.5 : i / (sortedLogs.length - 1);
        return {
          x: padX + t * wBox,
          y: padY + (1 - (pt.val - minV) / span) * hBox,
          val: pt.val,
        };
      });
      bwPointsStr = bwDots.map((d) => `${d.x},${d.y}`).join(" ");
    }

    if (rmSeries.length > 0) {
      const vals = rmSeries.map((x) => x.rm);
      const minV = Math.min(...vals);
      const maxV = Math.max(...vals);
      const span = maxV - minV || 1;
      rmDots = rmSeries.map((pt, i) => {
        const t = rmSeries.length === 1 ? 0.5 : i / (rmSeries.length - 1);
        return {
          x: padX + t * wBox,
          y: padY + (1 - (pt.rm - minV) / span) * hBox,
          val: pt.rm,
        };
      });
      rmPointsStr = rmDots.map((d) => `${d.x},${d.y}`).join(" ");
    }
  }

  return (
    <View style={styles.sectionColumn}>
      <AnimatedCard
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <Pressable
          onPress={() => setSettingsVisible(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("settings.openLabel")}
          style={[
            styles.settingsBtn,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <GymIcon name="cog" size={19} color={colors.text} />
        </Pressable>

        <View
          style={[
            styles.avatarCircle,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <Text style={[styles.avatarInitial, { color: colors.onPrimary }]}>
              {initial}
            </Text>
          )}
        </View>

        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.username || t("header.defaultAthlete")}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user?.email || t("profile.noEmail")}
        </Text>

        <View
          style={[
            styles.rolePill,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <GymIcon
            name={user?.is_staff ? "shield" : "user"}
            size={14}
            color={colors.primary}
          />
          <Text style={[styles.rolePillText, { color: colors.primary }]}>
            {user?.is_staff
              ? t("profile.roleAdmin")
              : t("profile.roleAthlete")}
          </Text>
        </View>

        {user && isEditing ? (
          <EditProfileForm
            colors={colors}
            user={user}
            onCancel={() => setIsEditing(false)}
            onSaved={() => {
              setIsEditing(false);
              loadWeightAnd1RM(selectedExId);
            }}
          />
        ) : (
          <>
            <View style={styles.statsGrid}>
              {stats.map((s) => (
                <View
                  key={s.label}
                  style={[
                    styles.statItem,
                    {
                      backgroundColor: colors.backgroundElevated,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <GymIcon name={s.icon} size={16} color={colors.primary} />
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    {s.label}
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {s.value}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.bioBox,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t("profile.bioLabel")}
              </Text>
              <Text style={[styles.bioText, { color: colors.text }]}>
                {user?.bio?.trim() || t("profile.bioEmpty")}
              </Text>
            </View>

            <View style={styles.favoritesRow}>
              <GymIcon name="sparkles" size={14} color={colors.accent} />
              <Text
                style={[styles.favoritesText, { color: colors.textSecondary }]}
              >
                {favoritesCount === 1
                  ? t("profile.favoritesOne")
                  : t("profile.favoritesMany", { count: favoritesCount })}
              </Text>
            </View>

            <AppButton
              title={t("profile.editProfileBtn")}
              icon="edit"
              variant="secondary"
              onPress={() => setIsEditing(true)}
              style={{ width: "100%" }}
            />
          </>
        )}

        {user?.is_staff && !isEditing && (
          <View style={styles.adminPanel}>
            <Pressable
              onPress={onLoadAdminUsers}
              style={[
                styles.adminToggleBtn,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <GymIcon name="users" size={16} color={colors.primary} />
              <Text style={[styles.adminToggleText, { color: colors.primary }]}>
                {showAdminUsers
                  ? t("profile.adminHideUsers")
                  : t("profile.adminAuditUsers")}
              </Text>
            </Pressable>

            {showAdminUsers && (
              <View style={styles.usersList}>
                {adminUsers.map((u, idx) => (
                  <View
                    key={u.id ?? idx}
                    style={[
                      styles.userRow,
                      {
                        backgroundColor: colors.backgroundElevated,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.userIconBadge,
                        { backgroundColor: colors.primaryGlow },
                      ]}
                    >
                      <GymIcon
                        name={u.is_staff ? "shield" : "user"}
                        size={15}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.userItemEmail, { color: colors.text }]}
                      >
                        {u.email || u.username}
                      </Text>
                      <Text
                        style={[
                          styles.userItemStatus,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t("profile.adminStatus", {
                          status: u.status || t("profile.adminStatusActive"),
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <AppButton
          title={t("profile.logoutBtn")}
          icon="log-out"
          variant="danger"
          onPress={logout}
          style={{ width: "100%", marginTop: 12 }}
        />
      </AnimatedCard>

      <WeeklyAttendanceCard
        colors={colors}
        trainedDayFlags={trainedDayFlags}
        todayWeekIndex={todayWeekIndex}
        trainedCount={trainedCount}
      />

      {/* Tarjeta de Historial de Peso Corporal y Curva 1RM */}
      <AnimatedCard
        style={[
          styles.weightHistoryCard,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.whHeaderRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.whKickerRow}>
              <GymIcon name="trending-up" size={14} color={colors.primary} />
              <Text style={[styles.whKicker, { color: colors.primary }]}>
                {t("profile.biometricsKicker")}
              </Text>
            </View>
            <Text style={[styles.whTitle, { color: colors.text }]}>
              {t("profile.weightAnd1RMTitle")}
            </Text>
          </View>
        </View>

        {/* Registro rápido de peso corporal */}
        <View style={styles.logInputRow}>
          <View
            style={[
              styles.logInputBox,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <GymIcon name="activity" size={16} color={colors.primary} />
            <TextInput
              style={[styles.logInput, { color: colors.text }]}
              placeholder={t("profile.weightInputPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={newWeightInput}
              onChangeText={setNewWeightInput}
            />
          </View>
          <Pressable
            onPress={handleAddWeightLog}
            disabled={savingWeightLog}
            style={[styles.logAddBtn, { backgroundColor: colors.primary }]}
          >
            <GymIcon name="plus" size={16} color={colors.onPrimary} />
            <Text style={[styles.logAddBtnText, { color: colors.onPrimary }]}>
              {t("profile.registerBtn")}
            </Text>
          </Pressable>
        </View>

        {/* Filtro de ejercicio para cruzar con 1RM */}
        {exercises.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.whChipsRow}
          >
            <Pressable
              onPress={() => setSelectedExId("")}
              style={[
                styles.whChip,
                {
                  backgroundColor:
                    selectedExId === ""
                      ? colors.primary
                      : colors.backgroundElevated,
                  borderColor:
                    selectedExId === ""
                      ? colors.primaryLight
                      : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color:
                    selectedExId === ""
                      ? colors.onPrimary
                      : colors.textSecondary,
                }}
              >
                {t("profile.general1RMChip")}
              </Text>
            </Pressable>
            {exercises.map((ex) => {
              const active = selectedExId === ex.id;
              return (
                <Pressable
                  key={ex.id}
                  onPress={() => setSelectedExId(ex.id)}
                  style={[
                    styles.whChip,
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
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      color: active ? colors.onPrimary : colors.textSecondary,
                    }}
                  >
                    {ex.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Leyenda de series */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.primary }]}
            />
            <Text style={[styles.legendText, { color: colors.text }]}>
              {t("profile.legend1RM")}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: colors.textSecondary },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {t("profile.legendBodyWeight")}
            </Text>
          </View>
        </View>

        {/* Lienzo SVG combinado */}
        <View
          style={[
            styles.dualChartBox,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
          onLayout={(e) => setChartSize(e.nativeEvent.layout)}
        >
          {bwDots.length === 0 && rmDots.length === 0 ? (
            <View style={styles.emptyChartWrap}>
              <GymIcon name="activity" size={24} color={colors.textSecondary} />
              <Text
                style={[styles.emptyChartText, { color: colors.textSecondary }]}
              >
                {t("profile.emptyChartHint")}
              </Text>
            </View>
          ) : (
            chartSize && (
              <Svg width={chartSize.width} height={chartSize.height}>
                {bwDots.length > 1 && (
                  <Polyline
                    points={bwPointsStr}
                    fill="none"
                    stroke={colors.textSecondary}
                    strokeWidth={2.5}
                    strokeDasharray="5,4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {rmDots.length > 1 && (
                  <Polyline
                    points={rmPointsStr}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {bwDots.map((d, i) => (
                  <SvgCircle
                    key={`bw-${i}`}
                    cx={d.x}
                    cy={d.y}
                    r={4}
                    fill={colors.backgroundElement}
                    stroke={colors.textSecondary}
                    strokeWidth={2.5}
                  />
                ))}
                {rmDots.map((d, i) => (
                  <SvgCircle
                    key={`rm-${i}`}
                    cx={d.x}
                    cy={d.y}
                    r={5}
                    fill={colors.backgroundElement}
                    stroke={colors.primary}
                    strokeWidth={3}
                  />
                ))}
              </Svg>
            )
          )}
        </View>

        {/* Lista de registros de peso */}
        {weightLogs.length > 0 && (
          <View style={styles.logsList}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t("profile.recentWeightsTitle", { count: weightLogs.length })}
            </Text>
            {weightLogs.slice(0, 6).map((item) => (
              <View
                key={item.id}
                style={[
                  styles.logRow,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View style={styles.logLeft}>
                  <GymIcon
                    name="calendar"
                    size={13}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.logDate, { color: colors.textSecondary }]}
                  >
                    {item.date}
                  </Text>
                </View>
                <Text style={[styles.logWeightVal, { color: colors.primary }]}>
                  {Number(item.weight).toFixed(1)} kg
                </Text>
              </View>
            ))}
          </View>
        )}
      </AnimatedCard>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionColumn: {
    gap: Spacing.three,
  },
  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  settingsBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  statItem: {
    flexGrow: 1,
    flexBasis: "45%",
    alignItems: "center",
    gap: 3,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "900",
  },
  bioBox: {
    width: "100%",
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  favoritesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  favoritesText: {
    fontSize: 12,
    fontWeight: "700",
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: "900",
  },
  userName: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: "600",
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginTop: 4,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: "800",
  },
  adminPanel: {
    width: "100%",
    marginTop: 10,
    gap: 10,
  },
  adminToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  adminToggleText: {
    fontSize: 13,
    fontWeight: "800",
  },
  usersList: {
    gap: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  userIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  userItemEmail: {
    fontSize: 13,
    fontWeight: "800",
  },
  userItemStatus: {
    fontSize: 11,
    marginTop: 1,
  },
  weightHistoryCard: {
    borderRadius: Radius.xl,
    padding: Spacing.three + 2,
    borderWidth: 1,
    gap: 12,
  },
  whHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  whKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  whKicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  whTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  logInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  logInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  logInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  logAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    justifyContent: "center",
  },
  logAddBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  whChipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  whChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "700",
  },
  dualChartBox: {
    height: 175,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
  },
  emptyChartWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 6,
  },
  emptyChartText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
  logsList: {
    gap: 6,
    marginTop: 4,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  logLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logDate: {
    fontSize: 12,
    fontWeight: "700",
  },
  logWeightVal: {
    fontSize: 14,
    fontWeight: "900",
  },
});
