import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { getMuscleFocusLabel } from "@/i18n";
import {
  Equipment,
  Exercise,
  resolveExerciseImageUrl,
} from "@/services/api";
import { isExerciseCompatibleWithFocus } from "../muscleValidation";
import { DashboardColors } from "../types";

export interface SelectExerciseModalProps {
  visible: boolean;
  colors: DashboardColors;
  exercises: Exercise[];
  equipmentList?: Equipment[];
  routineFocus?: string;
  selectedExerciseId?: string;
  selectedExerciseIds?: string[];
  selectedIds?: string[];
  multiSelect?: boolean;
  onSelect?: (exerciseId: string) => void;
  onConfirmSelection?: (selectedIds: string[]) => void;
  onToggleSelect?: (exerciseId: string) => void;
  onSave?: () => void;
  allRoutines?: any[];
  onClose: () => void;
}

const ExerciseThumbnail: React.FC<{
  uri?: string | null;
  size?: number;
  colors: DashboardColors;
}> = ({ uri, size = 54, colors }) => {
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
          styles.emptyThumbnail,
          {
            width: size,
            height: size,
            borderRadius: 12,
            backgroundColor: colors.primaryGlow,
            borderColor: colors.border,
          },
        ]}
      >
        <GymIcon name="dumbbell" size={20} color={colors.primary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: uri! }}
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        backgroundColor: colors.backgroundElevated,
      }}
      contentFit="cover"
      cachePolicy="memory-disk"
      onError={() => setHasError(true)}
    />
  );
};

