# Documentación de Plan e Implementación: Sistema de Apariencia, Ajustes e Idioma — Apex Gym Hub

**Fecha:** 20 de noviembre de 2026  
**Repositorio:** `GymProyecto_FrontEnd`  
**Alcance implementado:** Fase 0 (Análisis), Fase 1 (Planificación), Fase 2 (**Apariencia** y **Panel de Ajustes**) y Fase 3 (**Idioma / i18n**).

---

## 1. Objetivo y Reglas de Diseño

Se incorporó un botón de **Ajustes** (ícono de tuerca `cog`) en la esquina superior derecha de la tarjeta principal de **Perfil**, el cual abre el panel de configuración con dos bloques en orden estricto:

1. **Apariencia (implementado en Fase 2):**
   - **Modo de pantalla:** `Oscuro`, `Claro` o `Sistema` ("Seguir el sistema", reactivo en vivo).
   - **Color de acento:** selector de **5 paletas** combinables libremente con cualquier modo (`Claro + Azul Océano`, `Oscuro + Naranja Energía`, etc.).
2. **Idioma (preparado en Fase 2 e implementado en Fase 3 — ver Sección 8):**
   - Selector de idioma integrado en Ajustes con **3 opciones** (`Español` por defecto, `English` y `Sistema`), detección automática del entorno vía `Intl` y persistencia compartida en `@apex_gym_preferences`.

### Restricciones respetadas
- **Cero cambios en lógica de negocio ni endpoints:** autenticación (`AuthContext.tsx`), roles (`Administrador del Gimnasio` / `Atleta`), llamadas a la API (`api.ts`), almacenamiento de sesión (`storage.ts`), validación muscular (`muscleValidation.ts`), configuración nativa (`app.json`) y backend (`GymProyecto_BackEnd`) quedaron intactos. *(En Fase 3 únicamente se conectaron textos de interfaz/toasts en `useGymDashboardData.ts` al diccionario activo sin alterar payloads ni peticiones HTTP).*
- **Cero dependencias nuevas:** se reutilizaron `@react-native-async-storage/async-storage`, `expo-status-bar`, `expo-system-ui` y `react-native-svg`, todas ya instaladas en `package.json`.
- **Diseño por defecto en modo oscuro neutro:** la combinación inicial `Oscuro + Esmeralda` mantiene el acento verde esmeralda (`#10B981`) y tipografía blanca (`#FFFFFF`), con superficies negras/carbón 100% neutras sin tinte verdoso (`#0A0A0A`, `#141414`, `#1F1F1F`, `#1E1E1E`, `#A3A3A3`).

---

## 2. Resumen de Análisis Inicial (Fase 0)

| Aspecto | Hallazgo |
| :--- | :--- |
| **Stack** | Expo `~58.0.17`, React Native `0.88.0`, React `19.3.0`, TypeScript `~6.0.3` (`strict: true`), `react-native-svg` `15.16.0`, `@react-native-async-storage/async-storage` `2.2.0`. |
| **Navegación** | `src/app/_layout.tsx` → `HomeScreen` (`src/app/index.tsx`) → `LoginForm` o `GymDashboard`. Dentro de `GymDashboard.tsx`, las 5 pestañas (`Máquinas`, `Catálogo`, `Rutinas`, `Progreso`, `Perfil`) cambian mediante `vm.activeTab` y `DashboardTabBar.tsx`; las pantallas secundarias usan `<Modal>` nativos. |
| **Estado previo de colores** | `src/constants/theme.ts` asignaba tanto `Colors.light` como `Colors.dark` al mismo objeto `originalDarkTheme`. Las 5 pestañas y 10 modales ya recibían `colors` por props desde `GymDashboard.tsx`, mientras 7 archivos (`_layout.tsx`, `index.tsx`, `LoginForm.tsx`, `GymDashboard.tsx`, `AppButton.tsx`, `AppInput.tsx`, `AnimatedToast.tsx`) leían `useColorScheme()` directamente. |
| **Colores fijos detectados** | Referencias directas a `Palette.*` en `ExerciseDetailModal.tsx` (`Palette.emeraldBase`, `Palette.textOnVolt`), `CatalogSection.tsx`, `EquipmentSection.tsx`, `ProfileSection.tsx` y `ItemActionSheet.tsx` (`Palette.lilacBorder`); `#FFFFFF` fijo en `AppButton.tsx`; tabla `TOAST_THEMES` en `AnimatedToast.tsx`; `colors.accent` (`#E6FF3A` invisible sobre blanco) en `ProfileSection.tsx`; y `TextInput` sin `placeholderTextColor` en `RoutineCard.tsx` y `EditRoutineForm.tsx`. |
| **Almacenamiento local** | `src/services/storage.ts` usa `AsyncStorage` con 3 claves de sesión (`@gym_access_token`, `@gym_refresh_token`, `@gym_user_data`) limpiadas en `clearAuth()`. |
| **Elementos nativos** | `app.json` ya tenía `"userInterfaceStyle": "automatic"`, pero faltaban `<StatusBar />` dinámico, sincronización de `SystemUI.setBackgroundColorAsync` y control explícito vía `Appearance.setColorScheme`. |

