# Resumen de Implementación — Apex Gym Hub (Front-End & Back-End)

**Fecha de actualización:** 13 de noviembre de 2026  
**Cobertura:** Consolidado completo de las 3 sesiones de trabajo de hoy (UI/Imágenes/Favoritos/Perfil + Rutinas/Asistencia Semanal/Timer + Historial en Progreso/Corrección de eliminación).

> Para el desglose técnico detallado por cada archivo y endpoint, consulta también [REPORTE_CAMBIOS.md](./REPORTE_CAMBIOS.md).

---

## 1. Navegación Inferior y Diseño (`Bottom Tab Bar` & Tema)

- **Ubicación fija inferior**: `DashboardTabBar` fijado en la parte inferior de `src/components/dashboard/GymDashboard.tsx`, respetando el área segura del dispositivo (`useSafeAreaInsets` en `DashboardTabBar.tsx` y `edges={["top", "left", "right"]}` en `src/app/index.tsx`).
- **Orden de pestañas (izquierda a derecha)**:
  1. **Máquinas** (`equipment`)
  2. **Catálogo** (`catalog`)
  3. **Rutinas** (`routines` — pestaña inicial por defecto en `useGymDashboardData.ts`)
  4. **Progreso** (`tracking`)
  5. **Perfil** (`profile`)
- **Sistema de diseño (`src/constants/theme.ts`)**: Tema oscuro **Apex Emerald Gym** (`#080C0A`, `#111815`, `#18221E`, `#10B981`, texto blanco `#FFFFFF`, con `#2C5A4B`, `#947DB5` y `#E6FF3A` para acentos menores).

---

## 2. Gestión de Imágenes, Favoritos de Máquinas, Edición de Series y Perfil / 1RM

### 2.1 Imágenes (Front-End + Back-End)
- **Front-End**: Selección/captura con compresión (máx. 1080px, calidad `0.7`), envío `multipart/form-data` (`buildMultipartBody` en `src/services/api.ts`), renderizado en caché con `expo-image` y herencia automática de imagen de máquina en ejercicios sin foto propia.
- **Back-End (`apps/catalog/models.py`, `Gym_Backend/settings.py`)**: Validación de tamaño (máx. 5 MB) y formato, `optimize_image` (`ImageOps.exif_transpose`, máx. `1080x1080`, `WEBP` calidad 75), `delete_old_file_on_update` y limpieza por señal `@receiver(post_delete)`.

### 2.2 Máquinas Favoritas
- **Back-End (`apps/catalog/models.py`, `apps/catalog/views.py`)**: Modelo `UserFavoriteEquipment`, anotación `is_favorite` con `Exists(...)` sin N+1, y endpoints `POST /api/v1/catalog/equipment/<id>/favorite/` y `GET /api/v1/catalog/equipment/favorites/`.
- **Front-End (`EquipmentSection.tsx`, `useGymDashboardData.ts`)**: Botón de corazón con actualización optimista (`handleToggleEquipmentFavorite`) y filtro **"Mis favoritas"**.

### 2.3 Edición Inline y en Modal de Series y Repeticiones
- **Back-End (`apps/routines/serializers.py`)**: Actualización atómica en `RoutineExerciseSerializer.update` para ajustar `sets_count`, `min_reps` y `max_reps` preservando datos de las series existentes (`PATCH /api/v1/routines/exercises/<id>/`).
- **Front-End (`RoutineCard.tsx`, `EditRoutineForm.tsx`, `useGymDashboardData.ts`)**: Edición directa en tarjeta de rutina y desde el modal de edición.

### 2.4 Perfil Ampliado + Peso Corporal y Curva 1RM
- **Back-End (`apps/users/models.py`, `apps/users/views.py`, `apps/tracking/views.py`)**: Campo `training_goal` en `User`, modelo `BodyWeightLog`, `BodyWeightLogListCreateView` (`/auth/weight-logs/`) y `Weight1RMProgressView` (`/tracking/progress/weight-1rm/`).
- **Front-End (`EditProfileForm.tsx`, `ProfileSection.tsx`)**: Edición de peso, estatura, objetivo y nivel, junto con registro de pesajes y gráfica SVG dual **Peso Corporal + Curva 1RM**.

---

## 3. Reorganización de Rutinas, Asistencia Semanal, Cronómetro e Historial en Progreso

### 3.1 Sub-pestañas en Rutinas y Asistencia Semanal
- **Sub-pestañas (`GymDashboard.tsx`)**: Selector **"Crear"** y **"Mis Rutinas"** (iniciando en **"Mis Rutinas"**).
- **Pestaña "Crear"**: `CreateRoutineCard` arriba y nueva tarjeta de barras **"Entrenamientos de la semana"** (`Lun`–`Dom`, contador `X/7 días`, marca del día `Hoy`, reinicio cada lunes 00:00 en hora local, estado vacío `"Aún no entrenas esta semana"`). Al crear una rutina, limpia el formulario y cambia a **"Mis Rutinas"**.
- **Pestaña "Mis Rutinas"**: Lista compacta (`RoutineCard` con `compact={true}`), menú de 3 puntos conservado, vista de detalle tocando la card (botón **"Volver a Mis Rutinas"**, ejercicios, agregar ejercicios y **"Últimas sesiones"**) y gráfica `RMTrackingChart` movida al final de **"Mis Rutinas"**.

