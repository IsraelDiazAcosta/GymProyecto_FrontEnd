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
    fontSize: 14,
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
    fontSize: 28,
    fontWeight: "800",
    marginBottom: Spacing.two,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  headerWithBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 3,
  },
  routineHeader: {
    marginBottom: 8,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  routineSubtitle: {
    fontSize: 14,
    marginTop: 3,
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
    fontSize: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
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
    fontSize: 15,
  },
  exerciseBadge: {
    backgroundColor: "rgba(227, 252, 211, 0.05)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginVertical: 3,
  },
  exerciseBadgeText: {
    color: "#10b981",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyHint: {
    fontSize: 14,
    fontStyle: "italic",
    marginVertical: 5,
  },
  addBtnOutline: {
    borderWidth: 1,
    borderColor: "#10b981",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addBtnOutlineText: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "700",
  },
  addExerciseBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  addExerciseBoxTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
  chip: {
    backgroundColor: "rgba(150, 150, 150, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: "#10b981",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  cancelText: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    color: "#10b981",
  },
  successSavedText: {
    color: "#28a745",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  historyWeight: {
    fontSize: 17,
    fontWeight: "700",
  },
  historyDate: {
    fontSize: 13,
    marginTop: 3,
  },
  oneRmBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  oneRmBadgeText: {
    color: "#ffffff",
    fontSize: 13,
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
    fontSize: 17,
    fontWeight: "700",
  },
  exerciseInfo: {
    fontSize: 14,
    marginTop: 3,
  },
  verMasBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verMasText: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "700",
  },
  adminActionBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adminUserItem: {
    backgroundColor: "rgba(150, 150, 150, 0.1)",
    padding: 8,
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
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  modalValue: {
    fontSize: 16,
    marginTop: 3,
    lineHeight: 22,
  },
  mediaBox: {
    backgroundColor: "rgba(227, 252, 211, 0.05)",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
});
