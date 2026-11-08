import { Exercise } from "@/services/api";
import React, { useEffect, useMemo, useState } from "react";
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
  selectedExerciseId?: string;
  selectedExerciseIds?: string[];
  multiSelect?: boolean;
  onSelect?: (exerciseId: string) => void;
  onConfirmSelection?: (selectedIds: string[]) => void;
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
  selectedExerciseIds,
  multiSelect = false,
  onSelect,
  onConfirmSelection,
  onClose,
}) => {
  const [searchText, setSearchText] = useState("");
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      if (selectedExerciseIds && selectedExerciseIds.length > 0) {
        setTempSelectedIds([...selectedExerciseIds]);
      } else if (selectedExerciseId) {
        setTempSelectedIds([selectedExerciseId]);
      } else {
        setTempSelectedIds([]);
      }
      setSearchText("");
    }
  }, [visible, selectedExerciseId, selectedExerciseIds]);

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

  const toggleSelect = (id: string) => {
    if (tempSelectedIds.includes(id)) {
      setTempSelectedIds(tempSelectedIds.filter((item) => item !== id));
    } else {
      setTempSelectedIds([...tempSelectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredList.map((e) => e.id);
    const allSelected = allFilteredIds.every((id) =>
      tempSelectedIds.includes(id),
    );
    if (allSelected) {
      setTempSelectedIds(
        tempSelectedIds.filter((id) => !allFilteredIds.includes(id)),
      );
    } else {
      const combined = Array.from(
        new Set([...tempSelectedIds, ...allFilteredIds]),
      );
      setTempSelectedIds(combined);
    }
  };

  const handleConfirm = () => {
    if (multiSelect && onConfirmSelection) {
      onConfirmSelection(tempSelectedIds);
    } else if (onSelect && tempSelectedIds.length > 0) {
      onSelect(tempSelectedIds[0]);
    }
    onClose();
  };

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
                {multiSelect
                  ? "Seleccionar Ejercicios"
                  : "Seleccionar Ejercicio"}
              </Text>
              <Text
                style={[modalStyles.subtitle, { color: colors.textSecondary }]}
              >
                Grupo muscular:{" "}
                <Text style={{ color: "#10b981", fontWeight: "800" }}>
                  {focusLabel}
                </Text>
                {multiSelect && (
                  <Text
                    style={{ color: colors.textSecondary, fontWeight: "600" }}
                  >
                    {" • "}
                    <Text style={{ color: "#10b981", fontWeight: "800" }}>
                      {tempSelectedIds.length}
                    </Text>{" "}
                    seleccionado(s)
                  </Text>
                )}
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

          {/* Buscador de texto y botón seleccionar todos */}
          <View style={{ marginBottom: 10 }}>
            <TextInput
              style={[
                modalStyles.searchInput,
                {
                  color: colors.text,
                  backgroundColor: "rgba(150, 150, 150, 0.12)",
                },
              ]}
              placeholder={`Buscar ejercicio de ${focusLabel.toLowerCase()}...`}
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />

            {multiSelect && filteredList.length > 0 && (
              <View style={modalStyles.multiSelectActions}>
                <TouchableOpacity
                  onPress={handleSelectAll}
                  style={modalStyles.selectActionBtn}
                >
                  <Text style={modalStyles.selectActionText}>
                    {filteredList.every((e) => tempSelectedIds.includes(e.id))
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </Text>
                </TouchableOpacity>

                {tempSelectedIds.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setTempSelectedIds([])}
                    style={modalStyles.selectActionBtn}
                  >
                    <Text
                      style={[
                        modalStyles.selectActionText,
                        { color: "#ef4444" },
                      ]}
                    >
                      Limpiar selección
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

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
                . Agrega uno nuevo desde el apartado de Catálogo para poder
                asignarlo a esta rutina.
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
              contentContainerStyle={{ paddingVertical: 4 }}
              renderItem={({ item }) => {
                const isSelected = multiSelect
                  ? tempSelectedIds.includes(item.id)
                  : selectedExerciseId === item.id ||
                    tempSelectedIds.includes(item.id);

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
                      if (multiSelect) {
                        toggleSelect(item.id);
                      } else {
                        onSelect?.(item.id);
                        onClose();
                      }
                    }}
                    activeOpacity={0.75}
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

          {/* Footer en modo multiselect */}
          {multiSelect && (
            <View style={modalStyles.footerRow}>
              <TouchableOpacity
                style={[
                  modalStyles.confirmMultiBtn,
                  tempSelectedIds.length === 0 && { opacity: 0.6 },
                ]}
                onPress={handleConfirm}
                disabled={tempSelectedIds.length === 0}
              >
                <Text style={modalStyles.confirmMultiBtnText}>
                  {tempSelectedIds.length > 0
                    ? `✓ Añadir Selección (${tempSelectedIds.length})`
                    : "Selecciona al menos 1"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botón de cerrar */}
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text
              style={[
                modalStyles.cancelBtnText,
                { color: colors.textSecondary },
              ]}
            ></Text>
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
    maxHeight: "88%",
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
    marginBottom: 10,
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
    paddingVertical: 10,
    fontSize: 15,
  },
  multiSelectActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  selectActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectActionText: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "700",
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
  footerRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.15)",
  },
  confirmMultiBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmMultiBtnText: {
    color: "#fff",
    fontSize: 16,
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
    marginTop: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
