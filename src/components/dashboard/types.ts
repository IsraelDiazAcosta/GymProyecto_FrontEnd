import { Colors } from "@/constants/theme";

export type TabType = "catalog" | "routines" | "tracking" | "profile";

export type DashboardColors = (typeof Colors)["light" | "dark"];

export type RoutineExerciseItem = { id: string; name: string };
