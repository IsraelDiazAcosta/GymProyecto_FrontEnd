import React, { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { Exercise } from "@/services/api";
import { DashboardColors } from "../types";

export interface ExerciseDetailModalProps {
  colors: DashboardColors;
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
}

/**
 * Ficha técnica detallada de un ejercicio con anatomía muscular, equipo vinculado,
 * enlace a video demostrativo e instrucciones paso a paso.
 */
export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  colors,
  visible,
  exercise,
  onClose,
}) => {
  const [imgError, setImgError] = useState(false);

  if (!exercise) return null;

  const imageUri =
    !imgError &&
    (exercise.thumbnail ||
      exercise.media?.find(
        (m) => m.media_type === "image" || Boolean(m.thumbnail),
      )?.thumbnail ||
      exercise.media?.find((m) => m.media_type === "image")?.file ||
      null);

  const videoMedia = exercise.media?.find(
    (m) => m.media_type === "video" || Boolean(m.external_url),
  );
  const videoUrl = videoMedia?.external_url || videoMedia?.file;

  const equipmentLabel =
    typeof exercise.equipment === "object" && exercise.equipment !== null
      ? exercise.equipment.name
      : exercise.equipment_name || "Peso Libre / Sin máquina específica";

  const equipmentType =
    typeof exercise.equipment === "object" && exercise.equipment !== null
      ? exercise.equipment.type_display || exercise.equipment.equipment_type
      : null;

  const primaryMuscles =
    exercise.muscles?.filter((m) => m.role === "primary") || [];
  const secondaryMuscles =
    exercise.muscles?.filter((m) => m.role === "secondary") || [];

  const instructionsList: string[] = Array.isArray(exercise.instructions)
    ? exercise.instructions
    : typeof exercise.instructions === "string" &&
        exercise.instructions.trim() !== ""
      ? [exercise.instructions]
      : [];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Cabecera */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.kickerRow}>
                <GymIcon name="dumbbell" size={13} color={colors.primary} />
                <Text style={[styles.kicker, { color: colors.primary }]}>
                  FICHA TÉCNICA DEL EJERCICIO
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {exercise.name}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.backgroundElevated },
              ]}
            >
              <GymIcon name="x" size={18} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Vista previa multimedia */}
            {imageUri ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.heroImage}
                  resizeMode="cover"
                  onError={() => setImgError(true)}
                />
                {videoUrl && (
                  <Pressable
                    style={[
                      styles.videoOverlayBtn,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => Linking.openURL(videoUrl)}
                  >
                    <GymIcon name="play" size={15} color="#FFFFFF" />
                    <Text style={styles.videoOverlayText}>
                      Ver Video Demostrativo
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View
                style={[
                  styles.placeholderHero,
                  {
                    backgroundColor: colors.primaryGlow,
                    borderColor: colors.border,
                  },
                ]}
              >
                <GymIcon name="dumbbell" size={38} color={colors.primary} />
                <Text
                  style={[styles.placeholderTitle, { color: colors.text }]}
                >
                  Demostración Técnica
                </Text>
                {videoUrl ? (
                  <Pressable
                    style={[
                      styles.videoBtnInline,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => Linking.openURL(videoUrl)}
                  >
                    <GymIcon name="video" size={15} color="#FFFFFF" />
                    <Text style={styles.videoOverlayText}>
                      Abrir Video Externo
                    </Text>
                  </Pressable>
                ) : (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    Sin video adjunto
                  </Text>
                )}
              </View>
            )}

            {/* Tarjeta de Máquina */}
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.infoHeaderRow}>
                <GymIcon name="cog" size={15} color={colors.primary} />
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  EQUIPO / MÁQUINA REQUERIDA
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {equipmentLabel}
              </Text>
              {equipmentType && (
                <Text style={[styles.infoSub, { color: colors.primary }]}>
                  Categoría: {equipmentType}
                </Text>
              )}
            </View>

            {/* Músculos trabajados */}
            {(primaryMuscles.length > 0 ||
              secondaryMuscles.length > 0 ||
              exercise.primary_muscle) && (
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View style={styles.infoHeaderRow}>
                  <GymIcon name="target" size={15} color={colors.primary} />
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    MÚSCULOS TRABAJADOS
                  </Text>
                </View>

                <View style={styles.badgesContainer}>
                  {primaryMuscles.length > 0 ? (
                    primaryMuscles.map((m) => (
                      <View
                        key={m.id}
                        style={[
                          styles.primaryMuscleBadge,
                          {
                            backgroundColor: colors.primaryGlow,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.primaryMuscleText,
                            { color: colors.primary },
                          ]}
                        >
                          Principal: {m.muscle_name}
                        </Text>
                      </View>
                    ))
                  ) : exercise.primary_muscle ? (
                    <View
                      style={[
                        styles.primaryMuscleBadge,
                        {
                          backgroundColor: colors.primaryGlow,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.primaryMuscleText,
                          { color: colors.primary },
                        ]}
                      >
                        Principal: {exercise.primary_muscle}
                      </Text>
                    </View>
                  ) : null}

                  {secondaryMuscles.map((m) => (
                    <View
                      key={m.id}
                      style={[
                        styles.secondaryMuscleBadge,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: colors.borderSubtle,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.secondaryMuscleText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Secundario: {m.muscle_name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Descripción */}
            {Boolean(exercise.description) && (
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View style={styles.infoHeaderRow}>
                  <GymIcon name="info" size={15} color={colors.primary} />
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    DESCRIPCIÓN GENERAL
                  </Text>
                </View>
                <Text
                  style={[styles.descriptionText, { color: colors.text }]}
                >
                  {exercise.description}
                </Text>
              </View>
            )}

            {/* Instrucciones paso a paso */}
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.infoHeaderRow}>
                <GymIcon name="check-circle" size={15} color={colors.primary} />
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  TÉCNICA E INSTRUCCIONES PASO A PASO
                </Text>
              </View>

              {instructionsList.length > 0 ? (
                <View style={styles.stepsList}>
                  {instructionsList.map((step, index) => (
                    <View key={index} style={styles.stepRow}>
                      <View
                        style={[
                          styles.stepNumberBadge,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.stepText, { color: colors.text }]}>
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontStyle: "italic",
                    fontSize: 13,
                  }}
                >
                  No se han registrado instrucciones específicas para este
                  ejercicio.
                </Text>
              )}
            </View>
          </ScrollView>

          <AppButton
            title="Cerrar Ficha"
            icon="check"
            onPress={onClose}
            style={{ marginTop: 10 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "88%",
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 3,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 10,
  },
  imageWrapper: {
    width: "100%",
    height: 190,
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: "#111",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  videoOverlayBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  videoOverlayText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  placeholderHero: {
    width: "100%",
    paddingVertical: 24,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  videoBtnInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.pill,
  },
  infoBox: {
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 6,
  },
  infoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  infoSub: {
    fontSize: 12,
    fontWeight: "700",
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  primaryMuscleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  primaryMuscleText: {
    fontSize: 12,
    fontWeight: "800",
  },
  secondaryMuscleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  secondaryMuscleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepsList: {
    gap: 10,
    marginTop: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
