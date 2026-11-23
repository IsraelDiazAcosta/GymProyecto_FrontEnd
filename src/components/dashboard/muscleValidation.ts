import { Exercise } from "@/services/api";

export function isExerciseCompatibleWithFocus(
  exerciseOrName: Exercise | string,
  focus?: string,
  primaryMuscleOverride?: string,
): boolean {
  if (!focus || focus.toLowerCase() === "fullbody") {
    return true;
  }

  const f = focus.toLowerCase().trim();
  const exercise: Partial<Exercise> =
    typeof exerciseOrName === "string"
      ? { name: exerciseOrName, primary_muscle: primaryMuscleOverride }
      : exerciseOrName;

  if (exercise.muscles && exercise.muscles.length > 0) {
    for (const m of exercise.muscles) {
      const bp = (m.body_part || "").toLowerCase();
      const mn = (m.muscle_name || "").toLowerCase();

      if (bp === f) return true;
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

  const pm = (primaryMuscleOverride || exercise.primary_muscle || "").toLowerCase();
  if (pm) {
    if (f === "pecho" && (pm.includes("pecho") || pm.includes("pectoral")))
      return true;
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

export function getExerciseMuscleLabel(
  exerciseOrName: Exercise | string,
  primaryMuscleOverride?: string,
): string {
  if (typeof exerciseOrName === "string") {
    return primaryMuscleOverride || "General";
  }
  if (exerciseOrName.primary_muscle) return exerciseOrName.primary_muscle;
  if (exerciseOrName.muscles && exerciseOrName.muscles.length > 0) {
    return (
      exerciseOrName.muscles[0].muscle_name ||
      exerciseOrName.muscles[0].body_part ||
      "General"
    );
  }
  return "General";
}

/**
 * Determines whether a machine/equipment item is anatomically compatible with the target muscle or body zone.
 * Universal equipment (cables, Smith machine, free weights, accessories) is allowed for any muscle group.
 * Specific machines (leg press, leg extension, leg curl, chest press, T-bar row, etc.)
 * are validated against the selected muscle to prevent mismatched machine assignments.
 */
export function isEquipmentCompatibleWithMuscle(
  equipmentNameOrType: string,
  muscleNameOrZone?: string | null,
): boolean {
  if (!muscleNameOrZone || !muscleNameOrZone.trim()) {
    return true; // If no muscle is specified, allow all equipment
  }

  const equip = (equipmentNameOrType || "").toLowerCase().trim();
  const muscle = muscleNameOrZone.toLowerCase().trim();

  // 1. Universal / multi-purpose equipment is always compatible with any muscle
  const isUniversal =
    equip.includes("polea") ||
    equip.includes("cable") ||
    equip.includes("smith") ||
    equip.includes("multipower") ||
    equip.includes("mancuerna") ||
    equip.includes("barra") ||
    equip.includes("banco") ||
    equip.includes("peso libre") ||
    equip.includes("libre") ||
    equip.includes("calistenia") ||
    equip.includes("accesorio");

  if (isUniversal) {
    return true;
  }

  // 2. Muscle zone mapping
  const isLegMuscle =
    muscle.includes("pierna") ||
    muscle.includes("cuádriceps") ||
    muscle.includes("cuadriceps") ||
    muscle.includes("femoral") ||
    muscle.includes("glúteo") ||
    muscle.includes("gluteo") ||
    muscle.includes("isquiotibial") ||
    muscle.includes("pantorrilla") ||
    muscle.includes("gemelo") ||
    muscle.includes("aduct") ||
    muscle.includes("abduct");

  const isChestMuscle =
    muscle.includes("pecho") ||
    muscle.includes("pectoral");

  const isBackMuscle =
    muscle.includes("espalda") ||
    muscle.includes("dorsal") ||
    muscle.includes("trapecio") ||
    muscle.includes("lumbar");

  const isShoulderMuscle =
    muscle.includes("hombro") ||
    muscle.includes("deltoides");

  const isArmMuscle =
    muscle.includes("brazo") ||
    muscle.includes("bíceps") ||
    muscle.includes("biceps") ||
    muscle.includes("tríceps") ||
    muscle.includes("triceps") ||
    muscle.includes("antebrazo");

  // Detect machine focus by name
  const isLegEquip =
    equip.includes("prensa") ||
    equip.includes("cuádriceps") ||
    equip.includes("cuadriceps") ||
    equip.includes("femoral") ||
    equip.includes("hack") ||
    equip.includes("sentadilla") ||
    equip.includes("gemelo") ||
    equip.includes("glúteo") ||
    equip.includes("gluteo") ||
    equip.includes("isquio") ||
    equip.includes("pantorrilla");

  const isChestEquip =
    equip.includes("pecho") ||
    equip.includes("convergente") ||
    equip.includes("chest") ||
    equip.includes("apertura") ||
    equip.includes("press de banca") ||
    equip.includes("inclinado");

  const isBackEquip =
    equip.includes("remo") ||
    equip.includes("dorsal") ||
    equip.includes("jalón") ||
    equip.includes("jalon") ||
    equip.includes("pulldown") ||
    equip.includes("lat pulldown");

  const isArmEquip =
    equip.includes("curl") && !equip.includes("femoral") ||
    equip.includes("predicador") ||
    equip.includes("scott") ||
    equip.includes("fondos");

  const isShoulderEquip =
    equip.includes("hombro") ||
    equip.includes("militar") ||
    equip.includes("deltoides");

  // If the machine is clearly leg-focused, allow only leg muscles
  if (isLegEquip) return isLegMuscle;

  // If the machine is clearly chest-focused, allow only chest (or secondary shoulders/triceps)
  if (isChestEquip) return isChestMuscle || isShoulderMuscle || isArmMuscle;

  // If the machine is clearly back-focused, allow only back (or biceps/traps)
  if (isBackEquip) return isBackMuscle || isArmMuscle;

  // If the machine is arm-focused, allow only arm muscles
  if (isArmEquip) return isArmMuscle;

  // If the machine is shoulder-focused, allow only shoulder muscles
  if (isShoulderEquip) return isShoulderMuscle;

  return true;
}