---

## 3. Plan de Arquitectura Implementado (Fase 1 → Fase 2)

El sistema desacopla dos ejes ortogonales combinados en tiempo real mediante la función pura `buildThemeColors(resolvedMode, accent)`:

1. **Eje de Modo (`ThemeMode = "dark" | "light" | "system"`):** controla superficies base (`background`, `backgroundElement`, `backgroundElevated`), textos (`text`, `textSecondary`, `onAccent`), bordes neutros (`borderSubtle`), `overlay`, `handleBar`, estados (`danger`, `warning`, `success`) y fondos de toast.
   - En **modo claro**, las superficies usan tonos pizarra/neutros (`#F4F6F8`, `#FFFFFF`, `#EEF1F5`) en lugar de verdosos para garantizar armonía visual con cualquiera de los 5 acentos.
2. **Eje de Acento (`AccentId = "emerald" | "ocean" | "amber" | "violet" | "crimson"`):** controla `primary`, `primaryLight`, `primaryDark`, `primaryGlow`, `border`, `backgroundSelected` y `onPrimary`, con variantes calibradas por modo para cumplir contraste **WCAG AA (≥ 4.5:1)** tanto en claro como en oscuro.
3. **Concatenación hex segura:** todos los tokens `primary`, `primaryLight`, `primaryDark`, `danger`, `warning` y `success` se mantienen como códigos hex de 6 dígitos (`#RRGGBB`), preservando la compatibilidad con expresiones existentes como `colors.danger + "40"`.

---

## 4. Inventario Exacto de Archivos Creados y Modificados

### 4.1 Archivos creados (4 archivos)

| Archivo | Propósito y detalle |
| :--- | :--- |
| [src/services/preferences.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/services/preferences.ts) | Persistencia en `AsyncStorage` bajo la clave independiente `@apex_gym_preferences`. Valida `themeMode` y `accentId`, protege contra JSON corrupto y conserva el campo opcional `language?: string` para la Fase 3. |
| [src/context/ThemeContext.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/context/ThemeContext.tsx) | Proveedor `AppThemeProvider` y hook `useAppTheme()`. Hidrata preferencias al iniciar, escucha cambios del sistema en vivo (`Appearance.addChangeListener` + `AppState`), sincroniza `Appearance.setColorScheme` y `SystemUI.setBackgroundColorAsync` en nativo, y memoriza `buildThemeColors(resolvedMode, accent)`. |
| [src/components/dashboard/profile/SettingsModal.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/profile/SettingsModal.tsx) | Modal deslizable de **Ajustes** con vista previa en vivo, selector segmentado de Modo (`Oscuro`, `Claro`, `Sistema` con indicador del modo actual del teléfono), selector de las 5 paletas de acento, botón para restablecer valores por defecto y bloque preparado de **Idioma (Próximamente)**. |
| [docs/DOCUMENTACION_APARIENCIA_Y_AJUSTES.md](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/docs/DOCUMENTACION_APARIENCIA_Y_AJUSTES.md) | Este documento técnico con el análisis, plan, arquitectura, tabla de colores y guía de verificación. |

### 4.2 Archivos modificados (18 archivos)

