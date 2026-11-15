import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { Routine } from "@/services/api";
import { DashboardColors, RoutineExerciseItem } from "../types";

export interface SelectRoutineToStartModalProps {
  visible: boolean;
  colors: DashboardColors;
  routines: Routine[];
  sessionActionLoading: boolean;
  onSelectRoutine: (routineId: string) => void;
  onClose: () => void;
  getExercisesCount?: (routine: Routine) => number;
  getExercisesOfRoutine?: (routine?: Routine) => RoutineExerciseItem[] | any[];
  onGoToCreate: () => void;
}

export const SelectRoutineToStartModal: React.FC<SelectRoutineToStartModalProps> = ({
  visible,
  colors,
  routines,
  sessionActionLoading,
  onSelectRoutine,
  onClose,
  getExercisesCount,
  getExercisesOfRoutine,
  onGoToCreate,
}) => {
  const getCount = (r: Routine): number => {
    if (getExercisesCount) return getExercisesCount(r);
    if (getExercisesOfRoutine) return getExercisesOfRoutine(r).length;
    return (r as any).exercises?.length ?? (r as any).routine_exercises?.length ?? 0;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          { backgroundColor: colors.overlay },
        ]}
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
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Elegir rutina a iniciar
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <GymIcon name="x" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {routines.length === 0 ? (
            <View style={{ gap: 12, paddingVertical: 8 }}>
              <Text
                style={[
                  styles.modalEmptyText,
                  { color: colors.textSecondary },
                ]}
              >
                Primero crea una rutina para poder iniciar una sesión.
              </Text>
              <AppButton
                title="Ir a Crear"
                icon="plus"
                onPress={() => {
                  onClose();
                  onGoToCreate();
                }}
              />
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: 320 }}
              contentContainerStyle={{ gap: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {routines.map((r, idx) => (
                <Pressable
                  key={`${r.id}-${idx}`}
                  onPress={() => onSelectRoutine(r.id)}
                  disabled={sessionActionLoading}
                  style={[
                    styles.routinePickItem,
                    {
                      backgroundColor: colors.backgroundElevated,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={[
                        styles.routinePickTitle,
                        { color: colors.text },
                      ]}
                    >
                      {r.title}
                    </Text>
                    <Text
                      style={[
                        styles.routinePickMeta,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {(r.focus || "fullbody").toUpperCase()} •{" "}
                      {getCount(r)} ejercicio(s)
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.routinePickPlay,
                      { backgroundColor: colors.primaryGlow },
                    ]}
                  >
                    <GymIcon name="play" size={14} color={colors.primary} />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
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
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  routinePickItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  routinePickTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  routinePickMeta: {
    fontSize: 11,
    fontWeight: "600",
  },
  routinePickPlay: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
