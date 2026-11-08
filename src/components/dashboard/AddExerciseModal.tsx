import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Equipment, MuscleGroup } from "@/services/api";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors } from "./types";

interface AddExerciseModalProps {
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

// MODAL ADMIN: AGREGAR EJERCICIO CON SELECTOR DE MÁQUINA Y GRUPO MUSCULAR
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

  const currentEquipmentObj = equipmentList.find(
    (e) => e.id === selectedEquipment,
  );

  const currentMuscleObj = muscleList.find((m) => m.id === selectedMuscle);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Ingrese nuevo ejercicio
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Nombre del Ejercicio */}
            <AppInput
              label="Nombre del Ejercicio *"
              placeholder="Ej: Press Inclinado con Mancuernas"
              value={newExName}
              onChangeText={setNewExName}
            />

            {/* Selector Desplegable de Grupo Muscular (BD) */}
            <View style={modalStyles.dropdownContainer}>
              <Text
                style={[
                  modalStyles.fieldLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Grupo Muscular Principal:
              </Text>

              <TouchableOpacity
                style={[
                  modalStyles.dropdownTrigger,
                  {
                    backgroundColor: "rgba(150, 150, 150, 0.12)",
                    borderColor: currentMuscleObj
                      ? "#10b981"
                      : muscleDropdownOpen
                        ? "#10b981"
                        : "rgba(150, 150, 150, 0.25)",
                  },
                ]}
                onPress={() => {
                  setMuscleDropdownOpen(!muscleDropdownOpen);
                  if (dropdownOpen) setDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        modalStyles.dropdownSelectedText,
                        {
                          color: currentMuscleObj
                            ? colors.text
                            : colors.textSecondary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {currentMuscleObj
                        ? currentMuscleObj.name
                        : "Selecciona el grupo muscular"}
                    </Text>
                    {currentMuscleObj && (
                      <Text
                        style={[
                          modalStyles.dropdownSubtext,
                          { color: "#10b981" },
                        ]}
                      >
                        Zona anatómica: {currentMuscleObj.body_part}
                      </Text>
                    )}
                  </View>
                </View>

                {currentMuscleObj ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedMuscle(null);
                    }}
                    style={modalStyles.clearBtn}
                  >
                    <Text style={{ color: "#e11d48", fontWeight: "bold" }}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {muscleDropdownOpen ? "▲" : "▼"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Lista desplegable de Músculos */}
              {muscleDropdownOpen && (
                <View
                  style={[
                    modalStyles.dropdownList,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: "rgba(150, 150, 150, 0.25)",
                    },
                  ]}
                >
                  <ScrollView
                    nestedScrollEnabled
                    style={{ maxHeight: 200 }}
                    showsVerticalScrollIndicator={true}
                  >
                    {muscleList.map((m) => {
                      const isSelected = selectedMuscle === m.id;
                      return (
                        <TouchableOpacity
                          key={m.id}
                          style={[
                            modalStyles.dropdownOption,
                            isSelected && modalStyles.dropdownOptionActive,
                          ]}
                          onPress={() => {
                            setSelectedMuscle(m.id);
                            setMuscleDropdownOpen(false);
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text
                              style={[
                                modalStyles.optionTitle,
                                {
                                  color: isSelected ? "#10b981" : colors.text,
                                },
                                isSelected && { fontWeight: "700" },
                              ]}
                            >
                              {m.name}
                            </Text>
                            {isSelected && (
                              <Text
                                style={{
                                  color: "#10b981",
                                  fontWeight: "800",
                                }}
                              >
                                ✓
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              modalStyles.optionSubtitle,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Zona: {m.body_part}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Selector Desplegable de Máquinas de la BD */}
            <View style={modalStyles.dropdownContainer}>
              <Text
                style={[
                  modalStyles.fieldLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Máquina / Equipamiento:
              </Text>

              <TouchableOpacity
                style={[
                  modalStyles.dropdownTrigger,
                  {
                    backgroundColor: "rgba(150, 150, 150, 0.12)",
                    borderColor: dropdownOpen
                      ? "#10b981"
                      : "rgba(150, 150, 150, 0.25)",
                  },
                ]}
                onPress={() => setDropdownOpen(!dropdownOpen)}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        modalStyles.dropdownSelectedText,
                        {
                          color: currentEquipmentObj
                            ? colors.text
                            : colors.textSecondary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {currentEquipmentObj
                        ? `${currentEquipmentObj.name} (${currentEquipmentObj.brand || "Genérica"})`
                        : "Selecciona una máquina o equipo"}
                    </Text>
                    {currentEquipmentObj && (
                      <Text
                        style={[
                          modalStyles.dropdownSubtext,
                          { color: "#10b981" },
                        ]}
                      >
                        {currentEquipmentObj.brand || "Genérica"}
                      </Text>
                    )}
                  </View>
                </View>

                {currentEquipmentObj ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedEquipment(null);
                    }}
                    style={modalStyles.clearBtn}
                  >
                    <Text style={{ color: "#e11d48", fontWeight: "bold" }}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {dropdownOpen ? "▲" : "▼"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Lista desplegable */}
              {dropdownOpen && (
                <View
                  style={[
                    modalStyles.dropdownList,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: "rgba(150, 150, 150, 0.25)",
                    },
                  ]}
                >
                  <ScrollView
                    nestedScrollEnabled
                    style={{ maxHeight: 180 }}
                    showsVerticalScrollIndicator={true}
                  >
                    {/* Opción 1: Sin máquina / Peso libre */}
                    <TouchableOpacity
                      style={[
                        modalStyles.dropdownOption,
                        selectedEquipment === null &&
                          modalStyles.dropdownOptionActive,
                      ]}
                      onPress={() => {
                        setSelectedEquipment(null);
                        setDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          modalStyles.optionTitle,
                          { color: colors.text },
                        ]}
                      >
                        🚫 Sin máquina / Peso Libre
                      </Text>
                      <Text
                        style={[
                          modalStyles.optionSubtitle,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Barras, mancuernas o peso corporal
                      </Text>
                    </TouchableOpacity>

                    {/* Opciones de la BD */}
                    {equipmentList.map((eq) => {
                      const isSelected = selectedEquipment === eq.id;
                      return (
                        <TouchableOpacity
                          key={eq.id}
                          style={[
                            modalStyles.dropdownOption,
                            isSelected && modalStyles.dropdownOptionActive,
                          ]}
                          onPress={() => {
                            setSelectedEquipment(eq.id);
                            setDropdownOpen(false);
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text
                              style={[
                                modalStyles.optionTitle,
                                { color: isSelected ? "#10b981" : colors.text },
                                isSelected && { fontWeight: "700" },
                              ]}
                            >
                              ⚙️ {eq.name}
                            </Text>
                            {isSelected && (
                              <Text
                                style={{
                                  color: "#10b981",
                                  fontWeight: "800",
                                }}
                              >
                                ✓
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              modalStyles.optionSubtitle,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Marca: {eq.brand || "Genérica"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* URL de Video */}
            <AppInput
              label="URL de Video (YouTube o MP4)"
              placeholder="https://youtu.be/..."
              value={newExVideo}
              onChangeText={setNewExVideo}
            />

            {/* Instrucciones */}
            <AppInput
              label="Instrucciones"
              placeholder="Paso a paso de ejecución..."
              value={newExInstructions}
              onChangeText={setNewExInstructions}
              multiline
            />
          </ScrollView>

          <AppButton title="Publicar Ejercicio" onPress={onSubmit} />
          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#888" }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  dropdownContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownSelectedText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dropdownSubtext: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  clearBtn: {
    padding: 6,
    marginLeft: 6,
  },
  dropdownList: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.15)",
  },
  dropdownOptionActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  optionTitle: {
    fontSize: 15,
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
