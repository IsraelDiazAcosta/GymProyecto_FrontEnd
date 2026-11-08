import { Colors } from "@/constants/theme";

export type TabType =
  | "routines"
  | "tracking"
  | "catalog"
  | "equipment"
  | "profile";

export type DashboardColors = (typeof Colors)["light" | "dark"];

export type RoutineExerciseItem = {
  id: string; // Catalog Exercise UUID
  name: string;
  routineExerciseId?: string; // RoutineExercise instance UUID
  equipmentName?: string;
  setsCount?: number;
  minReps?: number;
  maxReps?: number;
};