| Archivo | Cambio realizado |
| :--- | :--- |
| [src/constants/theme.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/constants/theme.ts) | Se añadieron tipos (`ThemeMode`, `ResolvedThemeMode`, `AccentId`, `ThemeColors`), bases `DARK_BASE` (exacta al diseño original) y `LIGHT_BASE`, catálogo `ACCENT_PALETTES` / `ACCENT_LIST` (5 paletas) y `buildThemeColors(mode, accent)`. |
| [src/components/dashboard/types.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/types.ts) | Se actualizó `DashboardColors` al tipo `ThemeColors` para admitir cualquier combinación de modo + acento. |
| [src/hooks/use-theme.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/hooks/use-theme.ts) | Se conectó `useTheme()` con `useAppTheme().colors` para mantener consistencia en componentes que usan este hook. |
| [src/app/_layout.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/app/_layout.tsx) | Se envolvió la app en `AppThemeProvider`, se actualizó `ThemeProvider` de `expo-router` con los colores del tema activo y se añadió `<StatusBar style={resolvedMode === "dark" ? "light" : "dark"} animated />`. |
| [src/app/index.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/app/index.tsx) | Se migró de `useColorScheme()` + `Colors[scheme]` a `useAppTheme().colors`. |
| [src/components/auth/LoginForm.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/auth/LoginForm.tsx) | Se migró a `useAppTheme()` (`colors`, `resolvedMode`) y se suavizó `shadowOpacity` en modo claro (`0.08` vs `0.18`). |
| [src/components/ui/AppButton.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/ui/AppButton.tsx) | Se migró a `useAppTheme()` y se reemplazó el literal `"#FFFFFF"` en `getTextColor()` por `colors.onPrimary`. |
| [src/components/ui/AppInput.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/ui/AppInput.tsx) | Se migró de `useColorScheme()` + `Colors[scheme]` a `useAppTheme().colors`. |
| [src/components/ui/AnimatedToast.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/ui/AnimatedToast.tsx) | Se migró a `useAppTheme()` y se reemplazaron los hex fijos de `TOAST_THEMES` por `getToastTheme()` basado en tokens semánticos (`colors.toast*Bg`, `colors.primary`, `colors.success`, `colors.danger`, `colors.warning`). |
| [src/components/ui/GymIcon.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/ui/GymIcon.tsx) | Se agregaron los 5 íconos vectoriales necesarios para Ajustes (`sun`, `moon`, `smartphone`, `palette`, `globe`) sin alterar los 44 íconos existentes. |
| [src/components/dashboard/GymDashboard.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/GymDashboard.tsx) | Se reemplazó `useColorScheme()` + `Colors[scheme]` por `useAppTheme().colors`, propagando el tema dinámico a las 5 pestañas y 10 modales. |
| [src/components/dashboard/profile/ProfileSection.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/profile/ProfileSection.tsx) | Se agregó el botón de tuerca (`cog`) en la esquina superior derecha de `heroCard`, se montó `<SettingsModal />` y se retiró el estilo estático redundante `Palette.textOnVolt`. |
| [src/components/dashboard/catalog/ExerciseDetailModal.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/catalog/ExerciseDetailModal.tsx) | Se reemplazó `Palette.emeraldBase` en `imageWrapper` por `colors.backgroundElevated` y `Palette.textOnVolt` en `stepNumberText` / `videoOverlayText` por `colors.onPrimary`. |
| [src/components/dashboard/catalog/CatalogSection.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/catalog/CatalogSection.tsx) | Se eliminó la referencia redundante `Palette.textOnVolt` en `styles.addBtnText` (ya utiliza `colors.onPrimary` inline). |
| [src/components/dashboard/equipment/EquipmentSection.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/equipment/EquipmentSection.tsx) | Se eliminó la referencia redundante `Palette.textOnVolt` en `styles.addBtnText` (ya utiliza `colors.onPrimary` inline). |
| [src/components/dashboard/modals/ItemActionSheet.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/modals/ItemActionSheet.tsx) | Se reemplazó `Palette.lilacBorder` del tirador `handleBar` por `colors.handleBar`. |
| [src/components/dashboard/routines/RoutineCard.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/routines/RoutineCard.tsx) | Se agregó `placeholderTextColor={colors.textSecondary}` a los 3 `TextInput` numéricos de edición inline. |
| [src/components/dashboard/modals/edit-forms/EditRoutineForm.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/modals/edit-forms/EditRoutineForm.tsx) | Se agregó `placeholderTextColor={colors.textSecondary}` a los 6 `TextInput` numéricos de series/repeticiones. |

