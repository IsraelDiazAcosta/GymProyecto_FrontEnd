# Documento Técnico: Rediseño UX/UI "Apex Emerald Gym" y Refactorización Arquitectónica

## 1. Resumen Ejecutivo

Se ejecutó una transformación integral de la interfaz de usuario, experiencia de interacción (UX/UI) y arquitectura de componentes de **GymProyecto FrontEnd**, cumpliendo con los siguientes objetivos estratégicos:

1. **Identidad Visual "Apex Emerald Gym" (Dark & Light Theme)**: Sustitución de tonos morados/grises genéricos por una paleta deportiva de alto contraste basada en **Verde Esmeralda Neón, Menta Atlético y Obsidiana** en modo oscuro, y **Esmeralda Bosque y Alabastro Menta** en modo claro.
2. **Sustitución Total de Emojis por Iconografía Vectorial (`GymIcon`)**: Eliminación del 100% de emojis (`🏋️`, `📋`, `📈`, `⚙️`, `🔍`, `🗑️`, `✏️`, `🚀`, `⚠️`, etc.) en favor de iconos vectoriales SVG basados en la especificación **Lucide 24x24** sobre `react-native-svg`.
3. **Fluidez y Micro-interacciones Animadas**: Incorporación de `AnimatedCard`, transiciones de entrada escalonadas (`Fade + Spring Slide`), retroalimentación elástica al presionar botones (`scale: 0.97`), barras de progreso animadas en notificaciones (`AnimatedToast`) y curva de evolución 1RM con degradado SVG (`LinearGradient`).
4. **Centralización y Modularización Estricta (< 1,000 líneas por archivo)**: Ningún archivo del proyecto supera las 600 líneas. Los antiguos monolitos `EditItemModal.tsx` (1,384 líneas) y `GymDashboard.tsx` (1,073 líneas) fueron desacoplados en subcarpetas por dominio y un Custom Hook dedicado (`useGymDashboardData.ts`).

---

## 2. Nueva Paleta de Colores ("Apex Emerald Gym")

Definida en `src/constants/theme.ts`, la paleta se adapta automáticamente al tema del sistema operativo (`useColorScheme()`):

| Token Semántico | Modo Oscuro (`dark`) | Modo Claro (`light`) | Propósito en la Interfaz |
| :--- | :--- | :--- | :--- |
| `background` | `#080C0A` (Obsidiana Bosque) | `#F2F6F4` (Alabastro Menta) | Fondo general de la aplicación |
| `backgroundElement` | `#111815` (Carbón Esmeralda) | `#FFFFFF` (Blanco Puro) | Tarjetas principales, contenedores y modales |
| `backgroundElevated` | `#18221E` (Superficie Elevada) | `#E6EFEA` (Menta Suave) | Inputs, buscadores, chips inactivos y filas internas |
| `backgroundSelected` | `#1D332A` (Selección Esmeralda) | `#D0E8DC` (Selección Menta) | Elementos seleccionados |
| `primary` | `#10B981` (Esmeralda Neón) | `#059669` (Esmeralda Atlético) | Botones principales, pestaña activa, curva 1RM e iconos |
| `primaryLight` | `#34D399` (Menta Luminoso) | `#10B981` (Esmeralda Brillante) | Bordes activos y resaltados |
| `primaryGlow` | `rgba(16, 185, 129, 0.16)` | `rgba(5, 150, 105, 0.12)` | Fondos traslúcidos para insignias, chips activos y halos |
| `accent` | `#A3E635` (Lima Volt) | `#65A30D` (Lima Atlético) | Destacados de alto rendimiento y récords personales |
| `text` | `#F3F8F5` (Blanco Alabastro) | `#0B1712` (Verde Bosque Oscuro) | Títulos y texto principal de máxima legibilidad |
| `textSecondary` | `#8CA399` (Gris Salvia Metálico) | `#52665D` (Gris Salvia) | Subtítulos, etiquetas y metadatos |
| `border` | `rgba(52, 211, 153, 0.16)` | `rgba(5, 150, 105, 0.16)` | Bordes con acento esmeralda |
| `borderSubtle` | `rgba(255, 255, 255, 0.07)` | `rgba(11, 23, 18, 0.08)` | Divisiones sutiles de tarjetas e inputs |
| `danger` | `#F43F5E` (Carmesí) | `#E11D48` (Rojo Intenso) | Acciones destructivas y alertas de error |
| `warning` | `#F59E0B` (Ámbar) | `#D97706` (Ámbar Oscuro) | Advertencias de compatibilidad muscular |

