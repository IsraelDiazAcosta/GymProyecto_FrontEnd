import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GymIcon, IconName } from "@/components/ui/GymIcon";
import {
  ACCENT_LIST,
  Radius,
  Spacing,
  ThemeMode,
} from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { useAppTheme } from "@/context/ThemeContext";
import { getAccentMeta, LanguageMode, TranslationKey } from "@/i18n";

export interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const MODE_OPTIONS: {
  value: ThemeMode;
  labelKey: TranslationKey;
  icon: IconName;
}[] = [
  { value: "dark", labelKey: "settings.modeDark", icon: "moon" },
  { value: "light", labelKey: "settings.modeLight", icon: "sun" },
  { value: "system", labelKey: "settings.modeSystem", icon: "smartphone" },
];

const LANGUAGE_OPTIONS: {
  value: LanguageMode;
  labelKey: TranslationKey;
}[] = [
  { value: "es", labelKey: "settings.langEs" },
  { value: "en", labelKey: "settings.langEn" },
  { value: "system", labelKey: "settings.langSystem" },
];

/**
 * Panel modal de Ajustes de la aplicación.
 * Incluye la sección Apariencia (Modo de pantalla + Color de acento) con vista previa
 * en vivo, y la sección Idioma (Español / English / Sistema).
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const {
    mode,
    resolvedMode,
    systemScheme,
    accent,
    colors,
    setMode,
    setAccent,
    resetAppearance,
  } = useAppTheme();
  const {
    languageMode,
    language,
    systemLanguage,
    t,
    setLanguageMode,
  } = useLanguage();

  const activeAccentMeta = getAccentMeta(language, accent);
  const isDefault = mode === "dark" && accent === "emerald";
  const resolvedLabel =
    resolvedMode === "dark" ? t("settings.modeDark") : t("settings.modeLight");
  const systemLabel =
    systemScheme === "dark" ? t("settings.modeDark") : t("settings.modeLight");
  const systemLangLabel =
    systemLanguage === "en" ? t("settings.langEn") : t("settings.langEs");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <Pressable
          style={styles.backdropDismiss}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("settings.closeLabel")}
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom + 16, 24),
            },
          ]}
        >
          <View
            style={[styles.handleBar, { backgroundColor: colors.handleBar }]}
          />

          {/* Cabecera */}
          <View
            style={[
              styles.headerRow,
              { borderBottomColor: colors.borderSubtle },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.kickerRow}>
                <GymIcon name="cog" size={13} color={colors.primary} />
                <Text style={[styles.kicker, { color: colors.primary }]}>
                  {t("settings.kicker")}
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {t("settings.title")}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("common.close")}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <GymIcon name="x" size={18} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ==================== SECCIÓN 1: APARIENCIA ==================== */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIconBadge,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <GymIcon name="palette" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("settings.appearanceTitle")}
                  </Text>
                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t("settings.appearanceSubtitle")}
                  </Text>
                </View>
              </View>

              {/* Vista previa en vivo */}
              <View
                style={[
                  styles.previewStage,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View
                  style={[
                    styles.previewMiniCard,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <View style={styles.previewCardLeft}>
                    <View
                      style={[
                        styles.previewBadge,
                        {
                          backgroundColor: colors.primaryGlow,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <GymIcon
                        name="dumbbell"
                        size={12}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.previewBadgeText,
                          { color: colors.primary },
                        ]}
                      >
                        APEX GYM
                      </Text>
                    </View>
                    <Text
                      style={[styles.previewTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {t("settings.livePreviewTitle")}
                    </Text>
                    <Text
                      style={[
                        styles.previewMeta,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {resolvedLabel} · {activeAccentMeta.name}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.previewActionPill,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <GymIcon
                      name="check"
                      size={13}
                      color={colors.onPrimary}
                    />
                    <Text
                      style={[
                        styles.previewActionText,
                        { color: colors.onPrimary },
                      ]}
                    >
                      {t("settings.previewActive")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Control A: Modo de pantalla */}
              <Text
                style={[styles.controlLabel, { color: colors.textSecondary }]}
              >
                {t("settings.screenModeLabel")}
              </Text>
              <View style={styles.modeSegmentedRow}>
                {MODE_OPTIONS.map((opt) => {
                  const active = mode === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setMode(opt.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={[
                        styles.modeSegmentBtn,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : colors.backgroundElevated,
                          borderColor: active
                            ? colors.primaryLight
                            : colors.borderSubtle,
                        },
                      ]}
                    >
                      <GymIcon
                        name={opt.icon}
                        size={16}
                        color={active ? colors.onPrimary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.modeSegmentLabel,
                          {
                            color: active ? colors.onPrimary : colors.text,
                          },
                        ]}
                      >
                        {t(opt.labelKey)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {mode === "system" && (
                <View
                  style={[
                    styles.systemHintBox,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <GymIcon
                    name="smartphone"
                    size={13}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.systemHintText, { color: colors.primary }]}
                  >
                    {t("settings.systemModeHint", { mode: systemLabel })}
                  </Text>
                </View>
              )}

              {/* Control B: Color de acento */}
              <Text
                style={[
                  styles.controlLabel,
                  { color: colors.textSecondary, marginTop: 6 },
                ]}
              >
                {t("settings.accentLabel")}
              </Text>
              <View style={styles.accentList}>
                {ACCENT_LIST.map((item) => {
                  const isActive = accent === item.id;
                  const swatchColor =
                    resolvedMode === "dark" ? item.swatchDark : item.swatchLight;
                  const accentMeta = getAccentMeta(language, item.id);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setAccent(item.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      style={[
                        styles.accentRow,
                        {
                          backgroundColor: isActive
                            ? colors.primaryGlow
                            : colors.backgroundElevated,
                          borderColor: isActive
                            ? colors.primary
                            : colors.borderSubtle,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.swatchCircle,
                          {
                            backgroundColor: swatchColor,
                            borderColor: colors.borderSubtle,
                          },
                        ]}
                      />
                      <View style={styles.accentTextCol}>
                        <Text
                          style={[styles.accentName, { color: colors.text }]}
                        >
                          {accentMeta.name}
                        </Text>
                        <Text
                          style={[
                            styles.accentDesc,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {accentMeta.description}
                        </Text>
                      </View>
                      {isActive && (
                        <View
                          style={[
                            styles.checkBadge,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <GymIcon
                            name="check"
                            size={14}
                            color={colors.onPrimary}
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {!isDefault && (
                <Pressable
                  onPress={resetAppearance}
                  style={[
                    styles.resetBtn,
                    {
                      backgroundColor: colors.backgroundElevated,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.resetBtnText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t("settings.resetAppearance")}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* ==================== SECCIÓN 2: IDIOMA ==================== */}
            <View
              style={[
                styles.sectionBlock,
                {
                  borderTopColor: colors.borderSubtle,
                  borderTopWidth: 1,
                  paddingTop: Spacing.three,
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIconBadge,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <GymIcon name="globe" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("settings.languageTitle")}
                  </Text>
                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t("settings.languageSubtitle")}
                  </Text>
                </View>
              </View>

              <View style={styles.modeSegmentedRow}>
                {LANGUAGE_OPTIONS.map((opt) => {
                  const active = languageMode === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setLanguageMode(opt.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={[
                        styles.modeSegmentBtn,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : colors.backgroundElevated,
                          borderColor: active
                            ? colors.primaryLight
                            : colors.borderSubtle,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeSegmentLabel,
                          {
                            color: active ? colors.onPrimary : colors.text,
                          },
                        ]}
                      >
                        {t(opt.labelKey)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {languageMode === "system" && (
                <View
                  style={[
                    styles.systemHintBox,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <GymIcon name="globe" size={13} color={colors.primary} />
                  <Text
                    style={[styles.systemHintText, { color: colors.primary }]}
                  >
                    {t("settings.languageSystemHint", {
                      lang: systemLangLabel,
                    })}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
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
  backdropDismiss: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.three + 4,
    paddingTop: 12,
    maxHeight: "90%",
    borderWidth: 1,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: 8,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
  previewStage: {
    padding: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  previewMiniCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  previewCardLeft: {
    flex: 1,
    gap: 3,
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginBottom: 2,
  },
  previewBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  previewMeta: {
    fontSize: 11,
    fontWeight: "600",
  },
  previewActionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  previewActionText: {
    fontSize: 11,
    fontWeight: "800",
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 2,
  },
  modeSegmentedRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeSegmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  modeSegmentLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  systemHintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  systemHintText: {
    fontSize: 12,
    fontWeight: "700",
  },
  accentList: {
    gap: 8,
  },
  accentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  swatchCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
  },
  accentTextCol: {
    flex: 1,
    gap: 1,
  },
  accentName: {
    fontSize: 14,
    fontWeight: "800",
  },
  accentDesc: {
    fontSize: 11,
    fontWeight: "600",
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: 2,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: Radius.lg,
    borderWidth: 1,
    opacity: 0.75,
  },
  languageIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  languageTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  languageSub: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },
  comingSoonPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
