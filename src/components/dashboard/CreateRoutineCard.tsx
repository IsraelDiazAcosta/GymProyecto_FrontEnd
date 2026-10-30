import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors } from "./types";

const FOCUS_OPTIONS = [
  { value: "pecho", label: "Pecho" },
  { value: "espalda", label: "Espalda" },
  { value: "pierna", label: "Pierna" },
  { value: "hombro", label: "Hombro" },
  { value: "brazo", label: "Brazo" },
  { value: "core", label: "Core" },
  { value: "fullbody", label: "Full Body" },
];

interface CreateRoutineCardProps {
  colors: DashboardColors;
  newRoutineTitle: string;
  setNewRoutineTitle: (value: string) => void;
  newRoutineFocus: string;
  setNewRoutineFocus: (value: string) => void;
  onCreate: () => void;
}

// Card "➕ Nueva Rutina"
export const CreateRoutineCard: React.FC<CreateRoutineCardProps> = ({
  colors,
  newRoutineTitle,
  setNewRoutineTitle,
  newRoutineFocus,
  setNewRoutineFocus,
  onCreate,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        ➕ Nueva Rutina
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          marginTop: 8,
          marginBottom: 4,
          fontSize: 12,
        }}
      >
        Grupo muscular principal:
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 10 }}
      >
        {FOCUS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip,
              newRoutineFocus === option.value && styles.chipActive,
            ]}
            onPress={() => setNewRoutineFocus(option.value)}
          >
            <Text
              style={[
                styles.chipText,
                newRoutineFocus === option.value && styles.chipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.inlineRow}>
        <TextInput
          style={[styles.input, { color: colors.text, flex: 1 }]}
          placeholder="Ej: Lunes-Pecho, Pierna Pesada"
          placeholderTextColor={colors.textSecondary}
          value={newRoutineTitle}
          onChangeText={setNewRoutineTitle}
        />

        <TouchableOpacity style={styles.smallPrimaryBtn} onPress={onCreate}>
          <Text style={styles.btnTextWhite}>Crear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
