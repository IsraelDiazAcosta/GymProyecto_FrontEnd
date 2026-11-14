import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GymIcon, IconName } from "@/components/ui/GymIcon";
import { Palette, Radius } from "@/constants/theme";
import { DashboardColors } from "../types";

export interface ItemActionSheetProps {
  visible: boolean;
  colors: DashboardColors;
  itemType: "routine" | "exercise" | "marca" | "equipment";
  itemTitle: string;
  itemSubtitle?: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const TYPE_META: Record<
  ItemActionSheetProps["itemType"],
  { label: string; icon: IconName }
> = {
  routine: { label: "OPCIONES DE RUTINA", icon: "layers" },
  exercise: { label: "OPCIONES DE EJERCICIO", icon: "dumbbell" },
  marca: { label: "OPCIONES DE MARCA", icon: "trending-up" },
  equipment: { label: "OPCIONES DE MÁQUINA", icon: "cog" },
};

/**
 * Hoja de acciones táctil (Bottom Sheet) con iconos vectoriales y animación elástica.
 */
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
        Vibration.vibrate(45);
      } catch {}
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 9,
      }).start();
    } else {
      translateY.setValue(300);
    }
  }, [visible, translateY]);

  const meta = TYPE_META[itemType];

  const getEditSubtitle = () => {
    switch (itemType) {
      case "routine":
        return "Modificar nombre, enfoque o ejercicios asignados";
      case "exercise":
        return "Cambiar nombre, grupo muscular, máquina o técnica";
      case "equipment":
        return "Modificar nombre, categoría, marca o guía de ajuste";
      default:
        return "Corregir peso levantado, repeticiones o RPE";
    }
  };

  const getDeleteTitle = () => {
    switch (itemType) {
      case "routine":
        return "Eliminar rutina";
      case "exercise":
        return "Eliminar ejercicio";
      case "equipment":
        return "Eliminar máquina";
      default:
        return "Eliminar marca";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom + 20, 32),
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handleBar} />

          {/* Cabecera */}
          <View
            style={[
              styles.headerBox,
              { borderBottomColor: colors.borderSubtle },
            ]}
          >
            <View
              style={[
                styles.typeIconBox,
                {
                  backgroundColor: colors.primaryGlow,
                  borderColor: colors.border,
                },
              ]}
            >
              <GymIcon name={meta.icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.typeBadge, { color: colors.primary }]}>
                {meta.label}
              </Text>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={1}
              >
                {itemTitle}
              </Text>
              {Boolean(itemSubtitle) && (
                <Text
                  style={[styles.subtitle, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {itemSubtitle}
                </Text>
              )}
            </View>
          </View>

          {/* Opciones */}
          <View style={styles.optionsList}>
            <Pressable
              style={[
                styles.optionBtn,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
              onPress={() => {
                onClose();
                setTimeout(onEdit, 180);
              }}
            >
              <View
                style={[
                  styles.optionIconCircle,
                  { backgroundColor: colors.primaryGlow },
                ]}
              >
                <GymIcon name="edit" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Editar información
                </Text>
                <Text
                  style={[
                    styles.optionSub,
                    { color: colors.textSecondary },
                  ]}
                >
                  {getEditSubtitle()}
                </Text>
              </View>
              <GymIcon
                name="chevron-right"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>

            <Pressable
              style={[
                styles.optionBtn,
                {
                  backgroundColor: colors.dangerGlow,
                  borderColor: colors.danger + "40",
                },
              ]}
              onPress={() => {
                onClose();
                setTimeout(onDelete, 180);
              }}
            >
              <View
                style={[
                  styles.optionIconCircle,
                  { backgroundColor: colors.danger + "25" },
                ]}
              >
                <GymIcon name="trash" size={18} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: colors.danger }]}>
                  {getDeleteTitle()}
                </Text>
                <Text
                  style={[
                    styles.optionSub,
                    { color: colors.textSecondary },
                  ]}
                >
                  Borrar permanentemente de la base de datos
                </Text>
              </View>
              <GymIcon
                name="chevron-right"
                size={18}
                color={colors.danger}
              />
            </Pressable>
          </View>

          <Pressable
            onPress={onClose}
            style={[
              styles.cancelBtn,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.cancelText, { color: colors.text }]}>
              Cancelar
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderWidth: 1,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.lilacBorder,
    alignSelf: "center",
    marginBottom: 14,
  },
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
  },
  typeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  optionsList: {
    gap: 10,
    marginBottom: 14,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 12,
  },
  optionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  optionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "800",
  },
});
