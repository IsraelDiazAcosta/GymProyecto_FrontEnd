# Reporte Completo de Cambios — Todas las Sesiones (Backend & Frontend)

**Fecha:** 13 de noviembre de 2026  
**Proyectos cubiertos:**
- **Backend:** `GymProyecto_BackEnd/Gym_Backend` (Django / DRF)
- **Frontend:** `GymProyecto_FrontEnd` (Expo / React Native)

Este reporte consolida **todo lo realizado en las 3 etapas / conversaciones de hoy**, desde los ajustes iniciales de interfaz, imágenes, favoritos y perfil, hasta la reorganización de Rutinas, el cronómetro de sesiones en vivo, el historial detallado en Progreso y las correcciones finales.

---

## Parte I — Resumen de Funcionalidades por Etapa (3 Conversaciones)

### Etapa 1 y 2: UI Base, Imágenes, Favoritos, Edición de Series y Perfil / Curva 1RM
1. **Navegación inferior (`Bottom Tab Bar`) y pantalla principal**:
   - Se reubicó `DashboardTabBar` en posición fija inferior con soporte de área segura (`useSafeAreaInsets` en `DashboardTabBar.tsx` y `SafeAreaView edges={["top", "left", "right"]}` en `src/app/index.tsx`).
   - Orden final de pestañas: **Máquinas** (`equipment`), **Catálogo** (`catalog`), **Rutinas** (`routines`, pestaña inicial), **Progreso** (`tracking`) y **Perfil** (`profile`).
2. **Sistema de diseño y paleta (`src/constants/theme.ts`)**:
   - Se consolidó el tema oscuro **Apex Emerald Gym** (`#080C0A`, `#111815`, `#18221E`, `#10B981`, texto blanco `#FFFFFF` en `text` y `onPrimary`, con `#2C5A4B`, `#947DB5` y `#E6FF3A` para detalles puntuales).
3. **Gestión, compresión y herencia de imágenes (Front + Back)**:
   - Frontend: captura/selección desde cámara o galería con compresión (`expo-image-picker`, `expo-image-manipulator`, `<Image cachePolicy="memory-disk" />` de `expo-image`), envío `multipart/form-data` (`buildMultipartBody` en `src/services/api.ts`) y herencia automática de imagen de máquina cuando un ejercicio no tiene imagen propia.
   - Backend: en `apps/catalog/models.py`, funciones `validate_image` (máx. 5 MB; `.jpg`, `.jpeg`, `.png`, `.webp`), `optimize_image` (`ImageOps.exif_transpose`, recorte máx. `1080x1080`, conversión a `WEBP` calidad `75`), `delete_old_file_on_update` y señal `@receiver(post_delete)` `auto_delete_image_on_delete`, además de `MEDIA_URL` / `MEDIA_ROOT` en `settings.py`.
4. **Máquinas favoritas**:
   - Backend: modelo `UserFavoriteEquipment` (`unique_together = ('user', 'equipment')`), anotación `is_favorite` con `Exists(...)` y `OuterRef('pk')` sin consultas N+1, y endpoints `POST /api/v1/catalog/equipment/<id>/favorite/` y `GET /api/v1/catalog/equipment/favorites/` en `EquipmentViewSet`.
   - Frontend: botón de corazón en `EquipmentSection.tsx` con actualización optimista (`handleToggleEquipmentFavorite` en `useGymDashboardData.ts`) y filtro **"Mis favoritas"**.
5. **Edición inline y en modal de series y repeticiones**:
   - Backend: soporte en `RoutineExerciseSerializer.update` para ajustar `sets_count`, `min_reps` y `max_reps` dentro de `@transaction.atomic` preservando atributos existentes (`target_rpe`, `target_rir`, `target_weight`, `set_type`) mediante `PATCH /routines/exercises/<id>/`.
   - Frontend: edición inline en `RoutineCard.tsx` y en `EditRoutineForm.tsx` / `useGymDashboardData.ts` (`handleUpdateRoutineExercise`).
6. **Perfil ampliado, peso corporal y cruce con 1RM**:
   - Backend: campo `training_goal` en `User`, modelo `BodyWeightLog`, vistas `BodyWeightLogListCreateView` (`GET/POST /auth/weight-logs/` sincronizando `current_weight`) y `Weight1RMProgressView` (`GET /tracking/progress/weight-1rm/`).
   - Frontend: `EditProfileForm.tsx` y `ProfileSection.tsx` con gráfica SVG dual comparando evolución de peso corporal y curva de 1RM estimado.

---

