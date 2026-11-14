import Constants from "expo-constants";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import { storage } from "./storage";

function extractLanIp(raw?: string | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const cleaned = raw.replace(/^[a-z]+:\/\//i, "").split("/")[0];
  const host = cleaned.split(":")[0]?.trim();
  if (!host || host === "localhost" || host === "127.0.0.1") {
    return null;
  }
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ? host : null;
}

function resolveDevHostIp(): string {
  const envIp = process.env.EXPO_PUBLIC_DEV_PC_IP?.trim();
  if (envIp) return envIp;

  const expoHostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest?.hostUri;

  return extractLanIp(expoHostUri) || "192.168.100.8";
}

export const DEV_PC_IP = resolveDevHostIp();
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

export type TrainingGoal =
  | "hypertrophy"
  | "strength"
  | "weight_loss"
  | "endurance"
  | "general_fitness";

export const TRAINING_GOALS: { value: TrainingGoal; label: string }[] = [
  { value: "hypertrophy", label: "Hipertrofia" },
  { value: "strength", label: "Fuerza" },
  { value: "weight_loss", label: "Definición" },
  { value: "endurance", label: "Resistencia" },
  { value: "general_fitness", label: "Salud General" },
];

export interface PickedImageAsset {
  uri: string;
  name: string;
  type: string;
  file?: File;
  base64?: string;
}

export interface BodyWeightLogItem {
  id: number;
  weight: number | string;
  date: string;
  created_at?: string;
}

export interface Weight1RMPoint {
  set_id: string;
  date: string;
  logged_at: string;
  exercise_id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  estimated_1rm: number;
  body_weight?: number | null;
  relative_strength?: number | null;
}

export interface Weight1RMProgressResponse {
  exercise_id?: string | null;
  weight_logs: { id: number; date: string; weight: number }[];
  progress: Weight1RMPoint[];
}

export interface User {
  id: string;
  email: string;
  username?: string | null;
  avatar?: string | null;
  experience_level?: ExperienceLevel;
  training_goal?: TrainingGoal;
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
  training_goal?: TrainingGoal;
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

/** Devuelve la URL absoluta de la imagen propia del ejercicio o hereda la de su máquina. */
export function resolveExerciseImageUrl(
  exercise?: Exercise | null,
  equipmentList?: Equipment[],
): string | null {
  if (!exercise) return null;
  const direct =
    exercise.image ||
    exercise.image_url ||
    exercise.thumbnail ||
    exercise.media?.find((m) => m.media_type === "image" || Boolean(m.thumbnail))
      ?.thumbnail ||
    exercise.media?.find((m) => m.media_type === "image")?.file ||
    (typeof exercise.equipment === "object" && exercise.equipment
      ? exercise.equipment.image
      : null);
  if (direct) return resolveMediaUrl(direct);
  if (equipmentList && equipmentList.length > 0) {
    const eqId =
      typeof exercise.equipment === "object" && exercise.equipment
        ? exercise.equipment.id
        : (exercise as any).equipment_id;
    const eqMatch = equipmentList.find(
      (eq) =>
        (eqId && eq.id === eqId) ||
        (exercise.equipment_name &&
          eq.name.toLowerCase() === exercise.equipment_name.toLowerCase()),
    );
    if (eqMatch?.image) return resolveMediaUrl(eqMatch.image);
  }
  return null;
}

/** Abre cámara o galería, redimensiona lado largo a máx. 1080px y comprime a calidad 0.7. */
export async function pickAndCompressImage(
  source: "camera" | "gallery",
): Promise<PickedImageAsset | null> {
  if (source === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      throw new Error("Se requiere permiso de cámara para tomar una foto.");
    }
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      throw new Error("Se requiere permiso de galería para elegir una imagen.");
    }
  }

  const pickerFn =
    source === "camera"
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

  const result = await pickerFn({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.9,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  const w = asset.width || 0;
  const h = asset.height || 0;
  const actions: ImageManipulator.Action[] = [];

  if (w > 1080 || h > 1080) {
    if (w >= h) {
      actions.push({ resize: { width: 1080 } });
    } else {
      actions.push({ resize: { height: 1080 } });
    }
  }

  const format =
    Platform.OS === "web"
      ? ImageManipulator.SaveFormat.WEBP
      : ImageManipulator.SaveFormat.JPEG;
  const ext = format === ImageManipulator.SaveFormat.WEBP ? "webp" : "jpg";
  const mime =
    format === ImageManipulator.SaveFormat.WEBP ? "image/webp" : "image/jpeg";

  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    actions,
    {
      compress: 0.7,
      format,
      base64: true,
    },
  );

  let webFile: File | undefined;
  if (Platform.OS === "web" && manipulated.uri) {
    try {
      const resp = await fetch(manipulated.uri);
      const blob = await resp.blob();
      webFile = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime });
    } catch {}
  }

  return {
    uri: manipulated.uri,
    name: `upload_${Date.now()}.${ext}`,
    type: mime,
    file: webFile,
    base64: manipulated.base64,
  };
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
  type_display?: string;
  brand: string;
  image?: string | null;
  is_favorite?: boolean;
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
    id?: number;
    muscle: number;
    muscle_name: string;
    body_part: string;
    role?: string;
    role_display: string;
  }[];
  mechanics?: string;
  difficulty?: string;
  description?: string;
  instructions?: string;
  tips?: string;
  media?: ExerciseMedia[];
  image?: string | null;
  image_url?: string | null;
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