### 3.2 Cronómetro de Sesión Activa ("Iniciar rutina")
- **Back-End (`apps/tracking/models.py`, `migrations/0003_workoutsession_routine_status_duration.py`, `views.py`, `urls.py`)**:
  - `WorkoutSession` ampliado con `routine`, `duration_seconds`, `status` (`active`/`completed`/`cancelled`) y propiedades `started_at` / `ended_at`.
  - Endpoints `POST /sessions/start/`, `POST /sessions/finish/`, `POST /sessions/cancel/`, `GET /sessions/active/` y `GET /sessions/history/`.
- **Front-End (`GymDashboard.tsx`, `src/services/api.ts`)**:
  - Barra superior fija en **Rutinas** con **"Iniciar rutina"** (selector de rutina), timer `HH:MM:SS` calculado como `ahora - started_at`, **"Cancelar sesión"**, **"Finalizar"** con modal de confirmación y resumen de duración.
  - Recuperación al abrir la app vía `GET active` y manejo de segundo plano mediante `AppState`.

### 3.3 Sección "Historial de rutinas" en Progreso
- **Back-End (`apps/tracking/serializers.py`, `apps/tracking/views.py`)**:
  - `GET /api/tracking/sessions/history/` paginado (20 por página, más recientes primero) con filtros `desde`, `hasta`, `routine_id`, totales globales `summary` (`total_sessions`, `total_duration_seconds`, `average_duration_seconds`) y agregaciones optimizadas por sesión (`total_exercises`, `total_sets`, `total_volume`).
  - `GET /api/tracking/sessions/<id>/` y `/detail/` (`WorkoutSessionDetailSerializer`): ejercicios realizados con series (`set_number`, `weight`, `reps`, `rpe`, `estimated_1rm`) o planeados como `"sin registro"`.
  - `GET /api/tracking/sessions/routine-summary/` (`routine_summary`): conteo de sesiones, duración promedio, total y última fecha por rutina.
- **Front-End (`src/components/dashboard/tracking/MarcaHistoryList.tsx` -> `RoutineSessionHistorySection`, `GymDashboard.tsx`)**:
  - Agregada debajo de `MarcaHistoryList` sin alterar las tarjetas de marcas existentes.
  - Resumen superior (`Sesiones`, `Tiempo total`, `Promedio` en formato `1 h 15 min`), vistas **"Sesiones"** y **"Por rutina"**, filtros por periodo (`Esta semana`, `Este mes`, `Todo`) y rutina, fechas en hora local, paginación (`Cargar más sesiones`), estado vacío (`"Aún no has completado rutinas"`) y modal de detalle con botón **Volver**.

### 3.4 Correcciones Aplicadas
- **Eliminación de ejercicios protegidos (`ProtectedError`)**:
  - `ExerciseViewSet.perform_destroy` en `apps/catalog/views.py` elimina previamente referencias en `routine_placements` y `logged_workouts`; `on_delete=models.CASCADE` en `RoutineExercise.exercise` (`apps/routines/models.py`) y `WorkoutLogExercise.exercise` (`apps/tracking/models.py`); y recarga de rutinas en `useGymDashboardData.ts` (`handleConfirmDelete`).
- **Recarga en Metro SSR (`Requiring unknown module "828"`)**:
  - Se exportó `RoutineSessionHistorySection` directamente desde `src/components/dashboard/tracking/MarcaHistoryList.tsx` (manteniendo re-exportación en `RoutineSessionHistorySection.tsx`) y se actualizó su importación en `GymDashboard.tsx`.

---

## 4. Índice General de Archivos Tocados (Front-End & Back-End)

### Back-End (`GymProyecto_BackEnd/Gym_Backend`)
- `Gym_Backend/settings.py`
- `apps/users/models.py`, `apps/users/views.py`
- `apps/catalog/models.py`, `apps/catalog/views.py`
- `apps/routines/models.py`, `apps/routines/serializers.py`, `apps/routines/views.py`
- `apps/tracking/models.py`, `apps/tracking/migrations/0003_workoutsession_routine_status_duration.py`, `apps/tracking/serializers.py`, `apps/tracking/views.py`, `apps/tracking/urls.py`

### Front-End (`GymProyecto_FrontEnd`)
- `src/app/index.tsx`
- `src/constants/theme.ts`
- `src/services/api.ts`
- `src/hooks/useGymDashboardData.ts`
- `src/components/ui/AppButton.tsx`, `src/components/ui/GymIcon.tsx`
- `src/components/dashboard/DashboardTabBar.tsx`, `src/components/dashboard/GymDashboard.tsx`, `src/components/dashboard/types.ts`
- `src/components/dashboard/routines/RoutineCard.tsx`
- `src/components/dashboard/tracking/MarcaFormCard.tsx`, `src/components/dashboard/tracking/MarcaHistoryList.tsx`, `src/components/dashboard/tracking/RoutineSessionHistorySection.tsx`
- `src/components/dashboard/equipment/*`, `src/components/dashboard/catalog/*`, `src/components/dashboard/modals/*`, `src/components/dashboard/profile/*`
- `docs/RESUMEN_IMPLEMENTACION.md`, `docs/REPORTE_CAMBIOS.md`