---

## 5. Tabla de Colores Semánticos y Paletas de Acento

### 5.1 Tokens base (con acento Esmeralda por defecto)

| Token semántico | Modo Oscuro (`dark` + `emerald`) | Modo Claro (`light` + `emerald`) | Uso |
| :--- | :--- | :--- | :--- |
| `background` | `#0A0A0A` | `#F4F6F8` | Fondo raíz y SafeArea |
| `backgroundElement` | `#141414` | `#FFFFFF` | Tarjetas, Header, TabBar inferior y Modales |
| `backgroundElevated` | `#1F1F1F` | `#EEF1F5` | Inputs, buscadores, chips inactivos, lienzos SVG |
| `backgroundSelected` | `#1E1E1E` | `#D1FAE5` | Superficies seleccionadas y botón `secondary` |
| `text` | `#FFFFFF` | `#0F172A` *(17.85:1 sobre blanco)* | Títulos, valores y texto principal |
| `textSecondary` | `#A3A3A3` | `#475569` *(7.58:1 sobre blanco)* | Subtítulos, etiquetas y pestañas inactivas |
| `onPrimary` | `#FFFFFF` | `#FFFFFF` | Texto e íconos sobre botones/tabs primarios |
| `onAccent` | `#FFFFFF` | `#FFFFFF` | Texto sobre acento secundario |
| `primary` | `#10B981` | `#047857` *(5.48:1 sobre blanco)* | Color principal activo |
| `primaryLight` | `#34D399` | `#10B981` | Bordes activos |
| `primaryDark` | `#059669` | `#065F46` | Variante intensa |
| `primaryGlow` | `rgba(16, 185, 129, 0.16)` | `rgba(4, 120, 87, 0.12)` | Fondos suaves de badges y pills |
| `border` | `rgba(52, 211, 153, 0.16)` | `rgba(4, 120, 87, 0.24)` | Bordes destacados con tinte de acento |
| `borderSubtle` | `rgba(255, 255, 255, 0.09)` | `rgba(15, 23, 42, 0.10)` | Divisiones y bordes de tarjetas |
| `accent` | `#E6FF3A` | `#B45309` *(5.02:1 sobre blanco)* | Ícono de favoritos en Perfil |
| `emerald` | `#2C5A4B` | `#065F46` | Detalle secundario |
| `secondary` | `#947DB5` | `#6D28D9` | Detalle secundario |
| `secondaryGlow` | `rgba(148, 125, 181, 0.18)` | `rgba(109, 40, 217, 0.12)` | Halo secundario |
| `success` | `#10B981` | `#047857` | Estados de éxito |
| `warning` | `#F59E0B` | `#B45309` | Advertencias |
| `warningGlow` | `rgba(245, 158, 11, 0.16)` | `rgba(180, 83, 9, 0.12)` | Fondo de banners de advertencia |
| `danger` | `#F43F5E` | `#DC2626` *(4.83:1 sobre blanco)* | Acciones destructivas y errores |
| `dangerGlow` | `rgba(244, 63, 94, 0.16)` | `rgba(220, 38, 38, 0.11)` | Fondo de alertas de error |
| `overlay` | `rgba(0, 0, 0, 0.75)` | `rgba(15, 23, 42, 0.50)` | Fondo translúcido detrás de modales |
| `handleBar` | `rgba(255, 255, 255, 0.22)` | `rgba(15, 23, 42, 0.18)` | Tirador superior de hojas modales |
| `toastSuccessBg` / `ErrorBg` / `WarningBg` / `InfoBg` | `#1A1A1A` / `#2A1219` / `#291E0C` / `#1A1A1A` | `#ECFDF5` / `#FFF1F2` / `#FFFBEB` / `#F8FAFC` | Fondos del `AnimatedToast` |

### 5.2 Las 5 paletas de acento

