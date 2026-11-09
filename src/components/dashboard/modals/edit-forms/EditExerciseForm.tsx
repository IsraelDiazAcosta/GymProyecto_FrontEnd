import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { Equipment, MuscleGroup } from "@/services/api";
import { DashboardColors } from "../../types";

interface EditExerciseFormProps {
  colors: DashboardColors;
  exName: string;
  setExName: (val: string) => void;
  exEquipment: number | null;
  setExEquipment: (val: number | null) => void;
  exMuscle: number | null;
  setExMuscle: (val: number | null) => void;
  exVideo: string;
  setExVideo: (val: string) => void;
  exInstructions: string;
  setExInstructions: (val: string) => void;
  equipmentList: Equipment[];
  muscleList: MuscleGroup[];
}

/**
 * Formulario modular para editar un ejercicio del catálogo (nombre, grupo muscular primario,
 * máquina vinculada, video e instrucciones).
 */
export const EditExerciseForm: React.FC<EditExerciseFormProps> = ({
  colors,
  exName,
  setExName,
  exEquipment,
  setExEquipment,
  exMuscle,
  setExMuscle,
  exVideo,
  setExVideo,
  exInstructions,
  setExInstructions,
  equipmentList,
  muscleList,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [muscleDropdownOpen, setMuscleDropdownOpen] = useState(false);

  const selectedEquipObj = equipmentList.find((eq) => eq.id === exEquipment);
  const selectedMuscleObj = muscleList.find((m) => m.id === exMuscle);

  return (
    <View style={styles.container}>
      <AppInput
        label="Nombre del Ejercicio"
        placeholder="Ej: Press Banca con Barra"
        leftIcon="dumbbell"
        value={exName}
        onChangeText={setExName}
      />

      {/* Selector de Grupo Muscular */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Grupo Muscular Principal
      </Text>
      <Pressable
        onPress={() => setMuscleDropdownOpen((prev) => !prev)}
        style={[
          styles.dropdownBtn,
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
              styles.iconBox,
              { backgroundColor: colors.primaryGlow },
            ]}
          >
            <GymIcon name="target" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.mainText, { color: colors.text }]}>
              {selectedMuscleObj
                ? selectedMuscleObj.name
                : "Sin grupo muscular específico"}
            </Text>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              Relación directa en base de datos
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
        <ScrollView
          nestedScrollEnabled
          style={[
            styles.dropdownMenu,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              setExMuscle(null);
              setMuscleDropdownOpen(false);
            }}
            style={[
              styles.dropdownOption,
              { borderBottomColor: colors.borderSubtle },
              exMuscle === null && { backgroundColor: colors.primaryGlow },
            ]}
          >
            <Text
              style={[
                styles.optionText,
                { color: exMuscle === null ? colors.primary : colors.text },
              ]}
            >
              Sin grupo muscular específico
            </Text>
            {exMuscle === null && (
              <GymIcon name="check" size={15} color={colors.primary} />
            )}
          </Pressable>

          {muscleList.map((m) => {
            const isSel = exMuscle === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => {
                  setExMuscle(m.id);
                  setMuscleDropdownOpen(false);
                }}
                style={[
                  styles.dropdownOption,
                  { borderBottomColor: colors.borderSubtle },
                  isSel && { backgroundColor: colors.primaryGlow },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isSel ? colors.primary : colors.text },
                  ]}
                >
                  {m.name}
                </Text>
                {isSel && (
                  <GymIcon name="check" size={15} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Selector de Máquina */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Máquina o Equipo Asignado
      </Text>
      <Pressable
        onPress={() => setDropdownOpen((prev) => !prev)}
        style={[
          styles.dropdownBtn,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: dropdownOpen ? colors.primary : colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.dropdownLeft}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: colors.primaryGlow },
            ]}
          >
            <GymIcon name="cog" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.mainText, { color: colors.text }]}>
              {selectedEquipObj
                ? selectedEquipObj.name
                : "Peso Libre / Sin máquina específica"}
            </Text>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              {selectedEquipObj
                ? selectedEquipObj.type_display ||
                  selectedEquipObj.equipment_type
                : "Toca para cambiar de máquina"}
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
        <ScrollView
          nestedScrollEnabled
          style={[
            styles.dropdownMenu,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              setExEquipment(null);
              setDropdownOpen(false);
            }}
            style={[
              styles.dropdownOption,
              { borderBottomColor: colors.borderSubtle },
              exEquipment === null && { backgroundColor: colors.primaryGlow },
            ]}
          >
            <Text
              style={[
                styles.optionText,
                { color: exEquipment === null ? colors.primary : colors.text },
              ]}
            >
              Peso Libre / Sin máquina específica
            </Text>
            {exEquipment === null && (
              <GymIcon name="check" size={15} color={colors.primary} />
            )}
          </Pressable>

          {equipmentList.map((eq) => {
            const isSel = exEquipment === eq.id;
            return (
              <Pressable
                key={eq.id}
                onPress={() => {
                  setExEquipment(eq.id);
                  setDropdownOpen(false);
                }}
                style={[
                  styles.dropdownOption,
                  { borderBottomColor: colors.borderSubtle },
                  isSel && { backgroundColor: colors.primaryGlow },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isSel ? colors.primary : colors.text },
                  ]}
                >
                  {eq.name}
                </Text>
                {isSel && (
                  <GymIcon name="check" size={15} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <AppInput
        label="URL del Video Demostrativo"
        placeholder="https://youtube.com/watch?v=..."
        leftIcon="video"
        value={exVideo}
        onChangeText={setExVideo}
      />

      <AppInput
        label="Instrucciones Paso a Paso (una por línea)"
        placeholder="1. Ajustar banco..."
        value={exInstructions}
        onChangeText={setExInstructions}
        multiline
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mainText: {
    fontSize: 14,
    fontWeight: "800",
  },
  subText: {
    fontSize: 11,
    marginTop: 1,
  },
  dropdownMenu: {
    maxHeight: 190,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: -6,
    marginBottom: 14,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