### Etapa 3: Rutinas, Gráfica Semanal, Cronómetro de Sesión, Historial en Progreso y Correcciones
1. **Reorganización visual de la pestaña "Rutinas"**:
   - Selector de dos sub-pestañas debajo del header: **"Crear"** y **"Mis Rutinas"** (iniciando en **"Mis Rutinas"**).
   - **"Mis Rutinas"**: cards compactas (`RoutineCard` con `compact={true}`), menú de 3 puntos conservado, estado vacío con botón **"Ir a Crear"** y vista de detalle al tocar una card (botón **"Volver a Mis Rutinas"**, listado de ejercicios, edición inline de series/reps y botón de agregar ejercicios).
   - Tras crear una rutina, limpia el formulario y cambia automáticamente a **"Mis Rutinas"**.
2. **Reubicación de 1RM y nueva gráfica "Entrenamientos de la semana"**:
   - Se movió `RMTrackingChart` ("Analítica de Fuerza / Evolución de 1RM Estimado") al final de **"Mis Rutinas"**.
   - En **"Crear"**, debajo de `CreateRoutineCard`, se agregó **"Entrenamientos de la semana"** con barras `Lun`–`Dom`, contador `X/7 días`, resaltado del día actual (`Hoy`), reinicio automático cada lunes 00:00 hora local, agrupación por fecha local (contando una sola vez por día) y estado vacío `"Aún no entrenas esta semana"`.
3. **Barra fija "Iniciar rutina" con timer en vivo (`HH:MM:SS`)**:
   - Componente fijo en la parte superior de **Rutinas** visible en **"Crear"** y **"Mis Rutinas"**.
   - Sin sesión activa: botón **"Iniciar rutina"** con modal selector de rutina (`POST /tracking/sessions/start/`).
   - Con sesión activa: nombre de la rutina, cronómetro calculado como `ahora - started_at` del servidor, **"Cancelar sesión"** (`POST /tracking/sessions/cancel/`) y **"Finalizar"** con confirmación (`POST /tracking/sessions/finish/`) y banner de resumen con duración total.
   - Recuperación automática al abrir la app (`GET /tracking/sessions/active/`) y manejo de ciclo de vida en segundo plano (`AppState`).
   - En detalle de cada rutina de **"Mis Rutinas"**, bloque **"Últimas sesiones"** con fecha local y duración.
4. **Nueva sección "Historial de rutinas" en la pestaña "Progreso"**:
   - Agregada debajo de `MarcaHistoryList` sin alterar las gráficas ni registros existentes de Progreso.
   - Resumen superior: sesiones totales, tiempo total entrenado y duración promedio en formato legible (ej. `1 h 15 min`).
   - Selector de vista: **"Sesiones"** (lista cronológica paginada de 20 en 20 con carga adicional, nombre, fecha local, duración, ejercicios, series y volumen) y **"Por rutina"** (cards agrupadas por rutina con sesiones, duración promedio, tiempo acumulado y última fecha realizada).
   - Filtros rápidos por periodo (`Esta semana`, `Este mes`, `Todo` en zona horaria local) y por rutina.
   - Modal de detalle al tocar una sesión con botón **Volver**, mostrando ejercicios realizados y sus series (`peso × reps`, `RPE`, `1RM`), o ejercicios planeados marcados como `"Sin registro de series"` cuando no hubo sets logueados.
   - Estado vacío (`"Aún no has completado rutinas"`), estados de carga y refresco automático al volver a Progreso o finalizar sesión.
5. **Solución de eliminación de ejercicios (`ProtectedError`) y error Metro SSR (`Unknown module 828`)**:
   - Backend: al eliminar ejercicios del catálogo ya usados en rutinas o sesiones ocurría un error `500 ProtectedError`. Se implementó `perform_destroy` atómico en `ExerciseViewSet` y se cambió `on_delete=models.CASCADE` en `RoutineExercise.exercise` y `WorkoutLogExercise.exercise`.
   - Frontend: `handleConfirmDelete` recarga rutinas al eliminar un ejercicio; además se integró `RoutineSessionHistorySection` dentro de `MarcaHistoryList.tsx` (re-exportado en `RoutineSessionHistorySection.tsx`) para evitar el error de módulo `828` en el bundler SSR de Metro sin necesidad de reiniciar Expo.

---

## Parte II — Detalle Archivo por Archivo en Backend (`GymProyecto_BackEnd/Gym_Backend`)

