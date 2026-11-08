import { Exercise, Routine } from "@/services/api";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { styles } from "./dashboardStyles";
import { isExerciseCompatibleWithFocus } from "./muscleValidation";
import { SelectExerciseModal } from "./SelectExerciseModal";
import { DashboardColors, RoutineExerciseItem } from "./types";

interface RoutineCardProps {
  colors: DashboardColors;
  routine: Routine;
  routineExercises: RoutineExerciseItem[];
  exercises: Exercise[];
  isAdding: boolean;
  selectedExToAdd: string;
  setSelectedExToAdd: (id: string) => void;
  selectedExsToAdd?: string[];
  setSelectedExsToAdd?: (ids: string[]) => void;
  setsCount: string;
  setSetsCount: (value: string) => void;
  minReps: string;
  setMinReps: (value: string) => void;
  maxReps: string;
  setMaxReps: (value: string) => void;
  onStartAdding: () => void;
  onCancelAdding: () => void;
  onAddExercise: () => void;
  onOptionsPress?: () => void;
}

// Mini componente seguro para mostrar la miniatura o placeholder vacío
const ExerciseThumbPreview: React.FC<{
  uri?: string | null;
  textColorSecondary: string;
}> = ({ uri, textColorSecondary }) => {
  const [hasError, setHasError] = useState(false);

  const isValid =
    Boolean(uri) &&
    typeof uri === "string" &&
    uri.trim().length > 0 &&
    !hasError;

  if (!isValid) {
    return (
      <View style={cardStyles.emptyThumb}>
        <Text style={{ fontSize: 22 }}>🏋️</Text>
        <Text
          style={[cardStyles.emptyThumbText, { color: textColorSecondary }]}
        >
          Sin foto
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: uri! }}
      style={cardStyles.thumbImage}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
};

