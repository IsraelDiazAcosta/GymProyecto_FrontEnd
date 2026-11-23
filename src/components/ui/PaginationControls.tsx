import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { DashboardColors } from "@/components/dashboard/types";
import { GymIcon } from "@/components/ui/GymIcon";
import { Radius } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";

export const DEFAULT_MAX_PAGE_SIZE = 100;

interface PageSizeSelectorProps {
  colors: DashboardColors;
  pageSize: number;
  totalItems: number;
  currentPage: number;
  minSize?: number;
  maxSize?: number;
  onChangePageSize: (size: number) => void;
}

/**
 * Numeric field letting the user type directly how many items
 * to display per page (applied automatically while typing).
 */
export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  colors,
  pageSize,
  totalItems,
  currentPage,
  minSize = 1,
  maxSize = DEFAULT_MAX_PAGE_SIZE,
  onChangePageSize,
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState(String(pageSize));

  useEffect(() => {
    setInputText(String(pageSize));
  }, [pageSize]);

  const handleChangeText = (raw: string) => {
    const digitsOnly = raw.replace(/[^0-9]/g, "");
    setInputText(digitsOnly);

    if (!digitsOnly) return;

    const parsed = parseInt(digitsOnly, 10);
    if (!Number.isNaN(parsed) && parsed >= minSize) {
      const clamped = Math.min(parsed, maxSize);
      if (clamped !== parsed) {
        setInputText(String(clamped));
      }
      onChangePageSize(clamped);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputText, 10);
    if (Number.isNaN(parsed) || parsed < minSize) {
      setInputText(String(pageSize));
      return;
    }
    const clamped = Math.min(parsed, maxSize);
    setInputText(String(clamped));
    if (clamped !== pageSize) {
      onChangePageSize(clamped);
    }
  };

  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <View
      style={[
        styles.selectorWrapper,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.selectorTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.selectorLabel, { color: colors.text }]}>
            {t("pagination.itemsPerPage")}
          </Text>
          <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
            {totalItems === 0
              ? t("pagination.noResults")
              : t("pagination.showingRange", {
                  start,
                  end,
                  total: totalItems,
                })}
          </Text>
        </View>

        <TextInput
          value={inputText}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          onSubmitEditing={handleBlur}
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={3}
          selectTextOnFocus
          placeholder={String(pageSize)}
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel={t("pagination.inputHint", {
            min: minSize,
            max: maxSize,
          })}
          style={[
            styles.pageSizeInput,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.primary,
              color: colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

interface PaginationBarProps {
  colors: DashboardColors;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible = 3,
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  } else if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxVisible + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Pagination bar with numeric page tabs plus Previous and Next buttons.
 * Shown when more than 1 page is available and automatically shifts
 * visible page numbers around the active page.
 */
export const PaginationBar: React.FC<PaginationBarProps> = ({
  colors,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages, 3);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <View
      style={[
        styles.paginationCard,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <Pressable
        onPress={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        style={[
          styles.navBtn,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.borderSubtle,
            opacity: canGoPrev ? 1 : 0.4,
          },
        ]}
      >
        <View style={{ transform: [{ rotate: "180deg" }] }}>
          <GymIcon
            name="chevron-right"
            size={14}
            color={canGoPrev ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text
          style={[
            styles.navBtnText,
            { color: canGoPrev ? colors.text : colors.textSecondary },
          ]}
        >
          {t("pagination.prev")}
        </Text>
      </Pressable>

      <View style={styles.pagesRow}>
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <Pressable
              key={page}
              onPress={() => onPageChange(page)}
              style={[
                styles.pageTab,
                {
                  backgroundColor: isCurrent
                    ? colors.primary
                    : colors.backgroundElement,
                  borderColor: isCurrent ? colors.primary : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.pageTabText,
                  {
                    color: isCurrent ? colors.onPrimary : colors.text,
                  },
                ]}
              >
                {page}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        style={[
          styles.navBtn,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.borderSubtle,
            opacity: canGoNext ? 1 : 0.4,
          },
        ]}
      >
        <Text
          style={[
            styles.navBtnText,
            { color: canGoNext ? colors.text : colors.textSecondary },
          ]}
        >
          {t("pagination.next")}
        </Text>
        <GymIcon
          name="chevron-right"
          size={14}
          color={canGoNext ? colors.primary : colors.textSecondary}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  selectorWrapper: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectorTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  rangeText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  pageSizeInput: {
    width: 68,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  paginationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 8,
    gap: 8,
    marginTop: 4,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  pagesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pageTab: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTabText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
