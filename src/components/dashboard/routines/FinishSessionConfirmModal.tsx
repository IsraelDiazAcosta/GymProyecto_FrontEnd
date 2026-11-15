import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { DashboardColors } from "../types";

export interface FinishSessionConfirmModalProps {
  visible: boolean;
  colors: DashboardColors;
  activeSession: { routine_title?: string; title?: string } | null;
  elapsedSeconds: number;
  sessionActionLoading: boolean;
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
  onCancel,
  onConfirm,
}) => {
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
                backgroundColor: colors.primaryGlow,
                borderColor: colors.border,
              },
            ]}
          >
            <GymIcon name="check-circle" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            ¿Finalizar sesión?
          </Text>
          <Text style={[styles.modalEmptyText, { color: colors.textSecondary }]}>
            {activeSession?.routine_title || activeSession?.title || "Rutina"} •
            Tiempo transcurrido: {formatDurationHMS(elapsedSeconds)}
          </Text>
          <View style={styles.confirmActionsRow}>
            <AppButton
              title="Seguir"
              variant="outline"
              onPress={onCancel}
              disabled={sessionActionLoading}
              style={{ flex: 1 }}
            />
            <AppButton
              title="Finalizar"
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
  confirmActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
});
