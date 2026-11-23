import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getExperienceLevelLabel,
  getTrainingGoalLabel,
  ResolvedLanguage,
  translate,
} from "@/i18n";
import {
  api,
  ApiError,
  EXPERIENCE_LEVELS,
  ExperienceLevel,
  ProfileUpdatePayload,
  TRAINING_GOALS,
  TrainingGoal,
  User,
} from "@/services/api";
import { DashboardColors } from "../types";

interface EditProfileFormProps {
  colors: DashboardColors;
  user: User;
  onCancel: () => void;
  onSaved: () => void;
}

type FieldErrors = Partial<
  Record<"username" | "current_weight" | "height" | "bio" | "general", string>
>;

const toInputValue = (v?: number | string | null) =>
  v === null || v === undefined || v === "" ? "" : String(Number(v));

const toHeightMetersInput = (v?: number | string | null) => {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "";
  const meters = n > 3 ? n / 100 : n;
  return meters.toFixed(2);
};

/**
 * Validates a decimal compatible with DecimalField(max_digits=5, decimal_places=2):
 * max 999.99. Returns the string to send, null if empty, or an error message.
 */
function parseDecimal(
  raw: string,
  label: string,
  lang: ResolvedLanguage,
): { value: string | null } | { error: string } {
  const clean = raw.trim().replace(",", ".");
  if (!clean) return { value: null };
  const num = Number(clean);
  if (!Number.isFinite(num) || num <= 0) {
    return {
      error: translate(lang, "editProfile.errorMustBePositive", { label }),
    };
  }
  if (num >= 1000) {
    return {
      error: translate(lang, "editProfile.errorMustBeLessThan1000", { label }),
    };
  }
  return { value: num.toFixed(2) };
}

/**
 * Parses height in meters (0.50 to 2.80 m).
 * If the user enters centimeters (50 to 280), it automatically normalizes it to meters.
 */
function parseHeightMeters(
  raw: string,
  label: string,
  lang: ResolvedLanguage,
): { value: string | null } | { error: string } {
  const clean = raw.trim().replace(",", ".");
  if (!clean) return { value: null };
  const num = Number(clean);
  if (!Number.isFinite(num) || num <= 0) {
    return {
      error: translate(lang, "editProfile.errorMustBePositive", { label }),
    };
  }
  const meters = num >= 50 && num <= 280 ? num / 100 : num;
  if (meters < 0.5 || meters > 2.8) {
    return {
      error: translate(lang, "editProfile.errorHeightRange", { label }),
    };
  }
  return { value: meters.toFixed(2) };
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  colors,
  user,
  onCancel,
  onSaved,
}) => {
  const { updateProfile } = useAuth();
  const { language, t } = useLanguage();
  const [username, setUsername] = useState(user.username ?? "");
  const [level, setLevel] = useState<ExperienceLevel>(
    user.experience_level ?? "beginner",
  );
  const [goal, setGoal] = useState<TrainingGoal>(
    user.training_goal ?? "hypertrophy",
  );
  const [weight, setWeight] = useState(toInputValue(user.current_weight));
  const [height, setHeight] = useState(toHeightMetersInput(user.height));
  const [bio, setBio] = useState(user.bio ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const nextErrors: FieldErrors = {};
    const w = parseDecimal(
      weight,
      t("editProfile.errorWeightSubject"),
      language,
    );
    const h = parseHeightMeters(
      height,
      t("editProfile.errorHeightSubject"),
      language,
    );
    if ("error" in w) nextErrors.current_weight = w.error;
    if ("error" in h) nextErrors.height = h.error;
    if (username.trim().length > 50) {
      nextErrors.username = t("editProfile.errorMaxUsername");
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload: ProfileUpdatePayload = {
      username: username.trim() || null,
      experience_level: level,
      training_goal: goal,
      current_weight: "value" in w ? w.value : null,
      height: "value" in h ? h.value : null,
      bio: bio.trim(),
    };

    setSaving(true);
    setErrors({});
    try {
      await updateProfile(payload);
      if (
        "value" in w &&
        w.value &&
        Number(w.value) !== Number(user.current_weight)
      ) {
        await api
          .createWeightLog(Number(w.value))
          .catch(() => undefined);
      }
      onSaved();
    } catch (err) {
      // DRF returns field-level errors: { current_weight: ["..."] }
      const data = err instanceof ApiError ? err.data : undefined;
      const fieldErr = (k: string) =>
        Array.isArray(data?.[k]) ? String(data[k][0]) : undefined;
      setErrors({
        username: fieldErr("username"),
        current_weight: fieldErr("current_weight"),
        height: fieldErr("height"),
        bio: fieldErr("bio"),
        general: (err as Error).message || t("editProfile.errorSaveFallback"),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <AppInput
        label={t("editProfile.usernameLabel")}
        leftIcon="user"
        value={username}
        onChangeText={setUsername}
        placeholder={t("editProfile.usernamePlaceholder")}
        maxLength={50}
        autoCapitalize="none"
        error={errors.username}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t("editProfile.experienceLabel")}
      </Text>
      <View style={styles.levelRow}>
        {EXPERIENCE_LEVELS.map((opt) => {
          const active = opt.value === level;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setLevel(opt.value)}
              style={[
                styles.levelChip,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.backgroundElevated,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.levelChipText,
                  { color: active ? colors.onPrimary : colors.text },
                ]}
              >
                {getExperienceLevelLabel(language, opt.value)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t("editProfile.goalLabel")}
      </Text>
      <View style={styles.goalWrap}>
        {TRAINING_GOALS.map((opt) => {
          const active = opt.value === goal;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setGoal(opt.value)}
              style={[
                styles.goalChip,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.backgroundElevated,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.levelChipText,
                  { color: active ? colors.onPrimary : colors.text },
                ]}
              >
                {getTrainingGoalLabel(language, opt.value)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <AppInput
            label={t("editProfile.weightLabel")}
            leftIcon="activity"
            value={weight}
            onChangeText={setWeight}
            placeholder="72.5"
            keyboardType="decimal-pad"
            error={errors.current_weight}
          />
        </View>
        <View style={styles.half}>
          <AppInput
            label={t("editProfile.heightLabel")}
            leftIcon="trending-up"
            value={height}
            onChangeText={setHeight}
            placeholder="1.75"
            keyboardType="decimal-pad"
            error={errors.height}
          />
        </View>
      </View>

      <AppInput
        label={t("editProfile.bioLabel")}
        value={bio}
        onChangeText={setBio}
        placeholder={t("editProfile.bioPlaceholder")}
        multiline
        style={styles.bioInput}
        error={errors.bio}
      />

      {errors.general ? (
        <Text style={[styles.generalError, { color: colors.danger }]}>
          {errors.general}
        </Text>
      ) : null}

      <View style={styles.row}>
        <AppButton
          title={t("common.cancel")}
          variant="outline"
          onPress={onCancel}
          disabled={saving}
          style={styles.half}
        />
        <AppButton
          title={t("common.save")}
          icon="check"
          onPress={handleSave}
          loading={saving}
          style={styles.half}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
    marginTop: Spacing.two,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  levelRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Spacing.three,
  },
  goalWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.three,
  },
  goalChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: "center",
  },
  levelChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: "center",
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  half: {
    flex: 1,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  generalError: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: Spacing.two,
  },
});
