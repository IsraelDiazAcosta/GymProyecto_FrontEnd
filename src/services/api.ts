import { Platform } from "react-native";
import { storage } from "./storage";

export const DEV_PC_IP =
  process.env.EXPO_PUBLIC_DEV_PC_IP;
export const API_BASE_URL = Platform.select({
  web: "http://127.0.0.1:8000/api/v1",
  android: `http://${DEV_PC_IP}:8000/api/v1`,
  ios: `http://${DEV_PC_IP}:8000/api/v1`,
  default: `http://${DEV_PC_IP}:8000/api/v1`,
});

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
];

export interface User {
  id: string;
  email: string;
  username?: string | null;
  avatar?: string | null;
  experience_level?: ExperienceLevel;
  // DRF serializa DecimalField como string ("72.50")
  current_weight?: number | string | null;
  height?: number | string | null;
  bio?: string;
  favorite_exercises?: string[];
  is_staff?: boolean;
}

/** Campos del perfil que el usuario puede editar vía PATCH /auth/profile/. */
export interface ProfileUpdatePayload {
  username?: string | null;
  experience_level?: ExperienceLevel;
  current_weight?: string | null;
  height?: string | null;
  bio?: string;
  favorite_exercises?: string[];
}

/** Convierte rutas relativas de media (/media/avatars/x.jpg) en URL absoluta. */
export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const host = (API_BASE_URL ?? "").replace(/\/api\/v1\/?$/, "");
  return `${host}${path.startsWith("/") ? "" : "/"}${path}`;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Equipment {
  id: number;
  name: string;
  equipment_type: string;
  equipment_type_display?: string;
  brand: string;
  image?: string;
  description?: string;
  setup_guide?: string;
}

export interface MuscleGroup {
  id: number;
  name: string;
  body_part: string;
}

export interface ExerciseMedia {
  id: number;
  media_type: string;
  title: string;
  file?: string;
  external_url?: string;
  thumbnail?: string;
}

export interface Exercise {
  id: string;
  name: string;
  slug?: string;
  equipment_name?: string;
  primary_muscle?: string;
  equipment?: Equipment;
  muscles?: {
    muscle: number;
    muscle_name: string;
    body_part: string;
    role_display: string;
  }[];
  mechanics?: string;
  difficulty?: string;
  instructions?: string;
  tips?: string;
  media?: ExerciseMedia[];
  thumbnail?: string | null;
}

export interface RoutineSet {
  id?: number;
  set_number: number;
  min_reps: number;
  max_reps: number;
  target_rpe?: number;
  target_weight?: number;
}

export interface RoutineExercise {
  id: string;
  exercise: string;
  exercise_detail: {
    id: string;
    name: string;
    equipment_name?: string;
  };
  order: number;
  rest_seconds: number;
  notes?: string;
  target_sets?: RoutineSet[];
}

export interface RoutineDay {
  id: string;
  name: string;
  order: number;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  title: string;
  focus: string;
  description?: string;
  days_count?: number;
  days: RoutineDay[];
  created_at: string;
}

export interface ProgressionItem {
  id?: string;
  logged_at: string;
  weight: number;
  reps: number;
  rpe?: number;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await storage.getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        data.detail || data.non_field_errors?.[0] || "Error en la petición";
      throw new ApiError(response.status, errorMsg, data);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      0,
      `No se pudo conectar a ${url}. Asegúrate de correr Django con: python manage.py runserver 0.0.0.0:8000 y que tu celular esté en el mismo WiFi.`,
    );
  }
}

