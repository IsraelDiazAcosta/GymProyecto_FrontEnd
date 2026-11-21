import React from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { DashboardColors } from "../types";

export interface FinishSessionConfirmModalProps {
  visible: boolean;
  colors: DashboardColors;
  activeSession: { routine_title?: string; title?: string } | null;
  elapsedSeconds: number;
  sessionActionLoading: boolean;
  missingExercises?: string[];
  onCancel: () => void;
  onConfirm: () => void;
}

const formatDurationHMS = (totalSeconds: number): string => {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const FinishSessionConfirmModal: React.FC<
  FinishSessionConfirmModalProps
> = ({
  visible,
  colors,
  activeSession,
  elapsedSeconds,
  sessionActionLoading,
  missingExercises = [],
  onCancel,
  onConfirm,
}) => {
  const { t } = useLanguage();
  const hasMissing = missingExercises.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
      >
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.confirmIconHalo,
              {
                backgroundColor: hasMissing
                  ? colors.warningGlow
                  : colors.primaryGlow,
                borderColor: hasMissing ? colors.warning : colors.border,
              },
            ]}
          >
            <GymIcon
              name={hasMissing ? "alert-triangle" : "check-circle"}
              size={28}
              color={hasMissing ? colors.warning : colors.primary}
            />
          </View>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {t("routines.finishModalTitle")}
          </Text>
          <Text style={[styles.modalEmptyText, { color: colors.textSecondary }]}>
            {t("routines.finishModalElapsed", {
              title:
                activeSession?.routine_title ||
                activeSession?.title ||
                t("common.routineFallback"),
              time: formatDurationHMS(elapsedSeconds),
            })}
          </Text>
          {hasMissing ? (
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: colors.warningGlow,
                  borderColor: colors.warning,
                },
              ]}
            >
              <View style={styles.warningHeader}>
                <GymIcon
                  name="alert-triangle"
                  size={16}
                  color={colors.warning}
                />
                <Text style={[styles.warningTitle, { color: colors.warning }]}>
                  {t("routines.finishMissingTitle")}
                </Text>
              </View>
              <ScrollView
                style={styles.warningListScroll}
                contentContainerStyle={styles.warningListContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {missingExercises.map((exerciseName, idx) => (
                  <View
                    key={`${exerciseName}-${idx}`}
                    style={styles.warningItemRow}
                  >
                    <View
                      style={[
                        styles.warningBullet,
                        { backgroundColor: colors.warning },
                      ]}
                    />
                    <Text
                      style={[styles.warningItemText, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {exerciseName}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <Text
                style={[styles.warningHint, { color: colors.textSecondary }]}
              >
                {t("routines.finishMissingHint")}
              </Text>
            </View>
          ) : null}
          <View style={styles.confirmActionsRow}>
            <AppButton
              title={t("routines.continueBtn")}
              variant="outline"
              onPress={onCancel}
              disabled={sessionActionLoading}
              style={{ flex: 1 }}
            />
            <AppButton
              title={t("routines.finishSessionBtn")}
              icon="check"
              loading={sessionActionLoading}
              onPress={onConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  confirmIconHalo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  modalEmptyText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  warningBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: "800",
    flex: 1,
  },
  warningListScroll: {
    maxHeight: 120,
  },
  warningListContent: {
    gap: 5,
    paddingVertical: 2,
  },
  warningItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  warningBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  warningItemText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  warningHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  confirmActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
});