export const SelectExerciseModal: React.FC<SelectExerciseModalProps> = ({
  visible,
  colors,
  exercises,
  equipmentList = [],
  routineFocus,
  selectedExerciseId,
  selectedExerciseIds,
  selectedIds,
  multiSelect = false,
  onSelect,
  onConfirmSelection,
  onToggleSelect,
  onSave,
  allRoutines,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const isMulti =
    multiSelect ||
    Boolean(selectedIds) ||
    Boolean(onToggleSelect) ||
    Boolean(onConfirmSelection);
  const effectiveSelectedIds = selectedIds || selectedExerciseIds || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [filterByFocus, setFilterByFocus] = useState<boolean>(
    Boolean(routineFocus),
  );
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      if (isMulti) {
        setTempSelectedIds(effectiveSelectedIds);
      } else if (selectedExerciseId) {
        setTempSelectedIds([selectedExerciseId]);
      } else {
        setTempSelectedIds([]);
      }
    }
  }, [visible, isMulti, selectedExerciseId, selectedIds, selectedExerciseIds]);

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return exercises.filter((ex) => {
      if (filterByFocus && routineFocus) {
        const compatible = isExerciseCompatibleWithFocus(
          ex.name,
          routineFocus,
          ex.primary_muscle,
        );
        if (!compatible) return false;
      }

      if (!query) return true;
      const matchName = ex.name?.toLowerCase().includes(query);
      const matchEquip = ex.equipment_name?.toLowerCase().includes(query);
      const matchMuscle = ex.primary_muscle?.toLowerCase().includes(query);
      return Boolean(matchName || matchEquip || matchMuscle);
    });
  }, [exercises, searchQuery, filterByFocus, routineFocus]);

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const toggleExercise = (exerciseId: string) => {
    if (onToggleSelect) {
      onToggleSelect(exerciseId);
    }

    if (!isMulti) {
      onSelect?.(exerciseId);
      handleClose();
      return;
    }

    setTempSelectedIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId],
    );
  };

  const handleConfirmMulti = () => {
    onConfirmSelection?.(tempSelectedIds);
    onSave?.();
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
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
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                {isMulti
                  ? t("routines.selectMultiTitle")
                  : t("routines.selectSingleTitle")}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {isMulti
                  ? t("routines.selectMultiSub", {
                      selected: tempSelectedIds.length,
                      available: filteredExercises.length,
                    })
                  : t("routines.selectSingleSub", {
                      available: filteredExercises.length,
                    })}
              </Text>
            </View>

            <Pressable
              onPress={handleClose}
              style={[
                styles.closeButton,
                { backgroundColor: colors.backgroundElevated },
              ]}
            >
              <GymIcon name="x" size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* Muscle focus filter */}
          {Boolean(routineFocus) && (
            <View style={styles.filterToggleRow}>
              <Pressable
                onPress={() => setFilterByFocus(true)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filterByFocus
                      ? colors.primaryGlow
                      : colors.backgroundElevated,
                    borderColor: filterByFocus
                      ? colors.primary
                      : colors.borderSubtle,
                  },
                ]}
              >
                <GymIcon
                  name="target"
                  size={13}
                  color={filterByFocus ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: filterByFocus
                        ? colors.primary
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {t("routines.onlyFocus", {
                    focus: routineFocus
                      ? getMuscleFocusLabel(language, routineFocus).toUpperCase()
                      : "",
                  })}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilterByFocus(false)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: !filterByFocus
                      ? colors.primaryGlow
                      : colors.backgroundElevated,
                    borderColor: !filterByFocus
                      ? colors.primary
                      : colors.borderSubtle,
                  },
                ]}
              >
                <GymIcon
                  name="layers"
                  size={13}
                  color={!filterByFocus ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: !filterByFocus
                        ? colors.primary
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {t("routines.viewAllCount", { count: exercises.length })}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Search bar */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <GymIcon name="search" size={17} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t("routines.searchPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                <GymIcon name="x" size={16} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* List */}
          <FlatList
            data={filteredExercises}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <GymIcon
                  name="search"
                  size={34}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t("routines.emptySearchTitle")}
                </Text>
                <Text
                  style={[styles.emptySubtitle, { color: colors.textSecondary }]}
                >
                  {t("routines.emptySearchSub")}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = isMulti
                ? (onToggleSelect ? effectiveSelectedIds.includes(item.id) : tempSelectedIds.includes(item.id))
                : item.id === selectedExerciseId;

              return (
                <Pressable
                  onPress={() => toggleExercise(item.id)}
                  style={[
                    styles.cardItem,
                    {
                      backgroundColor: isSelected
                        ? colors.primaryGlow
                        : colors.backgroundElevated,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.borderSubtle,
                    },
                  ]}
                >
                  <ExerciseThumbnail
                    uri={resolveExerciseImageUrl(item, equipmentList)}
                    size={54}
                    colors={colors}
                  />

                  <View style={styles.cardInfo}>
                    <Text
                      style={[
                        styles.exerciseName,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    <View style={styles.metaColumn}>
                      <View style={styles.metaRow}>
                        <GymIcon
                          name="cog"
                          size={12}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.metaText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {item.equipment_name || t("common.freeWeight")}
                        </Text>
                      </View>
                      {Boolean(item.primary_muscle) && (
                        <View style={styles.metaRow}>
                          <GymIcon
                            name="target"
                            size={12}
                            color={colors.primary}
                          />
                          <Text
                            style={[styles.metaText, { color: colors.primary }]}
                          >
                            {getMuscleFocusLabel(language, item.primary_muscle)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      {
                        borderColor: isSelected
                          ? colors.primary
                          : colors.borderSubtle,
                        backgroundColor: isSelected
                          ? colors.primary
                          : "transparent",
                      },
                    ]}
                  >
                    {isSelected && (
                      <GymIcon name="check" size={14} color={colors.onPrimary} />
                    )}
                  </View>
                </Pressable>
              );
            }}
          />

          {isMulti && (
            <View
              style={[
                styles.footerBar,
                { borderTopColor: colors.borderSubtle },
              ]}
            >
              <AppButton
                title={
                  (onToggleSelect ? effectiveSelectedIds.length : tempSelectedIds.length) > 0
                    ? t("routines.confirmSelection", {
                        count: onToggleSelect
                          ? effectiveSelectedIds.length
                          : tempSelectedIds.length,
                      })
                    : t("routines.confirmEmptySelection")
                }
                icon="check"
                onPress={handleConfirmMulti}
              />
            </View>
          )}
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
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 26,
    maxHeight: "86%",
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filterToggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "800",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: 10,
    paddingBottom: 16,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: 12,
  },
  emptyThumbnail: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "800",
  },
  metaColumn: {
    flexDirection: "column",
    gap: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "700",
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
  footerBar: {
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
