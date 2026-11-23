import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GymIcon } from "@/components/ui/GymIcon";
import { Radius, Spacing } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { WEEK_DAYS_BY_LANG } from "@/i18n";
import { DashboardColors } from "../types";

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export interface WeeklyAttendanceCardProps {
  colors: DashboardColors;
  trainedDayFlags: number[];
  todayWeekIndex: number;
  trainedCount: number;
}

export const WeeklyAttendanceCard: React.FC<WeeklyAttendanceCardProps> = ({
  colors,
  trainedDayFlags,
  todayWeekIndex,
  trainedCount,
}) => {
  const { language, t } = useLanguage();
  const weekDays = WEEK_DAYS_BY_LANG[language] || WEEK_DAYS;

  return (
    <View
      style={[
        styles.weeklyCard,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.weeklyHeaderRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.weeklyKickerRow}>
            <GymIcon name="calendar" size={14} color={colors.primary} />
            <Text style={[styles.weeklyKicker, { color: colors.primary }]}>
              {t("routines.weeklyKicker")}
            </Text>
          </View>
          <Text style={[styles.weeklyTitle, { color: colors.text }]}>
            {t("routines.weeklyTitle")}
          </Text>
        </View>

        <View
          style={[
            styles.weeklyCountBadge,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.weeklyCountText, { color: colors.primary }]}>
            {t("routines.weeklyDaysCount", { count: trainedCount })}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.weeklyChartBox,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.weeklyBarsRow}>
          {weekDays.map((dayLabel, idx) => {
            const val = trainedDayFlags[idx] || 0;
            const isTrained = val === 1;
            const isToday = idx === todayWeekIndex;
            return (
              <View key={`${idx}-${dayLabel}`} style={styles.weeklyBarCol}>
                <Text
                  style={[
                    styles.weeklyBarValue,
                    {
                      color: isTrained
                        ? colors.primary
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {val}
                </Text>
                <View
                  style={[
                    styles.weeklyBarTrack,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: isToday
                        ? colors.primary
                        : colors.borderSubtle,
                      borderWidth: isToday ? 1.5 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.weeklyBarFill,
                      {
                        height: isTrained ? "100%" : "0%",
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.weeklyDayLabel,
                    {
                      color: isToday
                        ? colors.primary
                        : isTrained
                          ? colors.text
                          : colors.textSecondary,
                      fontWeight: isToday ? "900" : "700",
                    },
                  ]}
                >
                  {dayLabel}
                </Text>
                {isToday ? (
                  <View
                    style={[
                      styles.todayPill,
                      { backgroundColor: colors.primaryGlow },
                    ]}
                  >
                    <Text
                      style={[
                        styles.todayPillText,
                        { color: colors.primary },
                      ]}
                    >
                      {t("routines.todayTag")}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.todayPlaceholder} />
                )}
              </View>
            );
          })}
        </View>

        {trainedCount === 0 && (
          <Text
            style={[
              styles.weeklyEmptyText,
              { color: colors.textSecondary },
            ]}
          >
            {t("routines.weeklyEmptyHint")}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weeklyCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    gap: 12,
  },
  weeklyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weeklyKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  weeklyKicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  weeklyTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  weeklyCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  weeklyCountText: {
    fontSize: 12,
    fontWeight: "900",
  },
  weeklyChartBox: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
  },
  weeklyBarsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  weeklyBarCol: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  weeklyBarValue: {
    fontSize: 10,
    fontWeight: "800",
  },
  weeklyBarTrack: {
    width: 14,
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  weeklyBarFill: {
    width: "100%",
    borderRadius: 6,
  },
  weeklyDayLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  todayPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    marginTop: 2,
  },
  todayPillText: {
    fontSize: 9,
    fontWeight: "900",
  },
  todayPlaceholder: {
    height: 16,
    marginTop: 2,
  },
  weeklyEmptyText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
});
