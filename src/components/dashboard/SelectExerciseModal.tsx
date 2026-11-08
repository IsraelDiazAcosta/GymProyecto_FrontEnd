import { Exercise } from "@/services/api";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { isExerciseCompatibleWithFocus } from "./muscleValidation";
import { DashboardColors } from "./types";

interface SelectExerciseModalProps {
  visible: boolean;
  colors: DashboardColors;
  exercises: Exercise[];
  routineFocus?: string;
  selectedExerciseId: string;
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
}

// Subcomponente seguro para imagen o fallback vacío (no truena si no hay imagen)
const ExerciseThumbnail: React.FC<{
  uri?: string | null;
  size?: number;
  textColorSecondary: string;
}> = ({ uri, size = 54, textColorSecondary }) => {
  const [hasError, setHasError] = useState(false);

  const isValidUri =
    Boolean(uri) &&
    typeof uri === "string" &&
    uri.trim().length > 0 &&
    !hasError;

  if (!isValidUri) {
    return (
      <View
        style={[
          modalStyles.emptyThumbnail,
          { width: size, height: size, borderRadius: 10 },
        ]}
      >
        <Text style={{ fontSize: size * 0.42 }}>🏋️</Text>
        <Text
          style={[
            modalStyles.emptyThumbnailText,
            { color: textColorSecondary },
          ]}
          numberOfLines={1}
        >
          Sin foto
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: uri! }}
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        backgroundColor: "rgba(150, 150, 150, 0.1)",
      }}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
};

export const SelectExerciseModal: React.FC<SelectExerciseModalProps> = ({
  visible,
  colors,
  exercises,
  routineFocus,
  selectedExerciseId,
  onSelect,
  onClose,
}) => {
  const [searchText, setSearchText] = useState("");

  // Filtrado ESTRICTO por el grupo muscular de la rutina
  const filteredList = useMemo(() => {
    return exercises.filter((ex) => {
      // 1. Validación muscular estricta
      if (!isExerciseCompatibleWithFocus(ex, routineFocus)) {
        return false;
      }

      // 2. Filtro por buscador de texto si escribe algo
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const nameMatch = ex.name.toLowerCase().includes(q);
        const equipMatch = ex.equipment_name?.toLowerCase().includes(q);
        const muscleMatch = ex.primary_muscle?.toLowerCase().includes(q);
        return nameMatch || equipMatch || muscleMatch;
      }

      return true;
    });
  }, [exercises, routineFocus, searchText]);

  const focusLabel =
    routineFocus && routineFocus !== "fullbody"
      ? routineFocus.toUpperCase()
      : "CUERPO COMPLETO";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View
          style={[modalStyles.card, { backgroundColor: colors.background }]}
        >
          {/* Header */}
          <View style={modalStyles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[modalStyles.title, { color: colors.text }]}>
                Seleccionar Ejercicio
              </Text>
              <Text
                style={[
                  modalStyles.subtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Grupo muscular: <Text style={{ color: "#10b981", fontWeight: "800" }}>{focusLabel}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Text
                style={[
                  modalStyles.closeBtnText,
                  { color: colors.textSecondary },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Buscador de texto */}
          <TextInput
            style={[
              modalStyles.searchInput,
              {
                color: colors.text,
                backgroundColor: "rgba(150, 150, 150, 0.12)",
              },
            ]}
            placeholder={`🔍 Buscar ejercicio de ${focusLabel.toLowerCase()}...`}
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />

          {/* Lista de ejercicios o Pantalla Vacía amigable */}
          {filteredList.length === 0 ? (
            <View style={modalStyles.emptyStateContainer}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>📋</Text>
              <Text
                style={[modalStyles.emptyStateTitle, { color: colors.text }]}
              >
                Crea un nuevo ejercicio para este grupo muscular
              </Text>
              <Text
                style={[
                  modalStyles.emptyStateSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Actualmente no existen ejercicios registrados para{" "}
                <Text style={{ fontWeight: "700", color: "#10b981" }}>
                  {focusLabel}
                </Text>
                . Agrega uno nuevo desde el apartado de Catálogo para poder asignarlo a esta rutina.
              </Text>

              <TouchableOpacity
                style={modalStyles.closeModalBtn}
                onPress={onClose}
              >
                <Text style={modalStyles.closeModalBtnText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredList}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 6 }}
              renderItem={({ item }) => {
                const isSelected = selectedExerciseId === item.id;
                const imageUrl =
                  item.thumbnail ||
                  item.media?.[0]?.thumbnail ||
                  item.media?.[0]?.file ||
                  null;

                return (
                  <TouchableOpacity
                    style={[
                      modalStyles.itemCard,
                      {
                        backgroundColor: colors.backgroundElement,
                        borderColor: isSelected
                          ? "#10b981"
                          : "rgba(150, 150, 150, 0.15)",
                      },
                      isSelected && modalStyles.itemCardSelected,
                    ]}
                    onPress={() => {
                      onSelect(item.id);
                      onClose();
                    }}
                  >
                    {/* Imagen / Placeholder Empty */}
                    <ExerciseThumbnail
                      uri={imageUrl}
                      size={54}
                      textColorSecondary={colors.textSecondary}
                    />

                    {/* Info Central */}
                    <View style={modalStyles.itemInfo}>
                      <Text
                        style={[modalStyles.itemName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>

                      <Text
                        style={[
                          modalStyles.itemMeta,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        ⚙️ {item.equipment_name || "Sin máquina / Libre"}
                      </Text>

                      <Text
                        style={[modalStyles.itemMuscle, { color: "#10b981" }]}
                        numberOfLines={1}
                      >
                        💪{" "}
                        {item.primary_muscle ||
                          item.muscles?.[0]?.muscle_name ||
                          "General"}
                      </Text>
                    </View>

                    {/* Selector / Checkmark */}
                    <View
                      style={[
                        modalStyles.checkCircle,
                        isSelected && modalStyles.checkCircleActive,
                      ]}
                    >
                      {isSelected && (
                        <Text style={modalStyles.checkText}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* Botón de cerrar */}
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text
              style={[
                modalStyles.cancelBtnText,
                { color: colors.textSecondary },
              ]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    maxHeight: "85%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 3,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
  closeBtnText: {
    fontSize: 20,
    fontWeight: "700",
  },
  searchInput: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  itemCardSelected: {
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  emptyThumbnail: {
    backgroundColor: "rgba(150, 150, 150, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.2)",
  },
  emptyThumbnailText: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 1,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 13,
    marginBottom: 2,
  },
  itemMuscle: {
    fontSize: 13,
    fontWeight: "600",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(150, 150, 150, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircleActive: {
    borderColor: "#10b981",
    backgroundColor: "#10b981",
  },
  checkText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  emptyStateContainer: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  closeModalBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },
  closeModalBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
