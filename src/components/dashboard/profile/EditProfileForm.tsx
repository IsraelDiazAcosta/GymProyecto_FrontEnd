import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
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

/**
 * Valida un decimal compatible con DecimalField(max_digits=5, decimal_places=2):
 * máximo 999.99. Devuelve el string a enviar, null si está vacío, o un error.
 */
function parseDecimal(
  raw: string,
  label: string,
): { value: string | null } | { error: string } {
  const clean = raw.trim().replace(",", ".");
  if (!clean) return { value: null };
  const num = Number(clean);
  if (!Number.isFinite(num) || num <= 0) {
    return { error: `${label} debe ser un número mayor a 0` };
  }
  if (num >= 1000) return { error: `${label} debe ser menor a 1000` };
  return { value: num.toFixed(2) };
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  colors,
  user,
  onCancel,
  onSaved,
}) => {
  const { updateProfile } = useAuth();
  const [username, setUsername] = useState(user.username ?? "");
  const [level, setLevel] = useState<ExperienceLevel>(
    user.experience_level ?? "beginner",
  );
  const [goal, setGoal] = useState<TrainingGoal>(
    user.training_goal ?? "hypertrophy",
  );
  const [weight, setWeight] = useState(toInputValue(user.current_weight));
  const [height, setHeight] = useState(toInputValue(user.height));
  const [bio, setBio] = useState(user.bio ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const nextErrors: FieldErrors = {};
    const w = parseDecimal(weight, "El peso");
    const h = parseDecimal(height, "La estatura");
    if ("error" in w) nextErrors.current_weight = w.error;
    if ("error" in h) nextErrors.height = h.error;
    if (username.trim().length > 50) {
      nextErrors.username = "Máximo 50 caracteres";
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
      // DRF devuelve errores por campo: { current_weight: ["..."] }
      const data = err instanceof ApiError ? err.data : undefined;
      const fieldErr = (k: string) =>
        Array.isArray(data?.[k]) ? String(data[k][0]) : undefined;
      setErrors({
        username: fieldErr("username"),
        current_weight: fieldErr("current_weight"),
        height: fieldErr("height"),
        bio: fieldErr("bio"),
        general: (err as Error).message || "No se pudo guardar el perfil",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <AppInput
        label="Nombre de usuario"
        leftIcon="user"
        value={username}
        onChangeText={setUsername}
        placeholder="Tu nombre"
        maxLength={50}
        autoCapitalize="none"
        error={errors.username}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Nivel de experiencia
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
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Objetivo de entrenamiento
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
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <AppInput
            label="Peso (kg)"
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
            label="Estatura (cm)"
            leftIcon="trending-up"
            value={height}
            onChangeText={setHeight}
            placeholder="175"
            keyboardType="decimal-pad"
            error={errors.height}
          />
        </View>
      </View>

      <AppInput
        label="Biografía / Objetivos"
        value={bio}
        onChangeText={setBio}
        placeholder="Ej: ganar fuerza en sentadilla"
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
          title="Cancelar"
          variant="outline"
          onPress={onCancel}
          disabled={saving}
          style={styles.half}
        />
        <AppButton
          title="Guardar"
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