| ID | Nombre | Oscuro (`primary` / `primaryLight` / `selected`) | Claro (`primary` / `primaryLight` / `selected`) | Contraste en Claro vs `#FFFFFF` |
| :--- | :--- | :--- | :--- | :--- |
| `emerald` | **Esmeralda (Por defecto)** | `#10B981` / `#34D399` / `#1E1E1E` | `#047857` / `#10B981` / `#D1FAE5` | **5.48:1** |
| `ocean` | **Azul Océano** | `#3B82F6` / `#60A5FA` / `#15243D` | `#1D4ED8` / `#3B82F6` / `#DBEAFE` | **6.70:1** |
| `amber` | **Naranja Energía** | `#EA580C` / `#FB923C` / `#331D12` | `#C2410C` / `#EA580C` / `#FFEDD5` | **5.18:1** |
| `violet` | **Morado Eléctrico** | `#8B5CF6` / `#A78BFA` / `#251B3D` | `#6D28D9` / `#8B5CF6` / `#EDE9FE` | **7.10:1** |
| `crimson` | **Rojo Carmesí** | `#F43F5E` / `#FB7185` / `#35161F` | `#BE123C` / `#E11D48` / `#FFE4E6` | **6.29:1** |

---

## 6. Comportamiento en Vivo, Persistencia y Fase 3

### 6.1 Cómo funciona "Seguir el sistema"
- En `src/context/ThemeContext.tsx`, al elegir `Sistema`, la app llama `Appearance.setColorScheme("auto")` (en iOS/Android) y lee inmediatamente `Appearance.getColorScheme()` para evitar desfasajes si el sistema cambió mientras había un override manual previo.
- Además mantiene dos suscripciones activas mientras el modo sea `"system"`:
  1. `Appearance.addChangeListener(...)` — reacciona al instante si el usuario alterna Claro/Oscuro desde el Centro de Control / Ajustes del teléfono.
  2. `AppState.addEventListener("change", ...)` — vuelve a consultar `Appearance.getColorScheme()` al regresar la app a primer plano (`"active"`).
- La barra de estado (`<StatusBar />`) y el fondo raíz nativo (`SystemUI.setBackgroundColorAsync`) se actualizan automáticamente en cada cambio.

### 6.2 Persistencia y compatibilidad con instalaciones previas
- Se almacena en `AsyncStorage` bajo la clave `@apex_gym_preferences` con formato:
  ```json
  { "version": 1, "themeMode": "dark", "accentId": "emerald" }
  ```
- Si un usuario ya tiene la app instalada sin esa clave, `preferencesStorage.load()` devuelve `DEFAULT_PREFERENCES` (`dark` + `emerald`), manteniendo intacta su experiencia actual.
- `storage.clearAuth()` solo elimina las 3 claves de sesión; al cerrar sesión, el tema elegido permanece activo incluso en la pantalla de Login.

### 6.3 Evolución de Idioma hacia Fase 3
- En Fase 2, `AppPreferences` reservó `language?: string` y `SettingsModal.tsx` mostró una tarjeta secundaria deshabilitada (`"Próximamente"`).
- En **Fase 3** (documentada en la **Sección 8**), ese campo pasó a ser `language: LanguageMode` (`"es" | "en" | "system"` con valor inicial `"es"`) y el bloque quedó conectado en vivo con `LanguageContext`.

---

## 7. Verificación Técnica y Lista de Verificación Manual

### 7.1 Validación estática ejecutada
- `npx tsc --noEmit` ejecutado sin errores (`exit code 0`).
- Verificación de ausencia de `Palette.*` residuales en los 5 componentes migrados y ausencia de lecturas locales a `useColorScheme()` / `Colors[scheme]` en los 7 consumidores migrados.

### 7.2 Checklist de pruebas manuales recomendadas

#### Regresión funcional (configuración por defecto: Oscuro + Esmeralda)
- [ ] **Login y sesión:** iniciar sesión, cerrar sesión y reabrir la app con sesión guardada.
- [ ] **Máquinas:** buscar, filtrar por categoría y marcar/desmarcar favoritas; abrir menú de opciones (`ItemActionSheet`) y creación (`AddEquipmentModal`).
- [ ] **Catálogo:** buscar ejercicios, filtrar por músculo/favoritos, abrir ficha técnica (`ExerciseDetailModal`) y verificar pasos numerados e imagen.
- [ ] **Rutinas:** alternar `Mis Rutinas` / `Crear`, editar series/reps inline, abrir `EditItemModal` y verificar tarjetas de asistencia semanal.
- [ ] **Progreso:** iniciar sesión de rutina, registrar una marca, ver gráfica `RMTrackingChart`, finalizar/cancelar sesión y revisar historial.
- [ ] **Perfil:** editar perfil (`EditProfileForm`), registrar peso corporal y probar **"Auditar Directorio de Usuarios (API)"** como Administrador del Gimnasio.

