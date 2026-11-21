import React, { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { DashboardColors } from "../types";

export interface ConfirmDeleteModalProps {
  visible: boolean;
  colors: DashboardColors;
  itemTitle: string;
  itemType: "routine" | "exercise" | "marca" | "equipment" | "session";
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const TYPE_NOUN: Record<ConfirmDeleteModalProps["itemType"], string> = {
  routine: "la rutina",
  exercise: "el ejercicio",
  equipment: "la máquina",
  marca: "el registro",
  session: "la sesión",
};

/**
 * Modal de confirmación de borrado con alerta vectorial y botones protegidos.
 */
export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  colors,
  itemTitle,
  itemType,
  onConfirm,
  onClose,
}) => {
  const { t } = useLanguage();
  const [deleting, setDeleting] = useState(false);

  const typeNounMap: Record<ConfirmDeleteModalProps["itemType"], string> = {
    routine: t("modals.confirmDeleteNounRoutine"),
    exercise: t("modals.confirmDeleteNounExercise"),
    equipment: t("modals.confirmDeleteNounEquipment"),
    marca: t("modals.confirmDeleteNounMarca"),
    session: t("modals.confirmDeleteNounSession"),
  };

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconHalo,
              {
                backgroundColor: colors.dangerGlow,
                borderColor: colors.danger + "45",
              },
            ]}
          >
            <GymIcon name="trash" size={30} color={colors.danger} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {t("modals.confirmDeleteTitle")}
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t("modals.confirmDeletePre", {
              noun: typeNounMap[itemType] ?? TYPE_NOUN[itemType],
            })}
            <Text style={{ fontWeight: "800", color: colors.text }}>
              "{itemTitle}"
            </Text>
            {t("modals.confirmDeletePost")}
          </Text>

          <View style={styles.actionsRow}>
            <AppButton
              title={t("common.cancel")}
              variant="outline"
              onPress={onClose}
              disabled={deleting}
              style={{ flex: 1 }}
            />
            <AppButton
              title={t("modals.confirmDeleteBtn")}
              variant="danger"
              icon="trash"
              loading={deleting}
              onPress={handleConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
  },
  iconHalo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
});