| Archivo | Estado | Qué se modificó y agregó |
| :--- | :--- | :--- |
| `Gym_Backend/settings.py` | Modificado | Configuración de `TIME_ZONE = 'America/Mexico_City'`, `MEDIA_URL = '/media/'`, `MEDIA_ROOT`, paginación DRF (`PAGE_SIZE = 20`) y SimpleJWT. |
| `apps/users/models.py` | Modificado / Agregado | Campo `training_goal` (`TRAINING_GOAL_CHOICES`) en `User`; nuevo modelo `BodyWeightLog` (`user`, `weight`, `date`, `created_at`). |
| `apps/users/views.py` | Modificado / Agregado | `BodyWeightLogListCreateView` para listar y crear registros de peso corporal del usuario autenticado, actualizando `user.current_weight`. |
| `apps/catalog/models.py` | Modificado / Agregado | `validate_image`, `optimize_image` (WebP + EXIF), `delete_old_file_on_update`, `@receiver(post_delete)` `auto_delete_image_on_delete`, y modelo `UserFavoriteEquipment`. |
| `apps/catalog/views.py` | Modificado | En `EquipmentViewSet`: anotación `is_favorite`, `toggle_favorite` (`POST favorite/`) y `list_favorites` (`GET favorites/`). En `ExerciseViewSet`: anotación de equipo favorito y **`perform_destroy`** con `transaction.atomic()` para borrar `routine_placements` y `logged_workouts` antes de `instance.delete()`. |
| `apps/routines/models.py` | Modificado | En `RoutineExercise.exercise`, cambio de `on_delete=models.PROTECT` a `on_delete=models.CASCADE`. |
| `apps/routines/serializers.py` | Modificado | Soporte en `RoutineExerciseSerializer` para crear/actualizar `target_sets` mediante `sets_count`, `min_reps` y `max_reps` dentro de `@transaction.atomic`. |
| `apps/routines/views.py` | Modificado | En `RoutineViewSet`: creación de rutinas con múltiples ejercicios (`_extract_exercise_ids`, `_add_exercises_to_day`) y acción `add-exercise`. |
| `apps/tracking/models.py` | Modificado | En `WorkoutSession`: `STATUS_CHOICES` (`active`, `completed`, `cancelled`), `routine` FK nullable, `start_time` con `default=timezone.now`, `duration_seconds`, `status`, y propiedades `started_at` / `ended_at`. En `WorkoutLogExercise`: cambio de `exercise` a `on_delete=models.CASCADE`. |
| `apps/tracking/migrations/0003_workoutsession_routine_status_duration.py` | **Nuevo** | Migración que añade `routine`, `duration_seconds`, `status`, altera `start_time` y ejecuta `sync_existing_sessions` (`RunPython`) sobre sesiones existentes. |
| `apps/tracking/serializers.py` | Modificado / Agregado | Ampliado `_WorkoutSessionCommonMixin`, `WorkoutSessionListSerializer` (`routine_detail`, `total_exercises`, `total_sets`, `total_volume`), `WorkoutSessionDetailSerializer` (`has_logged_sets`, `exercises` agrupados por ejercicio o planeados `"sin registro"`), y nuevo `CompletedWorkoutSessionSerializer`. |
| `apps/tracking/views.py` | Modificado / Agregado | `Weight1RMProgressView` (cruce fecha local peso/1RM); `_ensure_tracking_migrations()`; `CompletedSessionPagination` (20/pág.); optimización `select_related`/`prefetch_related` en `WorkoutSessionViewSet`; endpoints `start`, `finish`, `cancel`, `active`, `history` (paginado + `summary` + anotaciones SQL), `detail` (`session_detail`) y `routine-summary` (`routine_summary`). |
| `apps/tracking/urls.py` | Modificado | Registro explícito de `path('sessions/finish/', WorkoutSessionViewSet.as_view({'post': 'finish_active'}), name='workout-sessions-finish-active')` junto al router de tracking y rutas `progression/<uuid>/` y `progress/weight-1rm/`. |

---

## Parte III — Detalle Archivo por Archivo en Frontend (`GymProyecto_FrontEnd`)