---

## 3. Librerías Utilizadas para Iconografía, Gráficos y Animaciones

Para garantizar compatibilidad nativa inmediata en **Android, iOS y Web** sin errores de carga de fuentes ni dependencias nativas rotas:

1. **`react-native-svg` (`v15.16.0`)**:
   - Utilizada para construir el sistema centralizado de iconos vectoriales **`src/components/ui/GymIcon.tsx`** empleando primitivas `Svg`, `Path`, `Circle`, `Rect`, `Line` y `Polyline` bajo el estándar geométrico **Lucide Icons (24x24px, `strokeLinecap="round"`, `strokeLinejoin="round"`)**.
   - Utilizada también en **`RMTrackingChart.tsx`** (`Defs`, `LinearGradient`, `Stop`, `Polygon`, `Polyline`, `Circle`) para renderizar el área sombreada con degradado esmeralda bajo la curva de evolución de 1RM.
2. **`react-native` Animated API & `react-native-reanimated` (`v4.7.1`)**:
   - **`AnimatedCard.tsx`**: Animación paralela de entrada (`opacity: 0 -> 1` + `translateY: 12 -> 0` con física `spring`) y respuesta táctil al presionar (`scale: 0.982`).
   - **`AppButton.tsx`**: Rebote elástico (`Animated.spring` a `scale: 0.97`) en eventos `onPressIn` / `onPressOut` y sombras dinámicas con brillo esmeralda.
   - **`AnimatedToast.tsx`**: Notificaciones flotantes superiores con entrada elástica y barra de progreso temporal animada.
   - **`ItemActionSheet.tsx`**: Hoja inferior deslizable con resorte (`tension: 80, friction: 9`) y retroalimentación háptica (`Vibration.vibrate`).
3. **`react-native-safe-area-context` (`~5.10.1`)**:
   - Manejo seguro de márgenes superiores e inferiores en modales y pantallas principales.

---

## 4. Sustitución de Emojis por Iconos Vectoriales (`GymIcon`)

Se creó `src/components/ui/GymIcon.tsx` con **36 iconos vectoriales deportivos y de interfaz**:

| Antes (Emoji) | Ahora (`GymIcon name="..."`) | Ubicación de Uso |
| :--- | :--- | :--- |
| `🏋️` | `dumbbell` / `barbell` | Login, Header, Catálogo, Miniaturas vacías, Historial de Marcas |
| `📋` | `layers` | Pestaña Rutinas, Tarjetas de Rutina, Selector de Ejercicios |
| `📈` | `trending-up` / `activity` | Pestaña Progreso, Gráfica 1RM, Series y Repeticiones |
| `📖` | `book-open` | Pestaña Catálogo, Indicador de ejercicios en Header |
| `⚙️` / `🔩` / `🔗` | `cog` / `sliders` / `activity` | Pestaña Máquinas, Categorías de Equipo, Metadatos de Máquina |
| `👤` / `🛡️` | `user` / `shield` / `users` | Pestaña Perfil, Insignia de Rol (Admin/Atleta), Directorio de Usuarios |
| `💪` / `🎯` | `target` | Insignias de Grupo Muscular Principal y Enfoque Muscular |
| `🔍` | `search` | Barras de búsqueda en Catálogo, Máquinas y Selector de Ejercicios |
| `➕` / `✓` / `✕` | `plus` / `check` / `x` | Botones de acción, Chips seleccionados, Cierre de modales |
| `✏️` / `🗑️` / `⋮` | `edit` / `trash` / `more-vertical` | Menús contextuales (`ItemActionSheet`), Modal de confirmación de borrado |
| `🚀` / `🏆` / `⚠️` | `sparkles` / `award` / `alert-triangle` | Notificaciones Toast, Récord Personal (PR 1RM), Alertas de validación |
| `🎥` / `▶️` | `video` / `play` | Botones de video demostrativo en Ficha Técnica de Ejercicio |

---

## 5. Nueva Arquitectura Centralizada de Carpetas y Reducción de Líneas

Se reestructuró `src/` dividiendo los componentes por dominio funcional y manteniendo re-exportaciones limpias para compatibilidad total:

