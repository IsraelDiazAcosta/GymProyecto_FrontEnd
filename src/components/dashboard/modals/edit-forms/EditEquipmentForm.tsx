import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppInput } from "@/components/ui/AppInput";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { EQUIPMENT_TYPES } from "../../equipment/AddEquipmentModal";
import { DashboardColors } from "../../types";

interface EditEquipmentFormProps {
  colors: DashboardColors;
  eqName: string;
  setEqName: (val: string) => void;
  eqType: string;
  setEqType: (val: string) => void;
  eqBrand: string;
  setEqBrand: (val: string) => void;
  eqDescription: string;
  setEqDescription: (val: string) => void;
  eqSetupGuide: string;
  setEqSetupGuide: (val: string) => void;
}

/**
 * Formulario modular para editar la información de una máquina o equipo del gimnasio.
 */
export const EditEquipmentForm: React.FC<EditEquipmentFormProps> = ({
  colors,
  eqName,
  setEqName,
  eqType,
  setEqType,
  eqBrand,
  setEqBrand,
  eqDescription,
  setEqDescription,
  eqSetupGuide,
  setEqSetupGuide,
}) => {
  return (
    <View style={styles.container}>
      <AppInput
        label="Nombre de la Máquina o Equipo"
        placeholder="Ej: Prensa Inclinada 45°"
        leftIcon="cog"
        value={eqName}
        onChangeText={setEqName}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Categoría / Tipo de Equipo
      </Text>
      <View style={styles.typesGrid}>
        {EQUIPMENT_TYPES.map((t) => {
          const isSelected = eqType === t.value;
          return (
            <Pressable
              key={t.value}
              onPress={() => setEqType(t.value)}
              style={[
                styles.typeChip,
                {
                  backgroundColor: isSelected
                    ? colors.primaryGlow
                    : colors.backgroundElevated,
                  borderColor: isSelected
                    ? colors.primary
                    : colors.borderSubtle,
                },
              ]}
            >
              <GymIcon
                name={t.icon}
                size={15}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeLabel,
                  { color: isSelected ? colors.primary : colors.text },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AppInput
        label="Marca / Fabricante"
        placeholder="Ej: Hammer Strength, Technogym..."
        leftIcon="award"
        value={eqBrand}
        onChangeText={setEqBrand}
      />

      <AppInput
        label="Descripción Breve"
        placeholder="Ej: Máquina convergente para pectoral..."
        value={eqDescription}
        onChangeText={setEqDescription}
      />

      <AppInput
        label="Guía de Ajuste / Configuración"
        placeholder="Ej: Ajustar asiento a nivel 4..."
        value={eqSetupGuide}
        onChangeText={setEqSetupGuide}
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
    marginBottom: 8,
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "800",
  },
});