export interface RoutineRef {
  id: string | null;
  name: string;
  title?: string;
}

export interface WorkoutSessionItem {
  id: string;
  routine?: string | RoutineRef | null;
  routine_id?: string | null;
  routine_title?: string;
  routine_detail?: RoutineRef | null;
  title?: string;
  started_at: string;
  ended_at?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_seconds?: number | null;
  duration_minutes?: number | null;
  status: "active" | "completed" | "cancelled";
  date?: string | null;
  total_exercises?: number;
  total_sets?: number;
  total_volume?: number;
}

export interface SessionExerciseSetDetail {
  id: string;
  set_number: number;
  weight: number;
  reps: number;
  rpe?: number | null;
  estimated_1rm: number;
  set_type?: string;
}

export interface SessionExerciseDetail {
  id: string;
  exercise_id: string;
  exercise_name: string;
  order: number;
  unrecorded: boolean;
  status: string;
  planned_sets?: number;
  planned_reps?: string | null;
  sets: SessionExerciseSetDetail[];
}

export interface WorkoutSessionDetail extends WorkoutSessionItem {
  has_logged_sets: boolean;
  exercises: SessionExerciseDetail[];
}

export interface RoutineSessionSummaryItem {
  routine_id: string | null;
  routine_name: string;
  routine: RoutineRef;
  sessions_count: number;
  average_duration_seconds: number;
  total_duration_seconds: number;
  last_session_at: string | null;
}

export interface PaginatedSessionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  summary?: {
    total_sessions: number;
    total_duration_seconds: number;
    average_duration_seconds: number;
  };
  results: WorkoutSessionItem[];
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

function buildMultipartBody(payload: Record<string, any>): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (key === "image" && typeof val === "object" && "uri" in val) {
      if (Platform.OS === "web" && val.file) {
        formData.append("image", val.file, val.name || "upload.jpg");
      } else {
        formData.append("image", {
          uri: val.uri,
          name: val.name || "upload.jpg",
          type: val.type || "image/jpeg",
        } as any);
      }
    } else {
      formData.append(key, String(val));
    }
  });
  return formData;
}