| Archivo | Estado | Qué se modificó y agregó |
| :--- | :--- | :--- |
| `src/app/index.tsx` | Modificado | `SafeAreaView` con `edges={["top", "left", "right"]}` para integrarse correctamente con la barra de pestañas inferior fija. |
| `src/constants/theme.ts` | Modificado | Ajustes de paleta **Apex Emerald Gym** (`background`, `backgroundElement`, `backgroundElevated`, `primary`, `onPrimary`, `accent`, `secondary`, `emerald`). |
| `src/services/api.ts` | Modificado / Agregado | Carga de imágenes (`buildMultipartBody`, `pickAndCompressImage`, `resolveMediaUrl`); endpoints de peso/1RM (`getWeightLogs`, `createWeightLog`, `getWeight1RMProgress`); endpoints de favoritos y edición de rutinas; métodos de sesiones con timer (`startRoutineSession`, `finishRoutineSession`, `cancelRoutineSession`, `getActiveRoutineSession`, `getRoutineSessionHistory`) y métodos de historial detallado (`getCompletedSessionsPaginated`, `getWorkoutSessionDetail`, `getRoutineSessionsSummary`) con sus interfaces (`WorkoutSessionItem`, `WorkoutSessionDetail`, `RoutineSessionSummaryItem`, `PaginatedSessionsResponse`, etc.). |
| `src/hooks/useGymDashboardData.ts` | Modificado | Pestaña inicial `"routines"`; handlers de favoritos optimistas, edición inline de series/reps (`handleUpdateRoutineExercise`) y en `handleConfirmDelete`, recarga conjunta de `api.getExercises()` y `api.getRoutines()` al eliminar un ejercicio. |
| `src/components/dashboard/DashboardTabBar.tsx` | Modificado | Barra de navegación fija inferior (`position: "absolute", bottom: 0`), `useSafeAreaInsets`, nuevo orden de pestañas (`Máquinas`, `Catálogo`, `Rutinas`, `Progreso`, `Perfil`). |
| `src/components/dashboard/types.ts` | Modificado | Tipos compartidos de pestañas (`TabType`), colores (`DashboardColors`) y `RoutineExerciseItem`. |
| `src/components/ui/GymIcon.tsx` | Modificado | Iconografía vectorial Lucide/SVG utilizada en tabs, botones, temporizador, historial y modales. |
| `src/components/ui/AppButton.tsx` | Modificado | Estilos y variantes de botones reutilizables respetando el contraste `onPrimary`. |
| `src/components/dashboard/GymDashboard.tsx` | Modificado | Integración de la barra superior fija de sesión con timer `HH:MM:SS`, `AppState` y recuperación de sesión activa; sub-pestañas `"Crear"` y `"Mis Rutinas"`; gráfica **"Entrenamientos de la semana"**; vista compacta y detalle de rutina con **"Últimas sesiones"**; reubicación de `RMTrackingChart` al final de `"Mis Rutinas"`; integración de `<RoutineSessionHistorySection />` debajo de `<MarcaHistoryList />` en Progreso. |
| `src/components/dashboard/routines/RoutineCard.tsx` | Modificado | Props `compact` y `onPress` para modo card compacta en "Mis Rutinas", más edición inline de series y repeticiones en vista de detalle. |
| `src/components/dashboard/tracking/MarcaFormCard.tsx` | Conservado / Integrado | Tarjeta de registro de marca (peso, reps, RPE) en Progreso (sin alteraciones en su flujo). |
| `src/components/dashboard/tracking/MarcaHistoryList.tsx` | Modificado / Agregado | Conserva `MarcaHistoryList` intacto y exporta también **`RoutineSessionHistorySection`** ("Historial de rutinas": resumen superior, vistas `"Sesiones"` paginada y `"Por rutina"`, filtros por periodo y rutina, fechas locales, modal de detalle de ejercicios/series y manejo de sesiones sin registro). |
| `src/components/dashboard/tracking/RoutineSessionHistorySection.tsx` | **Nuevo (Re-export)** | Re-exporta `RoutineSessionHistorySection` y `RoutineSessionHistorySectionProps` desde `./MarcaHistoryList` para evitar colisión de módulos en Metro SSR. |
| `src/components/dashboard/equipment/EquipmentSection.tsx` y modales de equipo | Modificados | Soporte de favoritos (botón corazón y filtro "Mis favoritas") y carga/compresión de fotos de máquinas. |
| `src/components/dashboard/catalog/*` y `modals/*` | Modificados | Herencia de imágenes máquina->ejercicio, edición de ejercicios/rutinas y gestión de series en modal. |
| `src/components/dashboard/profile/EditProfileForm.tsx` y `ProfileSection.tsx` | Modificados | Campos de perfil (`training_goal`, peso, estatura, nivel) y sección de historial de peso corporal + gráfica SVG dual Peso / 1RM. |
| `docs/RESUMEN_IMPLEMENTACION.md` y `docs/REPORTE_CAMBIOS.md` | Actualizados / Nuevo | Documentación consolidada de las 3 conversaciones en la carpeta `docs` del Frontend. |
