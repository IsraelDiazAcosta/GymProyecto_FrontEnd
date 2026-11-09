import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { Equipment, MuscleGroup } from "@/services/api";
import { DashboardColors } from "../types";

export interface AddExerciseModalProps {
  colors: DashboardColors;
  visible: boolean;
  newExName: string;
  setNewExName: (value: string) => void;
  newExVideo: string;
  setNewExVideo: (value: string) => void;
  newExInstructions: string;
  setNewExInstructions: (value: string) => void;
  equipmentList: Equipment[];
  selectedEquipment: number | null;
  setSelectedEquipment: (id: number | null) => void;
  muscleList: MuscleGroup[];
  selectedMuscle: number | null;
  setSelectedMuscle: (id: number | null) => void;
  onSubmit: () => void;
  onClose: () => void;
}

/**
 * Modal de administración para crear un ejercicio en el catálogo con selección
 * explícita de Grupo Muscular en base de datos y Máquina vinculada.
 */
export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  colors,
  visible,
  newExName,
  setNewExName,
  newExVideo,
  setNewExVideo,
  newExInstructions,
  setNewExInstructions,
  equipmentList,
  selectedEquipment,
  setSelectedEquipment,
  muscleList,
  selectedMuscle,
  setSelectedMuscle,
  onSubmit,
  onClose,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [muscleDropdownOpen, setMuscleDropdownOpen] = useState(false);

  const selectedEquipObj = equipmentList.find(
    (eq) => eq.id === selectedEquipment,
  );
  const selectedMuscleObj = muscleList.find((m) => m.id === selectedMuscle);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Cabecera */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.kickerRow}>
                <GymIcon name="sparkles" size={13} color={colors.primary} />
                <Text style={[styles.kicker, { color: colors.primary }]}>
                  CATÁLOGO DE ADMINISTRADOR
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Nuevo Ejercicio
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.backgroundElevated },
              ]}
            >
              <GymIcon name="x" size={18} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AppInput
              label="Nombre del Ejercicio"
              placeholder="Ej: Press Banca Inclinado con Mancuernas"
              leftIcon="dumbbell"
              value={newExName}
              onChangeText={setNewExName}
            />

            {/* Selector de Grupo Muscular Principal */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Grupo Muscular Principal
            </Text>
            <Pressable
              onPress={() => setMuscleDropdownOpen((prev) => !prev)}
              style={[
                styles.dropdownButton,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: muscleDropdownOpen
                    ? colors.primary
                    : colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.dropdownLeft}>
                <View
                  style={[
                    styles.dropdownIconBox,
                    { backgroundColor: colors.primaryGlow },
                  ]}
                >
                  <GymIcon name="target" size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.dropdownMainText, { color: colors.text }]}
                  >
                    {selectedMuscleObj
                      ? selectedMuscleObj.name
                      : "Sin grupo muscular asignado"}
                  </Text>
                  <Text
                    style={[
                      styles.dropdownSubText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedMuscleObj
                      ? "Se guardará como músculo primario en la BD"
                      : "Toca para elegir un grupo muscular"}
                  </Text>
                </View>
              </View>
              <GymIcon
                name={muscleDropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.primary}
              />
            </Pressable>

            {muscleDropdownOpen && (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ScrollView
                  nestedScrollEnabled
                  style={{ maxHeight: 200 }}
                  showsVerticalScrollIndicator
                >
                  <Pressable
                    onPress={() => {
                      setSelectedMuscle(null);
                      setMuscleDropdownOpen(false);
                    }}
                    style={[
                      styles.dropdownOption,
                      { borderBottomColor: colors.borderSubtle },
                      selectedMuscle === null && {
                        backgroundColor: colors.primaryGlow,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionTitle,
                        {
                          color:
                            selectedMuscle === null
                              ? colors.primary
                              : colors.text,
                        },
                      ]}
                    >
                      Sin grupo muscular específico
                    </Text>
                    {selectedMuscle === null && (
                      <GymIcon name="check" size={16} color={colors.primary} />
                    )}
                  </Pressable>

                  {muscleList.map((muscle) => {
                    const isSelected = selectedMuscle === muscle.id;
                    return (
                      <Pressable
                        key={muscle.id}
                        onPress={() => {
                          setSelectedMuscle(muscle.id);
                          setMuscleDropdownOpen(false);
                        }}
                        style={[
                          styles.dropdownOption,
                          { borderBottomColor: colors.borderSubtle },
                          isSelected && {
                            backgroundColor: colors.primaryGlow,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionTitle,
                            {
                              color: isSelected ? colors.primary : colors.text,
                            },
                          ]}
                        >
                          {muscle.name}
                        </Text>
                        {isSelected && (
                          <GymIcon
                            name="check"
                            size={16}
                            color={colors.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Selector de Máquina */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Máquina o Equipo Asignado
            </Text>
            <Pressable
              onPress={() => setDropdownOpen((prev) => !prev)}
              style={[
                styles.dropdownButton,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: dropdownOpen
                    ? colors.primary
                    : colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.dropdownLeft}>
                <View
                  style={[
                    styles.dropdownIconBox,
                    { backgroundColor: colors.primaryGlow },
                  ]}
                >
                  <GymIcon name="cog" size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.dropdownMainText, { color: colors.text }]}
                  >
                    {selectedEquipObj
                      ? selectedEquipObj.name
                      : "Peso Libre / Sin máquina específica"}
                  </Text>
                  <Text
                    style={[
                      styles.dropdownSubText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedEquipObj
                      ? selectedEquipObj.type_display ||
                        selectedEquipObj.equipment_type
                      : "Toca para elegir una máquina del gimnasio"}
                  </Text>
                </View>
              </View>
              <GymIcon
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.primary}
              />
            </Pressable>

            {dropdownOpen && (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ScrollView
                  nestedScrollEnabled
                  style={{ maxHeight: 200 }}
                  showsVerticalScrollIndicator
                >
                  <Pressable
                    onPress={() => {
                      setSelectedEquipment(null);
                      setDropdownOpen(false);
                    }}
                    style={[
                      styles.dropdownOption,
                      { borderBottomColor: colors.borderSubtle },
                      selectedEquipment === null && {
                        backgroundColor: colors.primaryGlow,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionTitle,
                        {
                          color:
                            selectedEquipment === null
                              ? colors.primary
                              : colors.text,
                        },
                      ]}
                    >
                      Peso Libre / Sin máquina específica
                    </Text>
                    {selectedEquipment === null && (
                      <GymIcon name="check" size={16} color={colors.primary} />
                    )}
                  </Pressable>

                  {equipmentList.map((eq) => {
                    const isSelected = selectedEquipment === eq.id;
                    return (
                      <Pressable
                        key={eq.id}
                        onPress={() => {
                          setSelectedEquipment(eq.id);
                          setDropdownOpen(false);
                        }}
                        style={[
                          styles.dropdownOption,
                          { borderBottomColor: colors.borderSubtle },
                          isSelected && {
                            backgroundColor: colors.primaryGlow,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.optionTitle,
                              {
                                color: isSelected
                                  ? colors.primary
                                  : colors.text,
                              },
                            ]}
                          >
                            {eq.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: colors.textSecondary,
                            }}
                          >
                            {eq.type_display || eq.equipment_type}
                          </Text>
                        </View>
                        {isSelected && (
                          <GymIcon
                            name="check"
                            size={16}
                            color={colors.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <AppInput
              label="URL de Video Demostrativo (Opcional)"
              placeholder="https://youtube.com/watch?v=..."
              leftIcon="video"
              value={newExVideo}
              onChangeText={setNewExVideo}
            />

            <AppInput
              label="Instrucciones Técnicas (una por línea)"
              placeholder="1. Ajusta el respaldo a 30 grados..."
              value={newExInstructions}
              onChangeText={setNewExInstructions}
              multiline
            />

            <View style={styles.actionsRow}>
              <AppButton
                title="Guardar Ejercicio"
                icon="check"
                onPress={onSubmit}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "90%",
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dropdownIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownMainText: {
    fontSize: 14,
    fontWeight: "800",
  },
  dropdownSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  dropdownMenu: {
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: -8,
    marginBottom: 14,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
});