#### Apariencia, Ajustes y Legibilidad
- [ ] Tocar la tuerca superior derecha en **Perfil** y confirmar que abre el panel **Ajustes** sin desplazar el avatar ni el modo edición.
- [ ] Probar **Claro + Azul Océano**, **Oscuro + Naranja Energía**, **Claro + Morado Eléctrico**, **Oscuro + Rojo Carmesí** y **Claro + Esmeralda** en las 5 pestañas (`Máquinas`, `Catálogo`, `Rutinas`, `Progreso`, `Perfil`), Login y al menos un modal por pestaña.
- [ ] Comprobar legibilidad en modo claro: títulos, subtítulos, bordes de inputs, ícono de favoritos (`sparkles`), barra inferior (`DashboardTabBar`), barra de estado (`StatusBar` con íconos oscuros sobre fondo claro) y toasts (`AnimatedToast`).
- [ ] Seleccionar **Sistema**, cambiar el tema del teléfono entre claro y oscuro mientras la app está abierta y confirmar que la interfaz y el `StatusBar` responden en vivo.
- [ ] Elegir una combinación distinta a la predeterminada (ej. Claro + Morado), cerrar completamente la app y volver a abrirla para validar persistencia; luego cerrar sesión y confirmar que el Login conserva el tema elegido.

---

## 8. Fase 3: Sistema de Idioma (i18n)

### 8.1 Plan y alcance implementado
Se implementó soporte bilingüe completo (**Español** e **Inglés**) más detección automática del sistema operativo/navegador desde la sección **Idioma** dentro de `SettingsModal.tsx`:

1. **Modos disponibles (`LanguageMode`):**
   - `es` (**Español — por defecto**): conserva exactamente el comportamiento y los textos iniciales de la app, incluyendo usuarios con instalaciones previas sin preferencias guardadas.
   - `en` (**English**): traduce todas las pantallas, pestañas, modales, formularios, gráficas, alertas, notificaciones toast y pantallas de login/carga.
   - `system` (**Seguir el sistema / Follow system**): detecta el idioma del dispositivo con `Intl.DateTimeFormat().resolvedOptions().locale` (sin librerías nativas nuevas ni cambios en `package.json` / `app.json`): si empieza por `"en"` resuelve a `"en"`, y en caso contrario usa `"es"`. Se reevalúa automáticamente al volver la app a primer plano mediante `AppState`.
2. **Cambio instantáneo en vivo y persistente:** al pulsar un idioma en Ajustes se actualiza toda la interfaz al instante sin reiniciar sesión ni recargar datos del servidor, guardándose en `AsyncStorage` bajo la clave unificada `@apex_gym_preferences`.

### 8.2 Arquitectura técnica de i18n
- **Tipos base ([src/i18n/types.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/i18n/types.ts)):** define `LanguageMode = "es" | "en" | "system"`, `ResolvedLanguage = "es" | "en"` y `TranslationParams`.
- **Diccionario maestro ([src/i18n/es.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/i18n/es.ts)) y traducción estricta ([src/i18n/en.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/i18n/en.ts)):** `TranslationDictionary = Record<TranslationKey, string>` exige en tiempo de compilación que `en.ts` tenga exactamente el 100 % de las claves definidas en `es.ts`.
- **Motor y helpers de dominio ([src/i18n/index.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/i18n/index.ts)):**
  - `translate(lang, key, params?)`: interpolación segura de placeholders `{{param}}` con respaldo al diccionario en español.
  - `detectSystemLanguage()`: detección multiplataforma (iOS, Android y Web) mediante `Intl`.
  - `LOCALE_MAP` (`"es-ES"` / `"en-US"`), `WEEK_DAYS_BY_LANG` y `MONTHS_SHORT_BY_LANG` para formato consistente de fechas y calendarios semanales.
  - Helpers de etiquetas dinámicas sin mutar valores internos: `getExperienceLevelLabel`, `getTrainingGoalLabel`, `getEquipmentTypeLabel`, `getMuscleFocusLabel` y `getAccentMeta`.
