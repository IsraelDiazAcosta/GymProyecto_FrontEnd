import { Spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";

// Estilos compartidos por todos los componentes del dashboard
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#10b981",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: Spacing.two,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  headerWithBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  card: {
    borderRadius: 14,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  routineHeader: {
    marginBottom: 8,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  routineSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  smallPrimaryBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnTextWhite: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  exerciseBadge: {
    backgroundColor: "rgba(227, 252, 211, 0.05)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 2,
  },
  exerciseBadgeText: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyHint: {
    fontSize: 12,
    fontStyle: "italic",
    marginVertical: 4,
  },
  addBtnOutline: {
    borderWidth: 1,
    borderColor: "#10b981",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: "center",
    marginTop: 8,
  },
  addBtnOutlineText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "700",
  },
  addExerciseBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  addExerciseBoxTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
  },
  chip: {
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: "#10b981",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  cancelText: {
    color: "#888",
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    color: "#10b981",
  },
  successSavedText: {
    color: "#28a745",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  historyWeight: {
    fontSize: 15,
    fontWeight: "700",
  },
  historyDate: {
    fontSize: 11,
    marginTop: 2,
  },
  oneRmBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  oneRmBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  exerciseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "700",
  },
  exerciseInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  verMasBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verMasText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "700",
  },
  adminActionBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminUserItem: {
    backgroundColor: "rgba(150, 150, 150, 0.1)",
    padding: 6,
    borderRadius: 6,
    marginVertical: 3,
  },
  loadingOverlay: {
    padding: 4,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  modalValue: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 18,
  },
  mediaBox: {
    backgroundColor: "rgba(227, 252, 211, 0.05)",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
});