export const api = {
  // --- AUTH ---
  async login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async getProfile(): Promise<User> {
    return request<User>("/auth/profile/");
  },
  async updateProfile(payload: ProfileUpdatePayload): Promise<User> {
    return request<User>("/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async getAdminUsers(): Promise<any[]> {
    const res: any = await request("/auth/users/");
    return res.results || res;
  },

  // --- CATÁLOGO ---
  async getExercises(): Promise<Exercise[]> {
    const res: any = await request("/catalog/exercises/");
    return res.results || res;
  },

  async getExerciseDetail(id: string): Promise<Exercise> {
    return request<Exercise>(`/catalog/exercises/${id}/`);
  },

  async getEquipment(): Promise<Equipment[]> {
    const res: any = await request("/catalog/equipment/");
    return res.results || res;
  },

  async createEquipment(payload: {
    name: string;
    equipment_type: string;
    brand?: string;
    description?: string;
    setup_guide?: string;
  }): Promise<Equipment> {
    return request<Equipment>("/catalog/equipment/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateEquipment(
    id: number,
    payload: {
      name?: string;
      equipment_type?: string;
      brand?: string;
      description?: string;
      setup_guide?: string;
    },
  ): Promise<Equipment> {
    return request<Equipment>(`/catalog/equipment/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteEquipment(id: number): Promise<void> {
    return request<void>(`/catalog/equipment/${id}/`, {
      method: "DELETE",
    });
  },

  async getMuscles(): Promise<MuscleGroup[]> {
    const res: any = await request("/catalog/muscles/");
    return res.results || res;
  },

  async createExercise(payload: any): Promise<Exercise> {
    return request<Exercise>("/catalog/exercises/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateExercise(id: string, payload: any): Promise<Exercise> {
    return request<Exercise>(`/catalog/exercises/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteExercise(id: string): Promise<void> {
    return request<void>(`/catalog/exercises/${id}/`, {
      method: "DELETE",
    });
  },

  // --- RUTINAS ---
  async getRoutines(): Promise<Routine[]> {
    const res: any = await request("/routines/routines/");
    return res.results || res;
  },

  async createRoutine(
    title: string,
    focus: string,
    description: string = "Rutina personalizada",
    exercise_ids?: string[],
    sets_count?: number,
    min_reps?: number,
    max_reps?: number,
  ): Promise<Routine> {
    return request<Routine>("/routines/routines/", {
      method: "POST",
      body: JSON.stringify({
        title,
        focus,
        description,
        exercise_ids,
        sets_count,
        min_reps,
        max_reps,
      }),
    });
  },

  async updateRoutine(
    id: string,
    payload: { title?: string; focus?: string; description?: string },
  ): Promise<Routine> {
    return request<Routine>(`/routines/routines/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteRoutine(id: string): Promise<void> {
    return request<void>(`/routines/routines/${id}/`, {
      method: "DELETE",
    });
  },

  async removeExerciseFromRoutine(routineExerciseId: string): Promise<void> {
    return request<void>(`/routines/exercises/${routineExerciseId}/`, {
      method: "DELETE",
    });
  },

  async addExerciseToRoutine(
    routineId: string,
    payload: {
      exercise_id?: string;
      exercise_ids?: string[];
      sets_count: number;
      min_reps: number;
      max_reps: number;
      rest_seconds?: number;
    },
  ): Promise<Routine> {
    return request<Routine>(`/routines/routines/${routineId}/add-exercise/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // --- TRACKING Y MARCAS ---
  async ensureSession(): Promise<string> {
    const sessions: any = await request("/tracking/sessions/");
    const active = (sessions.results || sessions).find(
      (s: any) => !s.is_completed,
    );
    if (active) return active.id;

    const newSession: any = await request("/tracking/sessions/", {
      method: "POST",
      body: JSON.stringify({
        title: "Entrenamiento Móvil",
        start_time: new Date().toISOString(),
      }),
    });
    return newSession.id;
  },

  async saveMarca(
    exerciseId: string,
    weight: number,
    reps: number,
    rpe?: number,
  ): Promise<any> {
    const sessionId = await this.ensureSession();

    // 1. Vincular ejercicio a la sesión
    const logEx: any = await request("/tracking/exercises/", {
      method: "POST",
      body: JSON.stringify({
        session: sessionId,
        exercise: exerciseId,
        order: 1,
      }),
    });

    // 2. Registrar serie con peso y reps
    return request("/tracking/sets/", {
      method: "POST",
      body: JSON.stringify({
        log_exercise: logEx.id,
        set_number: 1,
        weight,
        reps,
        rpe: rpe || null,
      }),
    });
  },

  async getProgression(
    exerciseId: string,
  ): Promise<{ history: ProgressionItem[] }> {
    return request<{ history: ProgressionItem[] }>(
      `/tracking/progression/${exerciseId}/`,
    );
  },

  async updateMarca(
    setId: string,
    payload: { weight?: number; reps?: number; rpe?: number },
  ): Promise<any> {
    return request<any>(`/tracking/sets/${setId}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteMarca(setId: string): Promise<void> {
    return request<void>(`/tracking/sets/${setId}/`, {
      method: "DELETE",
    });
  },
};