export const RoutineCard: React.FC<RoutineCardProps> = ({
  colors,
  routine,
  routineExercises,
  exercises,
  isAdding,
  selectedExToAdd,
  setSelectedExToAdd,
  selectedExsToAdd,
  setSelectedExsToAdd,
  setsCount,
  setSetsCount,
  minReps,
  setMinReps,
  maxReps,
  setMaxReps,
  onStartAdding,
  onCancelAdding,
  onAddExercise,
  onOptionsPress,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar estrictamente ejercicios compatibles con el enfoque de esta rutina
  const compatibleExercises = exercises.filter((ex) =>
    isExerciseCompatibleWithFocus(ex, routine.focus)
  );

  const currentSelectedIds =
    selectedExsToAdd !== undefined
      ? selectedExsToAdd
      : selectedExToAdd
      ? [selectedExToAdd]
      : [];

  const selectedExercisesList = exercises.filter(
    (ex) =>
      currentSelectedIds.includes(ex.id) &&
      isExerciseCompatibleWithFocus(ex, routine.focus)
  );

  const selectedExercise =
    selectedExercisesList.length === 1 ? selectedExercisesList[0] : null;

  const handleStartAddingWithModal = () => {
    onStartAdding();
    setIsModalOpen(true);
  };

  const focusLabel =
    routine.focus && routine.focus !== "fullbody"
      ? routine.focus.toUpperCase()
      : "CUERPO COMPLETO";

  const handleTriggerOptions = () => {
    try {
      Vibration.vibrate(50);
    } catch (e) {}
    onOptionsPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.backgroundElement }]}
      onLongPress={handleTriggerOptions}
      activeOpacity={0.92}
      delayLongPress={350}
    >
      {/* Encabezado de la rutina */}
      <View style={styles.routineHeader}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={[styles.routineTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
            📋 {routine.title}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {routine.focus && (
              <View style={cardStyles.focusBadge}>
                <Text style={cardStyles.focusBadgeText}>{focusLabel}</Text>
              </View>
            )}

            {/* Select / Menú de opciones de lado derecho */}
            <TouchableOpacity
              style={cardStyles.optionsBtn}
              onPress={handleTriggerOptions}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={[
                  cardStyles.optionsBtnText,
                  { color: colors.textSecondary },
                ]}
              >
                ⋮
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.routineSubtitle, { color: colors.textSecondary }]}>
          {routineExercises.length} ejercicio(s) programados
        </Text>
      </View>

      {/* Lista de ejercicios ya asignados a esta rutina */}
      {routineExercises.length > 0 ? (
        routineExercises.map((ex, idx) => (
          <View key={idx} style={styles.exerciseBadge}>
            <Text style={styles.exerciseBadgeText}>✓ {ex.name}</Text>
          </View>
        ))
      ) : (
        <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
          (Aún no has agregado ejercicios a esta rutina)
        </Text>
      )}

      {/* Formulario / Modal para agregar ejercicio */}
      {isAdding ? (
        <View style={cardStyles.addingContainer}>
          {compatibleExercises.length === 0 ? (
            /* Pantalla vacía cuando no existen ejercicios para el grupo muscular */
            <View style={cardStyles.noExercisesBox}>
              <Text style={{ fontSize: 32, marginBottom: 6 }}>📋</Text>
              <Text
                style={[cardStyles.noExercisesTitle, { color: colors.text }]}
              >
                Crea un nuevo ejercicio para este grupo muscular
              </Text>
              <Text
                style={[
                  cardStyles.noExercisesSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Actualmente no tienes ejercicios registrados para{" "}
                <Text style={{ fontWeight: "700", color: "#10b981" }}>
                  {focusLabel}
                </Text>
                . Agrégalo desde la pestaña Catálogo para poder asignarlo.
              </Text>
              <TouchableOpacity
                style={cardStyles.cancelBtn}
                onPress={onCancelAdding}
              >
                <Text style={cardStyles.cancelBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[cardStyles.sectionLabel, { color: colors.text }]}>
                {selectedExercisesList.length > 1
                  ? `Ejercicios seleccionados (${selectedExercisesList.length}):`
                  : `Selecciona ejercicio(s) de ${focusLabel}:`}
              </Text>

              {/* Card desplegable / seleccionable */}
              <TouchableOpacity
                style={[
                  cardStyles.selectedCard,
                  {
                    borderColor:
                      selectedExercisesList.length > 0
                        ? "#10b981"
                        : "rgba(150, 150, 150, 0.3)",
                    backgroundColor: colors.background,
                  },
                ]}
                onPress={() => setIsModalOpen(true)}
                activeOpacity={0.8}
              >
                {selectedExercisesList.length > 1 ? (
                  <View style={{ padding: 8 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: "#10b981",
                          fontWeight: "800",
                          fontSize: 14,
                        }}
                      >
                        ✓ {selectedExercisesList.length} ejercicios seleccionados
                      </Text>
                      <View style={cardStyles.changeBadge}>
                        <Text style={cardStyles.changeBadgeText}>Modificar ▾</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {selectedExercisesList.map((ex) => (
                        <View
                          key={ex.id}
                          style={{
                            backgroundColor: "rgba(16, 185, 129, 0.12)",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {ex.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : selectedExercise ? (
                  <View style={cardStyles.selectedContent}>
                    <ExerciseThumbPreview
                      uri={
                        selectedExercise.thumbnail ||
                        selectedExercise.media?.[0]?.thumbnail ||
                        selectedExercise.media?.[0]?.file ||
                        null
                      }
                      textColorSecondary={colors.textSecondary}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={[
                          cardStyles.selectedName,
                          { color: colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {selectedExercise.name}
                      </Text>
                      <Text
                        style={[
                          cardStyles.selectedMeta,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        ⚙️{" "}
                        {selectedExercise.equipment_name ||
                          "Sin máquina / Libre"}
                      </Text>
                      <Text style={cardStyles.selectedMuscle} numberOfLines={1}>
                        💪 {selectedExercise.primary_muscle || focusLabel}
                      </Text>
                    </View>
                    <View style={cardStyles.changeBadge}>
                      <Text style={cardStyles.changeBadgeText}>Cambiar ▾</Text>
                    </View>
                  </View>
                ) : (
                  <View style={cardStyles.placeholderBtnRow}>
                    <Text style={{ fontSize: 18 }}>🔍</Text>
                    <Text
                      style={[
                        cardStyles.placeholderBtnText,
                        { color: colors.text },
                      ]}
                    >
                      Toca aquí para seleccionar ejercicio(s) de {focusLabel} ▾
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Configuración de Series y Repeticiones explicada */}
              <View style={cardStyles.paramsSection}>
                <Text
                  style={[
                    cardStyles.paramsLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Configuración de la serie:
                </Text>

                <View style={cardStyles.inputsRow}>
                  {/* Series (Sets) */}
                  <View style={cardStyles.inputCol}>
                    <Text
                      style={[
                        cardStyles.inputHeader,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Series (Sets)
                    </Text>
                    <TextInput
                      style={[
                        cardStyles.textInput,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                      value={setsCount}
                      onChangeText={setSetsCount}
                      keyboardType="numeric"
                      placeholder="3"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  {/* Reps Mínimas */}
                  <View style={cardStyles.inputCol}>
                    <Text
                      style={[
                        cardStyles.inputHeader,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Reps Mín
                    </Text>
                    <TextInput
                      style={[
                        cardStyles.textInput,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                      value={minReps}
                      onChangeText={setMinReps}
                      keyboardType="numeric"
                      placeholder="8"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  {/* Reps Máximas */}
                  <View style={cardStyles.inputCol}>
                    <Text
                      style={[
                        cardStyles.inputHeader,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Reps Máx
                    </Text>
                    <TextInput
                      style={[
                        cardStyles.textInput,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                      value={maxReps}
                      onChangeText={setMaxReps}
                      keyboardType="numeric"
                      placeholder="12"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>
              </View>

              {/* Botones de acción */}
              <View style={cardStyles.actionsRow}>
                <TouchableOpacity
                  style={[
                    cardStyles.submitBtn,
                    selectedExercisesList.length === 0 && { opacity: 0.5 },
                  ]}
                  onPress={onAddExercise}
                  disabled={selectedExercisesList.length === 0}
                >
                  <Text style={cardStyles.submitBtnText}>
                    {selectedExercisesList.length > 1
                      ? `✓ Añadir (${selectedExercisesList.length}) a la Rutina`
                      : "✓ Añadir a la Rutina"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={cardStyles.cancelBtn}
                  onPress={onCancelAdding}
                >
                  <Text style={cardStyles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addBtnOutline}
          onPress={handleStartAddingWithModal}
        >
          <Text style={styles.addBtnOutlineText}>
            + Agregar Ejercicio del Catálogo
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal Popup para seleccionar ejercicio con fotos y tarjetas exclusivas del grupo */}
      <SelectExerciseModal
        visible={isModalOpen}
        colors={colors}
        exercises={exercises}
        routineFocus={routine.focus}
        selectedExerciseId={selectedExToAdd}
        selectedExerciseIds={currentSelectedIds}
        multiSelect={true}
        onSelect={(exerciseId) => {
          setSelectedExToAdd(exerciseId);
          setSelectedExsToAdd?.([exerciseId]);
        }}
        onConfirmSelection={(ids) => {
          setSelectedExsToAdd?.(ids);
          if (ids.length > 0) setSelectedExToAdd(ids[0]);
        }}
        onClose={() => setIsModalOpen(false)}
      />
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  optionsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(150, 150, 150, 0.12)",
  },
  optionsBtnText: {
    fontSize: 18,
    fontWeight: "800",
  },
  focusBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  focusBadgeText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "800",
  },
  addingContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.15)",
  },
  noExercisesBox: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  noExercisesTitle: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  noExercisesSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  selectedCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    marginBottom: 10,
  },
  selectedContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "rgba(150, 150, 150, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyThumbText: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 1,
  },
  thumbImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  selectedMeta: {
    fontSize: 13,
    marginBottom: 2,
  },
  selectedMuscle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },
  changeBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  changeBadgeText: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "700",
  },
  placeholderBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  placeholderBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  paramsSection: {
    marginTop: 6,
    marginBottom: 12,
  },
  paramsLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputsRow: {
    flexDirection: "row",
    gap: 8,
  },
  inputCol: {
    flex: 1,
  },
  inputHeader: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  textInput: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.2)",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: "#10b981",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
});
