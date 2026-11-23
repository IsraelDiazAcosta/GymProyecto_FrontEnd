import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
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
import { useLanguage } from "@/context/LanguageContext";
import { getEquipmentTypeLabel } from "@/i18n";
import {
  Equipment,
  Exercise,
  resolveExerciseImageUrl,
  resolveMediaUrl,
} from "@/services/api";
import { DashboardColors } from "../types";

export interface ExerciseDetailModalProps {
  colors: DashboardColors;
  visible: boolean;
  exercise: Exercise | null;
  equipmentList?: Equipment[];
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
  equipmentList = [],
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const matchedEquipment: Equipment | null = useMemo(() => {
    if (!exercise) return null;
    if (typeof exercise.equipment === "object" && exercise.equipment !== null) {
      return exercise.equipment;
    }
    const eqId =
      (exercise as any).equipment_id ||
      (typeof exercise.equipment === "number" ? exercise.equipment : null);
    if (eqId && equipmentList.length > 0) {
      return equipmentList.find((e) => e.id === eqId) || null;
    }
    if (exercise.equipment_name && equipmentList.length > 0) {
      return (
        equipmentList.find(
          (e) =>
            e.name.toLowerCase() === exercise.equipment_name?.toLowerCase(),
        ) || null
      );
    }
    return null;
  }, [exercise, equipmentList]);

  if (!exercise) return null;

  const imageUri = !imgError
    ? resolveExerciseImageUrl(exercise, equipmentList)
    : null;

  const videoMedia = exercise.media?.find(
    (m) => m.media_type === "video" || Boolean(m.external_url),
  );
  const videoUrl = videoMedia?.external_url || videoMedia?.file;

  const equipmentImageUrl = matchedEquipment?.image
    ? resolveMediaUrl(matchedEquipment.image)
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
                  {t("catalog.detailKicker")}
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
              <View
                style={[
                  styles.imageWrapper,
                  { backgroundColor: colors.backgroundElevated },
                ]}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={styles.heroImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  onError={() => setImgError(true)}
                />
                {videoUrl && (
                  <Pressable
                    style={[
                      styles.videoOverlayBtn,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => Linking.openURL(videoUrl).catch(() => {})}
                  >
                    <GymIcon name="play" size={15} color={colors.onPrimary} />
                    <Text
                      style={[
                        styles.videoOverlayText,
                        { color: colors.onPrimary },
                      ]}
                    >
                      {t("catalog.watchVideoBtn")}
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
                  {t("catalog.techDemoTitle")}
                </Text>
                {videoUrl ? (
                  <Pressable
                    style={[
                      styles.videoBtnInline,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => Linking.openURL(videoUrl).catch(() => {})}
                  >
                    <GymIcon name="video" size={15} color={colors.onPrimary} />
                    <Text
                      style={[
                        styles.videoOverlayText,
                        { color: colors.onPrimary },
                      ]}
                    >
                      {t("catalog.openExternalVideoBtn")}
                    </Text>
                  </Pressable>
                ) : (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    {t("catalog.noVideoAttached")}
                  </Text>
                )}
              </View>
            )}

            {/* Tarjeta de Máquina Requerida */}
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
                  {t("catalog.requiredEquipHeader")}
                </Text>
              </View>

              {matchedEquipment ? (
                <View style={styles.equipCardContent}>
                  <View style={styles.equipCardTopRow}>
                    <View
                      style={[
                        styles.equipThumbBox,
                        {
                          backgroundColor: colors.primaryGlow,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      {equipmentImageUrl ? (
                        <Image
                          source={{ uri: equipmentImageUrl }}
                          style={styles.equipThumbImage}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                        />
                      ) : (
                        <GymIcon name="cog" size={22} color={colors.primary} />
                      )}
                    </View>

                    <View style={{ flex: 1, gap: 4 }}>
                      <Text
                        style={[styles.equipNameText, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {matchedEquipment.name}
                      </Text>
                      <View style={styles.equipMetaRow}>
                        <View
                          style={[
                            styles.equipTypeBadge,
                            {
                              backgroundColor: colors.primaryGlow,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.equipTypeBadgeText,
                              { color: colors.primary },
                            ]}
                          >
                            {getEquipmentTypeLabel(
                              language,
                              matchedEquipment.equipment_type,
                              matchedEquipment.type_display,
                            )}
                          </Text>
                        </View>
                        {Boolean(matchedEquipment.brand) && (
                          <Text
                            style={[
                              styles.equipBrandText,
                              { color: colors.textSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            • {matchedEquipment.brand}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {Boolean(matchedEquipment.setup_guide) && (
                    <View
                      style={[
                        styles.setupGuideBox,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: colors.borderSubtle,
                        },
                      ]}
                    >
                      <GymIcon name="sliders" size={12} color={colors.primary} />
                      <Text
                        style={[
                          styles.setupGuideText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t("catalog.setupPrefix", {
                          guide: matchedEquipment.setup_guide ?? "",
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noEquipRow}>
                  <View
                    style={[
                      styles.equipThumbBox,
                      {
                        backgroundColor: colors.primaryGlow,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <GymIcon name="dumbbell" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.equipNameText, { color: colors.text }]}>
                      {exercise.equipment_name ||
                        t("catalog.noMachineAssigned")}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        fontWeight: "500",
                      }}
                    >
                      {t("catalog.noFixedMachineMsg")}
                    </Text>
                  </View>
                </View>
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
                    {t("catalog.musclesWorkedHeader")}
                  </Text>
                </View>

                <View style={styles.badgesContainer}>
                  {primaryMuscles.length > 0 ? (
                    primaryMuscles.map((m, idx) => (
                      <View
                        key={m.id ?? m.muscle ?? `${m.muscle_name}-${idx}`}
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
                          {t("catalog.primaryPrefix", {
                            name: m.muscle_name ?? "",
                          })}
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
                        {t("catalog.primaryPrefix", {
                          name: exercise.primary_muscle,
                        })}
                      </Text>
                    </View>
                  ) : null}

                  {secondaryMuscles.map((m, idx) => (
                    <View
                      key={m.id ?? m.muscle ?? `${m.muscle_name}-${idx}`}
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
                        {t("catalog.secondaryPrefix", {
                          name: m.muscle_name ?? "",
                        })}
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
                    {t("catalog.generalDescHeader")}
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
                  {t("catalog.stepsHeader")}
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
                        <Text
                          style={[
                            styles.stepNumberText,
                            { color: colors.onPrimary },
                          ]}
                        >
                          {index + 1}
                        </Text>
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
                  {t("catalog.noInstructions")}
                </Text>
              )}
            </View>
          </ScrollView>

          <AppButton
            title={t("catalog.closeDetailBtn")}
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
  equipCardContent: {
    gap: 10,
    marginTop: 4,
  },
  equipCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  equipThumbBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  equipThumbImage: {
    width: "100%",
    height: "100%",
  },
  equipNameText: {
    fontSize: 15,
    fontWeight: "800",
  },
  equipMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  equipTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  equipTypeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  equipBrandText: {
    fontSize: 12,
    fontWeight: "600",
  },
  setupGuideBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  setupGuideText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  noEquipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
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
    fontSize: 12,
    fontWeight: "900",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
