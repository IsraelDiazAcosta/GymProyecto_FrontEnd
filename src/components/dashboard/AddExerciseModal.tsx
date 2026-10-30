import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
  onSubmit: () => void;
  onClose: () => void;
}

// MODAL ADMIN: AGREGAR EJERCICIO
export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  colors,
  visible,
  newExName,
  setNewExName,
  newExVideo,
  setNewExVideo,
  newExInstructions,
  setNewExInstructions,
  onSubmit,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            ➕ Nuevo Ejercicio (Admin)
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <AppInput
              label="Nombre del Ejercicio"
              placeholder="Ej: Press Inclinado con Mancuernas"
              value={newExName}
              onChangeText={setNewExName}
            />

            <AppInput
              label="URL de Video (YouTube o MP4)"
              placeholder="https://youtu.be/..."
              value={newExVideo}
              onChangeText={setNewExVideo}
            />

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