```text
src/
├── app/
│   ├── _layout.tsx
│   └── index.tsx                                  (125 líneas)
├── constants/
│   └── theme.ts                                   (94 líneas - Paleta Apex Emerald Gym)
├── hooks/
│   └── useGymDashboardData.ts                     (525 líneas - Lógica y API extraída)
└── components/
    ├── auth/
    │   └── LoginForm.tsx                          (190 líneas)
    ├── ui/
    │   ├── GymIcon.tsx                            (425 líneas - 36 iconos SVG vectoriales)
    │   ├── AnimatedCard.tsx                       (98 líneas - Animación Fade/Spring)
    │   ├── AppButton.tsx                          (147 líneas - Botón con icono y escala)
    │   ├── AppInput.tsx                           (146 líneas - Input con icono y toggle eye)
    │   └── AnimatedToast.tsx                      (224 líneas - Toast con barra de progreso)
    └── dashboard/
        ├── GymDashboard.tsx                       (312 líneas - Antes: 1,073 líneas)
        ├── DashboardHeader.tsx                    (165 líneas - Nuevo Header con métricas)
        ├── DashboardTabBar.tsx                    (96 líneas - Navegación vectorial)
        ├── dashboardStyles.ts                     (375 líneas - Estilos compartidos)
        ├── muscleValidation.ts                    (218 líneas - Validación muscular)
        ├── types.ts                               (20 líneas)
        ├── routines/                              (Subcarpeta de Rutinas)
        │   ├── CreateRoutineCard.tsx              (288 líneas)
        │   ├── RoutineCard.tsx                    (385 líneas - Antes: 683 líneas)
        │   ├── RoutineAddExerciseForm.tsx         (292 líneas - Subformulario extraído)
        │   └── SelectExerciseModal.tsx            (448 líneas)
        ├── tracking/                              (Subcarpeta de Progreso y 1RM)
        │   ├── RMTrackingChart.tsx                (412 líneas - Curva SVG con degradado)
        │   ├── MarcaFormCard.tsx                  (308 líneas)
        │   └── MarcaHistoryList.tsx               (242 líneas)
        ├── catalog/                               (Subcarpeta de Catálogo)
        │   ├── CatalogSection.tsx                 (392 líneas - Búsqueda + columna vertical)
        │   ├── ExerciseDetailModal.tsx            (435 líneas)
        │   └── AddExerciseModal.tsx               (478 líneas)
        ├── equipment/                             (Subcarpeta de Máquinas)
        │   ├── EquipmentSection.tsx               (422 líneas)
        │   └── AddEquipmentModal.tsx              (264 líneas)
        ├── profile/                               (Subcarpeta de Perfil y Admin)
        │   └── ProfileSection.tsx                 (232 líneas)
        └── modals/                                (Subcarpeta de Modales y Edición)
            ├── ItemActionSheet.tsx                (288 líneas)
            ├── ConfirmDeleteModal.tsx             (156 líneas)
            ├── EditItemModal.tsx                  (326 líneas - Antes: 1,384 líneas)
            └── edit-forms/
                ├── EditRoutineForm.tsx            (455 líneas)
                ├── EditExerciseForm.tsx           (318 líneas)
                ├── EditEquipmentForm.tsx          (138 líneas)
                └── EditMarcaForm.tsx              (108 líneas)
```

### Comparativa de los Archivos Más Grandes (Antes vs. Después)

| Archivo | Líneas Antes | Líneas Después | Reducción / Mejora |
| :--- | :---: | :---: | :--- |
| `EditItemModal.tsx` | **1,384 líneas** | **326 líneas** | **-76%** (Dividido en 4 subformularios en `modals/edit-forms/`) |
| `GymDashboard.tsx` | **1,073 líneas** | **312 líneas** | **-71%** (Lógica extraída a `src/hooks/useGymDashboardData.ts`) |
| `RoutineCard.tsx` | **683 líneas** | **385 líneas** | **-44%** (Formulario extraído a `RoutineAddExerciseForm.tsx`) |
| `SelectExerciseModal.tsx` | **604 líneas** | **448 líneas** | **-26%** (Optimizado con `GymIcon` y estilos limpios) |
| `ExerciseDetailModal.tsx` | **561 líneas** | **435 líneas** | **-22%** (Diseño limpio con insignias vectoriales) |
