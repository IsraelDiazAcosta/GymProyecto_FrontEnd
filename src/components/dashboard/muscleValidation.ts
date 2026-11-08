import { Exercise } from "@/services/api";

/**
 * Valida de forma estricta si un ejercicio pertenece al grupo muscular / enfoque de la rutina.
 */
export function isExerciseCompatibleWithFocus(
  exercise: Exercise,
  focus?: string
): boolean {
  if (!focus || focus.toLowerCase() === "fullbody") {
    return true;
  }

  const f = focus.toLowerCase().trim();

  // 1. Revisar los músculos asociados (muscles array)
  if (exercise.muscles && exercise.muscles.length > 0) {
    for (const m of exercise.muscles) {
      const bp = (m.body_part || "").toLowerCase();
      const mn = (m.muscle_name || "").toLowerCase();

      // Coincidencia directa de body_part
      if (bp === f) return true;

      // Torso desglosado en Pecho y Espalda
      if (f === "pecho" && (mn.includes("pecho") || mn.includes("pectoral"))) {
        return true;
      }
      if (
        f === "espalda" &&
        (mn.includes("espalda") ||
          mn.includes("dorsal") ||
          mn.includes("trapecio") ||
          mn.includes("lumbar"))
      ) {
        return true;
      }
      if (
        f === "pierna" &&
        (bp === "pierna" ||
          mn.includes("cuádriceps") ||
          mn.includes("cuadriceps") ||
          mn.includes("femoral") ||
          mn.includes("glúteo") ||
          mn.includes("gluteo") ||
          mn.includes("isquiotibial") ||
          mn.includes("pantorrilla") ||
          mn.includes("gemelo"))
      ) {
        return true;
      }
      if (
        f === "brazo" &&
        (bp === "brazo" ||
          mn.includes("bíceps") ||
          mn.includes("biceps") ||
          mn.includes("tríceps") ||
          mn.includes("triceps") ||
          mn.includes("antebrazo"))
      ) {
        return true;
      }
      if (
        f === "hombro" &&
        (bp === "hombro" || mn.includes("deltoides") || mn.includes("hombro"))
      ) {
        return true;
      }
      if (
        f === "core" &&
        (bp === "core" ||
          mn.includes("abdomen") ||
          mn.includes("abdominal") ||
          mn.includes("core") ||
          mn.includes("oblicuo"))
      ) {
        return true;
      }
    }
  }

  // 2. Revisar primary_muscle (string simple de la API)
  if (exercise.primary_muscle) {
    const pm = exercise.primary_muscle.toLowerCase();
    if (f === "pecho" && (pm.includes("pecho") || pm.includes("pectoral"))) return true;
    if (
      f === "espalda" &&
      (pm.includes("espalda") ||
        pm.includes("dorsal") ||
        pm.includes("trapecio") ||
        pm.includes("lumbar"))
    )
      return true;
    if (
      f === "pierna" &&
      (pm.includes("pierna") ||
        pm.includes("cuádriceps") ||
        pm.includes("cuadriceps") ||
        pm.includes("femoral") ||
        pm.includes("glúteo") ||
        pm.includes("gluteo") ||
        pm.includes("isquiotibial") ||
        pm.includes("gemelo") ||
        pm.includes("pantorrilla"))
    )
      return true;
    if (
      f === "brazo" &&
      (pm.includes("brazo") ||
        pm.includes("bíceps") ||
        pm.includes("biceps") ||
        pm.includes("tríceps") ||
        pm.includes("triceps"))
    )
      return true;
    if (f === "hombro" && (pm.includes("hombro") || pm.includes("deltoides")))
      return true;
    if (
      f === "core" &&
      (pm.includes("core") || pm.includes("abdomen") || pm.includes("abdominal"))
    )
      return true;
  }

  // 3. Fallback inteligente por nombre de ejercicio si el ejercicio aún no tiene músculos en BD
  const name = (exercise.name || "").toLowerCase();
  if (
    f === "pecho" &&
    (name.includes("pecho") ||
      name.includes("bench") ||
      name.includes("press banca") ||
      name.includes("press plano") ||
      name.includes("press inclinado") ||
      name.includes("pectoral") ||
      name.includes("aperturas"))
  )
    return true;
  if (
    f === "espalda" &&
    (name.includes("espalda") ||
      name.includes("dorsal") ||
      name.includes("jalón") ||
      name.includes("jalon") ||
      name.includes("remo") ||
      name.includes("dominada") ||
      name.includes("pulldown"))
  )
    return true;
  if (
    f === "pierna" &&
    (name.includes("pierna") ||
      name.includes("sentadilla") ||
      name.includes("squat") ||
      name.includes("prensa") ||
      name.includes("cuádriceps") ||
      name.includes("cuadriceps") ||
      name.includes("femoral") ||
      name.includes("isquiotibial") ||
      name.includes("gemelo") ||
      name.includes("pantorrilla") ||
      name.includes("rodilla") ||
      name.includes("peso muerto"))
  )
    return true;
  if (
    f === "brazo" &&
    (name.includes("brazo") ||
      name.includes("bíceps") ||
      name.includes("biceps") ||
      name.includes("curl") ||
      name.includes("tríceps") ||
      name.includes("triceps") ||
      name.includes("copa") ||
      name.includes("fondos"))
  )
    return true;
  if (
    f === "hombro" &&
    (name.includes("hombro") ||
      name.includes("militar") ||
      name.includes("elevaciones") ||
      name.includes("deltoides") ||
      name.includes("arnold") ||
      name.includes("press hombro"))
  )
    return true;
  if (
    f === "core" &&
    (name.includes("core") ||
      name.includes("abdomen") ||
      name.includes("crunch") ||
      name.includes("plancha") ||
      name.includes("abdominal"))
  )
    return true;

  return false;
}

export function getExerciseMuscleLabel(exercise: Exercise): string {
  if (exercise.primary_muscle) return exercise.primary_muscle;
  if (exercise.muscles && exercise.muscles.length > 0) {
    return exercise.muscles[0].muscle_name || exercise.muscles[0].body_part || "General";
  }
  return "General";
}
