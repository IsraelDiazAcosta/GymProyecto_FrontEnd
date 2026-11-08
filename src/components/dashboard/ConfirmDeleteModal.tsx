import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DashboardColors } from "./types";

interface ConfirmDeleteModalProps {
  visible: boolean;
  colors: DashboardColors;
  itemTitle: string;
  itemType: "routine" | "exercise" | "marca" | "equipment";
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  colors,
  itemTitle,
  itemType,
  onConfirm,
  onClose,
}) => {
  const [deleting, setDeleting] = useState(false);

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
      <View style={confirmStyles.overlay}>
        <View
          style={[
            confirmStyles.card,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Icono con halo animado */}
          <View style={confirmStyles.iconHalo}>
            <Text style={{ fontSize: 36 }}>🗑️</Text>
          </View>

          <Text style={[confirmStyles.title, { color: colors.text }]}>
            ¿Eliminar de la Base de Datos?
          </Text>

          <Text
            style={[
              confirmStyles.description,
              { color: colors.textSecondary },
            ]}
          >
            Estás a punto de borrar permanentemente{" "}
            <Text style={{ fontWeight: "800", color: "#ef4444" }}>
              "{itemTitle}"
            </Text>{" "}
            de la base de datos oficial.
            {itemType === "routine"
              ? " Todos los días y ejercicios configurados en esta rutina se eliminarán."
              : itemType === "marca"
                ? " Este registro de peso y repeticiones se borrará de tu historial y progreso."
                : itemType === "equipment"
                  ? " Los ejercicios vinculados a esta máquina seguirán existiendo pero quedarán sin máquina asignada."
                  : " Esta acción no se puede deshacer."}
          </Text>

          <View style={confirmStyles.buttonsCol}>
            <TouchableOpacity
              style={[
                confirmStyles.deleteBtn,
                deleting && { opacity: 0.6 },
              ]}
              onPress={handleConfirm}
              disabled={deleting}
              activeOpacity={0.8}
            >
              <Text style={confirmStyles.deleteBtnText}>
                {deleting ? "Eliminando..." : "🗑️ Sí, Eliminar de la BD"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={confirmStyles.cancelBtn}
              onPress={onClose}
              disabled={deleting}
            >
              <Text
                style={[
                  confirmStyles.cancelBtnText,
                  { color: colors.textSecondary },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const confirmStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  iconHalo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  buttonsCol: {
    width: "100%",
    gap: 8,
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
