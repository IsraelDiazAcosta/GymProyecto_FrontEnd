import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DashboardColors } from "./types";

export const EQUIPMENT_TYPES = [
  { value: "plate_loaded", label: "Discos / Palanca", icon: "⚙️" },
  { value: "pin_selected", label: "Placas / Pines", icon: "🔩" },
  { value: "cable", label: "Polea / Cable", icon: "🔗" },
  { value: "smith", label: "Multipower / Smith", icon: "🏗️" },
  { value: "free_weight", label: "Peso Libre / Mancuerna", icon: "🏋️" },
  { value: "bodyweight", label: "Corporal / Calistenia", icon: "🤸" },
  { value: "cardio", label: "Cardio", icon: "🏃" },
  { value: "accessory", label: "Accesorio / Banco", icon: "🪑" },
];

interface AddEquipmentModalProps {
  visible: boolean;
  colors: DashboardColors;
  onSubmit: (payload: {
    name: string;
    equipment_type: string;
    brand?: string;
    description?: string;
    setup_guide?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  visible,
  colors,
  onSubmit,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [equipmentType, setEquipmentType] = useState("plate_loaded");
  const [brand, setBrand] = useState("");
  const [setupGuide, setSetupGuide] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        equipment_type: equipmentType,
        brand: brand.trim() || undefined,
        setup_guide: setupGuide.trim() || undefined,
        description: description.trim() || undefined,
      });
      // Limpiar formulario al cerrar
      setName("");
      setEquipmentType("plate_loaded");
      setBrand("");
      setSetupGuide("");
      setDescription("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
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
                ⚙️ Nueva Máquina / Equipo
              </Text>
              <Text
                style={[
                  modalStyles.subtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Registra máquinas, pesas libres o accesorios en la BD
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

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            {/* Nombre */}
            <AppInput
              label="Nombre del Equipo o Máquina *"
              placeholder="Ej: Prensa 45°, Mancuernas 10-50kg, etc."
              value={name}
              onChangeText={setName}
            />

            {/* Selector de Tipo de Equipo */}
            <Text
              style={[
                modalStyles.fieldLabel,
                { color: colors.textSecondary },
              ]}
            >
              Tipo de Equipamiento:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}
            >
              {EQUIPMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    modalStyles.typeChip,
                    equipmentType === type.value && modalStyles.typeChipActive,
                  ]}
                  onPress={() => setEquipmentType(type.value)}
                  activeOpacity={0.7}
                >
                  <Text style={{ marginRight: 6 }}>{type.icon}</Text>
                  <Text
                    style={[
                      modalStyles.typeChipText,
                      equipmentType === type.value &&
                        modalStyles.typeChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Marca */}
            <AppInput
              label="Marca del Fabricante (Opcional)"
              placeholder="Ej: Hammer Strength, Life Fitness, Eleiko"
              value={brand}
              onChangeText={setBrand}
            />

            {/* Guía de Ajuste */}
            <AppInput
              label="Guía de Ajuste (Opcional)"
              placeholder="Ej: Regular la inclinación del respaldo a 45° y colocar perno..."
              value={setupGuide}
              onChangeText={setSetupGuide}
              multiline
            />

            {/* Descripción */}
            <AppInput
              label="Descripción o Notas Técnicas"
              placeholder="Ubicación en el gimnasio, capacidad máxima, etc."
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </ScrollView>

          {/* Botón de Guardar */}
          <AppButton
            title={saving ? "Guardando en BD..." : "✓ Guardar Máquina en BD"}
            onPress={handleSubmit}
            disabled={saving || !name.trim()}
          />

          <TouchableOpacity
            onPress={onClose}
            style={modalStyles.cancelBtn}
            disabled={saving}
          >
            <Text style={{ color: "#888", fontSize: 15, fontWeight: "600" }}>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderRadius: 22,
    padding: 20,
    maxHeight: "92%",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 4,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: "#10b981",
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  typeChipTextActive: {
    color: "#ffffff",
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
});