- **Proveedor global ([src/context/LanguageContext.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/context/LanguageContext.tsx)):** expone `LanguageProvider` y el hook `useLanguage()` (`languageMode`, `language`, `systemLanguage`, `locale`, `isHydrated`, `t`, `setLanguageMode`, `resetLanguage`), montado en [src/app/_layout.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/app/_layout.tsx) inmediatamente por encima de `RootLayoutContent`.
- **Persistencia ampliada ([src/services/preferences.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/services/preferences.ts)):** valida `language` con `isValidLanguageMode` (respaldo seguro a `"es"`), mantiene intactos `themeMode` y `accentId` en `resetLanguage()` y preserva `language` en `resetAppearance()`.

### 8.3 Protecciones críticas de API, registros y lógica de negocio
Para garantizar que activar el idioma inglés **no rompa peticiones al backend, validaciones ni registros**:

1. **Desacople del toast de creación de rutina:** `GymDashboard.tsx` anteriormente detectaba el éxito comparando el título visible `vm.toast.title === "Rutina Creada"`. Se añadió el campo opcional `code?: string` en `ToastConfig` ([AnimatedToast.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/ui/AnimatedToast.tsx)), `useGymDashboardData.ts` emite `code: "routine_created"` al crear rutinas y `GymDashboard.tsx` evalúa `vm.toast.code === "routine_created"`, funcionando idénticamente en español e inglés.
2. **Claves internas y payloads intactos:** todos los identificadores enviados al backend o usados para filtrar/validar se mantienen exactamente en su formato canónico:
   - Enfoques musculares y validación (`muscleValidation.ts` intacto): `"pecho" | "espalda" | "pierna" | "hombro" | "brazo" | "core" | "fullbody"`.
   - Tipos de máquina: `"plate_loaded" | "pin_selected" | "cable" | "smith" | "free_weight" | "bodyweight" | "cardio" | "accessory"`.
   - Perfil (`api.ts` intacto): niveles `"beginner" | "intermediate" | "advanced"` y objetivos `"hypertrophy" | "strength" | "weight_loss" | "endurance" | "general_fitness"`.
   - Filtros y sub-pestañas locales: `"mis_rutinas" | "crear"`, `"week" | "month" | "all"`, `"sessions" | "by_routine"`, `"all" | "favorites"`.
3. **Fechas y estados de error reactivos:** todas las llamadas a `.toLocaleDateString()` reciben `locale` (`"es-ES"` / `"en-US"`), y `RoutineSessionHistorySection` ([MarcaHistoryList.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/components/dashboard/tracking/MarcaHistoryList.tsx)) almacena errores como booleanos (`hasLoadError`, `hasDetailError`) para que su mensaje cambie de idioma al instante si el usuario alterna ajustes.
4. **Higiene de hooks y variables:** en `ExerciseDetailModal.tsx` se ubicó `matchedEquipment = useMemo(...)` antes del `return null` temprano para respetar el orden fijo de React Hooks, y en los listados que iteraban con `.map((t) => ...)` (`EquipmentSection.tsx`, `AddEquipmentModal.tsx`, `EditEquipmentForm.tsx`) se renombró el parámetro de iteración a `item` / `typeOpt` para no sombrear la función `t()` de `useLanguage()`.
5. **Cero dependencias ni cambios en backend:** `GymProyecto_BackEnd`, `package.json`, `package-lock.json`, `app.json`, `src/services/api.ts`, `src/services/storage.ts` y `src/context/AuthContext.tsx` no fueron modificados.

### 8.4 Inventario de archivos de la Fase 3

