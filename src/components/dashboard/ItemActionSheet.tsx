import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardColors } from "./types";

interface ItemActionSheetProps {
  visible: boolean;
  colors: DashboardColors;
  itemType: "routine" | "exercise" | "marca" | "equipment";
  itemTitle: string;
  itemSubtitle?: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ItemActionSheet: React.FC<ItemActionSheetProps> = ({
  visible,
  colors,
  itemType,
  itemTitle,
  itemSubtitle,
  onEdit,
  onDelete,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      try {
        Vibration.vibrate(50);
      } catch (e) {}
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 9,
      }).start();
    } else {
      translateY.setValue(300);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={sheetStyles.overlay}>
        <TouchableOpacity
          style={sheetStyles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            sheetStyles.sheetContainer,
            {
              backgroundColor: colors.background,
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Manija táctil */}
          <View style={sheetStyles.handle} />

          {/* Tarjeta del elemento seleccionado */}
          <View
            style={[
              sheetStyles.previewCard,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <View style={sheetStyles.previewIconBox}>
              <Text style={{ fontSize: 24 }}>
                {itemType === "routine"
                  ? "📋"
                  : itemType === "marca"
                    ? "📈"
                    : itemType === "equipment"
                      ? "⚙️"
                      : "🏋️"}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[sheetStyles.previewTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {itemTitle}
              </Text>
              {Boolean(itemSubtitle) && (
                <Text
                  style={[
                    sheetStyles.previewSubtitle,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {itemSubtitle}
                </Text>
              )}
            </View>
          </View>

          <Text
            style={[sheetStyles.sectionLabel, { color: colors.textSecondary }]}
          >
            OPCIONES
          </Text>

          {/* Botón 1: Editar */}
          <TouchableOpacity
            style={[
              sheetStyles.actionButton,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: "rgba(16, 185, 129, 0.3)",
              },
            ]}
            onPress={() => {
              onClose();
              onEdit();
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                sheetStyles.iconCircle,
                { backgroundColor: "rgba(16, 185, 129, 0.15)" },
              ]}
            >
              <Text style={{ fontSize: 18 }}>✏️</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[sheetStyles.actionTitle, { color: colors.text }]}>
                Editar en Base de Datos
              </Text>
              <Text
                style={[
                  sheetStyles.actionDesc,
                  { color: colors.textSecondary },
                ]}
              >
                {itemType === "routine"
                  ? "Modificar nombre o enfoque muscular"
                  : itemType === "marca"
                    ? "Modificar peso, repeticiones o RPE"
                    : itemType === "equipment"
                      ? "Modificar nombre, tipo, marca o ajustes"
                      : "Modificar nombre, máquina o instrucciones"}
              </Text>
            </View>
            <Text style={[sheetStyles.arrow, { color: colors.textSecondary }]}>
              ›
            </Text>
          </TouchableOpacity>

          {/* Botón 2: Eliminar */}
          <TouchableOpacity
            style={[sheetStyles.actionButton, sheetStyles.deleteButton]}
            onPress={() => {
              onClose();
              onDelete();
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                sheetStyles.iconCircle,
                { backgroundColor: "rgba(239, 68, 68, 0.15)" },
              ]}
            >
              <Text style={{ fontSize: 18 }}>🗑️</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[sheetStyles.actionTitle, { color: "#ef4444" }]}>
                Eliminar de la Base de Datos
              </Text>
              <Text
                style={[
                  sheetStyles.actionDesc,
                  { color: "rgba(239, 68, 68, 0.8)" },
                ]}
              >
                Borrar permanentemente este elemento de la BD
              </Text>
            </View>
            <Text style={[sheetStyles.arrow, { color: "#ef4444" }]}>›</Text>
          </TouchableOpacity>

          {/* Botón Cancelar */}
          <TouchableOpacity style={sheetStyles.cancelButton} onPress={onClose}>
            <Text
              style={[sheetStyles.cancelText, { color: colors.textSecondary }]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(150, 150, 150, 0.3)",
    alignSelf: "center",
    marginBottom: 12,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.15)",
  },
  previewIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(150, 150, 150, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  previewSubtitle: {
    fontSize: 14,
    marginTop: 3,
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingLeft: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  actionDesc: {
    fontSize: 13,
    marginTop: 3,
  },
  arrow: {
    fontSize: 22,
    fontWeight: "800",
    marginLeft: 6,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