function serializePayloadWithImage(
  payload: Record<string, any>,
): string | FormData {
  const img = payload?.image as PickedImageAsset | null | undefined;
  if (img && typeof img === "object") {
    if (img.base64) {
      const cleanPayload: Record<string, any> = {};
      Object.entries(payload).forEach(([key, val]) => {
        if (key === "image" || val === undefined) return;
        cleanPayload[key] = val;
      });
      const mime = img.type || "image/jpeg";
      const cleanBase64 = img.base64.includes(";base64,")
        ? img.base64.split(";base64,")[1]
        : img.base64;
      cleanPayload.image = `data:${mime};base64,${cleanBase64}`;
      return JSON.stringify(cleanPayload);
    }
    if ("uri" in img || "file" in img) {
      return buildMultipartBody(payload);
    }
  }

  const cleanPayload: Record<string, any> = {};
  Object.entries(payload || {}).forEach(([key, val]) => {
    if (val === undefined) return;
    if (key === "image" && val === null) return;
    cleanPayload[key] = val;
  });
  return JSON.stringify(cleanPayload);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await storage.getAccessToken();
  const isMultipart =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isMultipart ? {} : { "Content-Type": "application/json" }),
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

  async getWeightLogs(): Promise<BodyWeightLogItem[]> {
    const res: any = await request("/auth/weight-logs/");
    return res.results || res;
  },

  async createWeightLog(
    weight: number | string,
    date?: string,
  ): Promise<BodyWeightLogItem> {
    return request<BodyWeightLogItem>("/auth/weight-logs/", {
      method: "POST",
      body: JSON.stringify(date ? { weight, date } : { weight }),
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

  async getFavoriteEquipment(): Promise<Equipment[]> {
    const res: any = await request("/catalog/equipment/favorites/");
    return res.results || res;
  },

  async toggleEquipmentFavorite(
    id: number,
  ): Promise<{ is_favorite: boolean; equipment_id: number }> {
    return request<{ is_favorite: boolean; equipment_id: number }>(
      `/catalog/equipment/${id}/favorite/`,
      { method: "POST" },
    );
  },

  async createEquipment(payload: {
    name: string;
    equipment_type: string;
    brand?: string;
    description?: string;
    setup_guide?: string;
    image?: PickedImageAsset | null;
  }): Promise<Equipment> {
    const body = serializePayloadWithImage(payload);
    return request<Equipment>("/catalog/equipment/", {
      method: "POST",
      body,
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
      image?: PickedImageAsset | null;
    },
  ): Promise<Equipment> {
    const body = serializePayloadWithImage(payload);
    return request<Equipment>(`/catalog/equipment/${id}/`, {
      method: "PATCH",
      body,
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
    const body = serializePayloadWithImage(payload);
    return request<Exercise>("/catalog/exercises/", {
      method: "POST",
      body,
    });
  },

  async updateExercise(id: string, payload: any): Promise<Exercise> {
    const body = serializePayloadWithImage(payload);
    return request<Exercise>(`/catalog/exercises/${id}/`, {
      method: "PATCH",
      body,
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

  async updateRoutineExercise(
    routineExerciseId: string,
    payload: { sets_count: number; min_reps: number; max_reps: number },
  ): Promise<RoutineExercise> {
    return request<RoutineExercise>(
      `/routines/exercises/${routineExerciseId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
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
      body: JSON.stringify({
        ...payload,
        exercise_id: payload.exercise_id || payload.exercise_ids?.[0],
      }),
    });
  },

  async getWeight1RMProgress(
    exerciseId?: string,
  ): Promise<Weight1RMProgressResponse> {
    const q = exerciseId ? `?exercise_id=${encodeURIComponent(exerciseId)}` : "";
    return request<Weight1RMProgressResponse>(
      `/tracking/progress/weight-1rm/${q}`,
    );
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

  // --- SESIONES DE RUTINA CON TIMER ---
  async startRoutineSession(routineId: string): Promise<WorkoutSessionItem> {
    return request<WorkoutSessionItem>("/tracking/sessions/start/", {
      method: "POST",
      body: JSON.stringify({ routine_id: routineId }),
    });
  },

  async finishRoutineSession(): Promise<WorkoutSessionItem> {
    return request<WorkoutSessionItem>("/tracking/sessions/finish/", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  async cancelRoutineSession(): Promise<{ status: string; id?: string | null }> {
    return request<{ status: string; id?: string | null }>(
      "/tracking/sessions/cancel/",
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
  },

  async getActiveRoutineSession(): Promise<WorkoutSessionItem | null> {
    const res = await request<WorkoutSessionItem | null>(
      "/tracking/sessions/active/",
    );
    return res && res.id ? res : null;
  },

  async getRoutineSessionHistory(params?: {
    desde?: string;
    hasta?: string;
    routine_id?: string;
  }): Promise<WorkoutSessionItem[]> {
    const search = new URLSearchParams();
    if (params?.desde) search.append("desde", params.desde);
    if (params?.hasta) search.append("hasta", params.hasta);
    if (params?.routine_id) search.append("routine_id", params.routine_id);
    const qs = search.toString();
    const res: any = await request(
      `/tracking/sessions/history/${qs ? `?${qs}` : ""}`,
    );
    return Array.isArray(res) ? res : res?.results || [];
  },

  async getCompletedSessionsPaginated(params?: {
    page?: number;
    desde?: string;
    hasta?: string;
    routine_id?: string;
  }): Promise<PaginatedSessionsResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.append("page", String(params.page));
    if (params?.desde) search.append("desde", params.desde);
    if (params?.hasta) search.append("hasta", params.hasta);
    if (params?.routine_id) search.append("routine_id", params.routine_id);
    const qs = search.toString();
    const res: any = await request(
      `/tracking/sessions/history/${qs ? `?${qs}` : ""}`,
    );
    if (Array.isArray(res)) {
      return {
        count: res.length,
        next: null,
        previous: null,
        results: res,
      };
    }
    return {
      count: res?.count ?? (res?.results?.length || 0),
      next: res?.next || null,
      previous: res?.previous || null,
      summary: res?.summary,
      results: res?.results || [],
    };
  },

  async getWorkoutSessionDetail(
    sessionId: string,
  ): Promise<WorkoutSessionDetail> {
    return request<WorkoutSessionDetail>(`/tracking/sessions/${sessionId}/`);
  },

  async getRoutineSessionsSummary(params?: {
    desde?: string;
    hasta?: string;
    routine_id?: string;
  }): Promise<RoutineSessionSummaryItem[]> {
    const search = new URLSearchParams();
    if (params?.desde) search.append("desde", params.desde);
    if (params?.hasta) search.append("hasta", params.hasta);
    if (params?.routine_id) search.append("routine_id", params.routine_id);
    const qs = search.toString();
    const res: any = await request(
      `/tracking/sessions/routine-summary/${qs ? `?${qs}` : ""}`,
    );
    return Array.isArray(res) ? res : res?.results || [];
  },
};