#### Archivos creados (5 archivos nuevos en `src/`)
- [src/i18n/types.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/i18n/types.ts)
- [src/i18n/es.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/i18n/es.ts)
- [src/i18n/en.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/i18n/en.ts)
- [src/i18n/index.ts](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/i18n/index.ts)
- [src/context/LanguageContext.tsx](file:///C:/Users/idiaz/Music/Proyecto%20Final/GymProyecto_FrontEnd/src/context/LanguageContext.tsx)

#### Archivos modificados en Fase 3
- **Infraestructura, preferencias, entrada y login:** `src/services/preferences.ts`, `src/app/_layout.tsx`, `src/app/index.tsx`, `src/components/auth/LoginForm.tsx`, `src/components/ui/AnimatedToast.tsx`, `src/hooks/useGymDashboardData.ts`.
- **Estructura del dashboard y Ajustes:** `src/components/dashboard/DashboardHeader.tsx`, `src/components/dashboard/DashboardTabBar.tsx`, `src/components/dashboard/GymDashboard.tsx`, `src/components/dashboard/profile/SettingsModal.tsx` *(creado en Fase 2 y habilitado en Fase 3 con el selector de idioma)*.
- **Perfil, Máquinas y Catálogo:** `src/components/dashboard/profile/ProfileSection.tsx`, `src/components/dashboard/profile/EditProfileForm.tsx`, `src/components/dashboard/equipment/EquipmentSection.tsx`, `src/components/dashboard/equipment/AddEquipmentModal.tsx`, `src/components/dashboard/catalog/CatalogSection.tsx`, `src/components/dashboard/catalog/AddExerciseModal.tsx`, `src/components/dashboard/catalog/ExerciseDetailModal.tsx`.
- **Rutinas y Sesiones:** `src/components/dashboard/routines/RoutinesSection.tsx`, `src/components/dashboard/routines/MyRoutinesSubTab.tsx`, `src/components/dashboard/routines/CreateRoutineCard.tsx`, `src/components/dashboard/routines/RoutineCard.tsx`, `src/components/dashboard/routines/RoutineDetailView.tsx`, `src/components/dashboard/routines/RoutineAddExerciseForm.tsx`, `src/components/dashboard/routines/SelectExerciseModal.tsx`, `src/components/dashboard/routines/SelectRoutineToStartModal.tsx`, `src/components/dashboard/routines/WeeklyAttendanceCard.tsx`, `src/components/dashboard/routines/ActiveSessionBar.tsx`, `src/components/dashboard/routines/FinishSessionConfirmModal.tsx`.
- **Progreso, Modales compartidos y Documentación:** `src/components/dashboard/tracking/MarcaFormCard.tsx`, `src/components/dashboard/tracking/RMTrackingChart.tsx`, `src/components/dashboard/tracking/MarcaHistoryList.tsx`, `src/components/dashboard/modals/ItemActionSheet.tsx`, `src/components/dashboard/modals/ConfirmDeleteModal.tsx`, `src/components/dashboard/modals/EditItemModal.tsx`, `src/components/dashboard/modals/edit-forms/EditEquipmentForm.tsx`, `src/components/dashboard/modals/edit-forms/EditExerciseForm.tsx`, `src/components/dashboard/modals/edit-forms/EditMarcaForm.tsx`, `src/components/dashboard/modals/edit-forms/EditRoutineForm.tsx`, `docs/DOCUMENTACION_APARIENCIA_Y_AJUSTES.md`.

### 8.5 Checklist de pruebas manuales para Fase 3 (Idioma + API/Registros)
- [ ] En **Perfil → Ajustes → Idioma**, cambiar a **English** y comprobar que las 5 pestañas (`Machines`, `Catalog`, `Routines`, `Progress`, `Profile`), cabecera y barra inferior cambian al instante sin cerrar sesión.
- [ ] **Crear rutina en inglés:** desde `Routines → Create`, elegir enfoque (`Chest`, `Legs`, etc.), seleccionar ejercicios y crear rutina; verificar que aparece el toast en inglés, el formulario se limpia y cambia automáticamente a `My Routines`.
- [ ] **Registrar marcas y sesiones en inglés:** iniciar una rutina (`Start routine`), ir a `Progress`, registrar peso/reps/RPE (`Save Set`), verificar gráfica `Estimated 1RM`, historial de sesiones y finalizar sesión (`Finish`). Confirmar que todo persiste tras refrescar o volver a Español.
- [ ] **Administrador en ambos idiomas:** crear/editar/eliminar una máquina, editar un ejercicio o rutina y probar **"Audit User Directory (API)"** / **"Auditar Directorio de Usuarios (API)"**.
- [ ] **Modo Sistema y persistencia:** seleccionar **Sistema**, reiniciar la app y confirmar que conserva el idioma seleccionado (y tras cerrar sesión, `LoginForm` y `AuthProvider` cargan en el idioma elegido).
