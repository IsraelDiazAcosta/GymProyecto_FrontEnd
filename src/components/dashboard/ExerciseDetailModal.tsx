import { AppButton } from "@/components/ui/AppButton";
import { Exercise } from "@/services/api";
import React from "react";
import { Modal, ScrollView, Text, View } from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors } from "./types";

interface ExerciseDetailModalProps {
  colors: DashboardColors;
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
}

// MODAL: DETALLE DEL EJERCICIO CON VIDEO
export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  colors,
  visible,
  exercise,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {exercise?.name}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Máquina / Equipo:
            </Text>
            <Text style={[styles.modalValue, { color: colors.text }]}>
              {exercise?.equipment?.name || "Peso corporal / Sin máquina"}{" "}
              ({exercise?.equipment?.brand || "Genérica"})
            </Text>

            <Text
              style={[
                styles.modalLabel,
                { color: colors.textSecondary, marginTop: 10 },
              ]}
            >
              Instrucciones Técnicas:
            </Text>
            <Text style={[styles.modalValue, { color: colors.text }]}>
              {exercise?.instructions || "Sin instrucciones cargadas."}
            </Text>

            <Text
              style={[
                styles.modalLabel,
                { color: colors.textSecondary, marginTop: 10 },
              ]}
            >
              Demostración Multimedia:
            </Text>
            {exercise?.media && exercise.media.length > 0 ? (
              exercise.media.map((m, idx) => (
                <View key={idx} style={styles.mediaBox}>
                  <Text style={{ fontWeight: "bold", color: "#10b981" }}>
                    🎬 {m.title || "Video Demostrativo"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#0066cc", marginTop: 4 }}>
                    {m.external_url || m.file}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ fontStyle: "italic", color: "#888", marginTop: 4 }}>
                (Sin video o imagen asociada)
              </Text>
            )}
          </ScrollView>

          <AppButton
            title="Cerrar"
            variant="secondary"
            onPress={onClose}
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </Modal>
  );
};
