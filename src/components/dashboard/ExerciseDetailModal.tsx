import { AppButton } from "@/components/ui/AppButton";
import { Exercise } from "@/services/api";
import React, { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DashboardColors } from "./types";

interface ExerciseDetailModalProps {
  colors: DashboardColors;
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  colors,
  visible,
  exercise,
  onClose,
}) => {
  const [imgError, setImgError] = useState(false);

  if (!exercise) return null;

  // Resolver imagen principal si existe
  const imageUri =
    !imgError &&
    (exercise.thumbnail ||
      exercise.media?.find((m) => m.media_type === "image" || Boolean(m.thumbnail))?.thumbnail ||
      exercise.media?.find((m) => m.media_type === "image")?.file ||
      null);

  // Video URL si existe
  const videoMedia = exercise.media?.find(
    (m) => m.media_type === "video" || Boolean(m.external_url)
  );
  const videoUrl = videoMedia?.external_url || videoMedia?.file;

  const handleOpenVideo = () => {
    if (videoUrl) {
      Linking.openURL(videoUrl).catch(() => {});
    }
  };

  // Mapeo de dificultad
  const getDifficultyBadge = () => {
    switch (exercise.difficulty?.toLowerCase()) {
      case "beginner":
        return { label: "Principiante", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
      case "intermediate":
        return { label: "Intermedio", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
      case "advanced":
        return { label: "Avanzado", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" };
      default:
        return { label: "General", color: "#888", bg: "rgba(150, 150, 150, 0.15)" };
    }
  };

  const difficulty = getDifficultyBadge();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={detailStyles.overlay}>
        <View
          style={[
            detailStyles.container,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Manija superior táctil */}
          <View style={detailStyles.handleBar} />

          {/* Header con botón de cerrar */}
          <View style={detailStyles.topHeader}>
            <View style={detailStyles.badgesRow}>
              <View
                style={[
                  detailStyles.tagBadge,
                  { backgroundColor: difficulty.bg },
                ]}
              >
                <Text style={[detailStyles.tagBadgeText, { color: difficulty.color }]}>
                  ● {difficulty.label}
                </Text>
              </View>

              {Boolean(exercise.mechanics) && (
                <View
                  style={[
                    detailStyles.tagBadge,
                    { backgroundColor: "rgba(59, 130, 246, 0.15)" },
                  ]}
                >
                  <Text style={[detailStyles.tagBadgeText, { color: "#3b82f6" }]}>
                    {exercise.mechanics === "compound"
                      ? "⚡ Compuesto"
                      : "🎯 Aislamiento"}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={onClose} style={detailStyles.closeBtn}>
              <Text style={[detailStyles.closeBtnText, { color: colors.textSecondary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={detailStyles.scrollContent}
          >
            {/* Título Principal */}
            <Text style={[detailStyles.title, { color: colors.text }]}>
              {exercise.name}
            </Text>

            {/* Banner Visual / Imagen o Placeholder Hero */}
            {imageUri ? (
              <View style={detailStyles.imageBannerWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={detailStyles.imageBanner}
                  resizeMode="cover"
                  onError={() => setImgError(true)}
                />
              </View>
            ) : (
              <View
                style={[
                  detailStyles.heroPlaceholder,
                  { backgroundColor: colors.backgroundElement },
                ]}
              >
                <Text style={{ fontSize: 44 }}>🏋️‍♂️</Text>
                <Text
                  style={[
                    detailStyles.heroPlaceholderText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {exercise.equipment?.name || "Ejercicio de Catálogo"}
                </Text>
              </View>
            )}

            {/* 1. Músculos Involucrados */}
            <View style={detailStyles.sectionBox}>
              <Text
                style={[
                  detailStyles.sectionHeader,
                  { color: colors.textSecondary },
                ]}
              >
                🎯 MÚSCULOS INVOLUCRADOS
              </Text>

              <View style={detailStyles.musclesWrap}>
                {/* Músculo Principal */}
                {Boolean(exercise.primary_muscle) && (
                  <View style={detailStyles.primaryMuscleBadge}>
                    <Text style={detailStyles.primaryMuscleText}>
                      ★ {exercise.primary_muscle} (Principal)
                    </Text>
                  </View>
                )}

                {/* Lista de músculos desde relación */}
                {exercise.muscles?.map((m, idx) => (
                  <View
                    key={idx}
                    style={[
                      detailStyles.secondaryMuscleBadge,
                      { backgroundColor: colors.backgroundElement },
                    ]}
                  >
                    <Text
                      style={[
                        detailStyles.secondaryMuscleText,
                        { color: colors.text },
                      ]}
                    >
                      {m.muscle_name} ({m.body_part})
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 2. Tarjeta de Máquina / Equipamiento */}
            <View
              style={[
                detailStyles.cardBox,
                { backgroundColor: colors.backgroundElement },
              ]}
            >
              <View style={detailStyles.cardHeaderRow}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>⚙️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[detailStyles.cardTitle, { color: colors.text }]}>
                    {exercise.equipment?.name || "Sin Máquina / Peso Libre"}
                  </Text>
                  <Text
                    style={[
                      detailStyles.cardSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {exercise.equipment?.brand
                      ? `Marca: ${exercise.equipment.brand}`
                      : "Mancuernas, barras o peso corporal"}
                  </Text>
                </View>
              </View>

              {Boolean(exercise.equipment?.setup_guide) && (
                <View style={detailStyles.setupGuideBox}>
                  <Text style={detailStyles.setupGuideTitle}>
                    🔧 Guía de Ajuste de Máquina:
                  </Text>
                  <Text style={detailStyles.setupGuideText}>
                    {exercise.equipment?.setup_guide}
                  </Text>
                </View>
              )}
            </View>

            {/* 3. Instrucciones Técnicas */}
            <View style={detailStyles.sectionBox}>
              <Text
                style={[
                  detailStyles.sectionHeader,
                  { color: colors.textSecondary },
                ]}
              >
                📋 INSTRUCCIONES DE EJECUCIÓN
              </Text>
              <View
                style={[
                  detailStyles.textContainer,
                  { backgroundColor: colors.backgroundElement },
                ]}
              >
                <Text
                  style={[
                    detailStyles.instructionsText,
                    { color: colors.text },
                  ]}
                >
                  {exercise.instructions ||
                    "Realiza el movimiento controlando la fase excéntrica y manteniendo la tensión muscular adecuada."}
                </Text>
              </View>
            </View>

            {/* 4. Consejos Técnicos (Tips) */}
            {Boolean(exercise.tips) && (
              <View style={detailStyles.sectionBox}>
                <Text
                  style={[
                    detailStyles.sectionHeader,
                    { color: colors.textSecondary },
                  ]}
                >
                  💡 CONSEJOS TÉCNICOS Y ERRORES
                </Text>
                <View style={detailStyles.tipsContainer}>
                  <Text style={detailStyles.tipsText}>{exercise.tips}</Text>
                </View>
              </View>
            )}

            {/* 5. Demostración Multimedia / Video */}
            {Boolean(videoUrl) && (
              <View style={detailStyles.sectionBox}>
                <Text
                  style={[
                    detailStyles.sectionHeader,
                    { color: colors.textSecondary },
                  ]}
                >
                  🎬 DEMOSTRACIÓN EN VIDEO
                </Text>

                <TouchableOpacity
                  style={detailStyles.videoActionCard}
                  onPress={handleOpenVideo}
                  activeOpacity={0.85}
                >
                  <View style={detailStyles.playIconCircle}>
                    <Text style={{ fontSize: 18, color: "#fff" }}>▶</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={detailStyles.videoActionTitle}>
                      Ver Video Tutorial
                    </Text>
                    <Text
                      style={detailStyles.videoActionSubtitle}
                      numberOfLines={1}
                    >
                      {videoUrl}
                    </Text>
                  </View>
                  <Text style={detailStyles.arrowIcon}>›</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Botón Inferior */}
          <View style={detailStyles.footer}>
            <AppButton title="Cerrar" variant="secondary" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const detailStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    paddingTop: 10,
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(150, 150, 150, 0.3)",
    alignSelf: "center",
    marginBottom: 8,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  imageBannerWrapper: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  imageBanner: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    width: "100%",
    height: 130,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroPlaceholderText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  sectionBox: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  musclesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryMuscleBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  primaryMuscleText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryMuscleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.2)",
  },
  secondaryMuscleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cardBox: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.15)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 3,
  },
  setupGuideBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.15)",
  },
  setupGuideTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 3,
  },
  setupGuideText: {
    fontSize: 14,
    color: "#888",
    lineHeight: 18,
  },
  textContainer: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.15)",
  },
  instructionsText: {
    fontSize: 15,
    lineHeight: 22,
  },
  tipsContainer: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.25)",
  },
  tipsText: {
    color: "#d97706",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500",
  },
  videoActionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  playIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  videoActionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  videoActionSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 3,
  },
  arrowIcon: {
    color: "#10b981",
    fontSize: 22,
    fontWeight: "800",
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.15)",
  },
});
