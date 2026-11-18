export const PHQ9_QUESTIONS = [
  "Poco interés o placer en hacer las cosas",
  "Sentirse desanimado/a, deprimido/a o sin esperanza",
  "Problemas para conciliar el sueño, mantenerse dormido/a o dormir demasiado",
  "Sentirse cansado/a o tener poca energía",
  "Poco apetito o comer en exceso",
  "Sentirse mal consigo mismo/a, sentir que es un fracaso o que ha quedado mal con usted mismo/a o con su familia",
  "Problemas para concentrarse en cosas como leer el periódico o ver televisión",
  "Moverse o hablar tan lentamente que otras personas podrían haberlo notado, o estar tan inquieto/a o agitado/a que se mueve mucho más de lo habitual",
  "Pensamientos de que estaría mejor muerto/a o de hacerse daño de alguna manera",
] as const;

export const PHQ9_OPTIONS = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Algunas veces" },
  { value: 2, label: "Casi siempre" },
  { value: 3, label: "Siempre" },
] as const;

export function calculatePhq9Score(responses: number[]): number {
  return responses.reduce((sum, val) => sum + val, 0);
}

export function hasSuicideRisk(responses: number[]): boolean {
  return responses.length >= 9 && responses[8] >= 1;
}

// ---------------------------------------------------------------------------
// Lenguaje para el estudiante
// ---------------------------------------------------------------------------
// Las categorías clínicas del PHQ-9 (mínima, leve, moderada, moderadamente
// severa, severa) se usan solo en las vistas del personal. Al estudiante se le
// muestran con lenguaje cálido, sin etiquetas alarmantes ni colores de alerta.

export type LevelKey = "minimo" | "leve" | "moderado" | "moderadamente_severo" | "severo";

export interface StudentLevel {
  key: LevelKey;
  /** Etiqueta amable que ve el estudiante. */
  label: string;
  /** Mensaje principal, en segunda persona y sin términos clínicos. */
  message: string;
  /** Sugerencia concreta del siguiente paso. */
  nextStep: string;
  /** Rango de puntaje PHQ-9, para la explicación opcional. */
  range: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}

export const STUDENT_LEVELS: Record<LevelKey, StudentLevel> = {
  minimo: {
    key: "minimo",
    label: "Te has sentido bien",
    message:
      "En general, estas últimas dos semanas te has sentido bien. Sigue cuidando las cosas que te hacen bien.",
    nextStep: "Mantén tus rutinas de autocuidado y vuelve a revisar cómo te sientes en unas semanas.",
    range: "0-4",
    icon: "sentiment_satisfied",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-400",
  },
  leve: {
    key: "leve",
    label: "Algunas cosas te han pesado",
    message:
      "Algunas cosas te han estado pesando un poco estas semanas. Es algo que le pasa a mucha gente; date espacios para descansar y, si te ayuda, conversa con alguien de confianza.",
    nextStep: "Date pausas para descansar y conversa con alguien de confianza si lo necesitas.",
    range: "5-9",
    icon: "spa",
    color: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800",
    dot: "bg-sky-400",
  },
  moderado: {
    key: "moderado",
    label: "Un buen momento para conversar",
    message:
      "Parece que estas semanas no han sido fáciles. Hablar con un profesional puede ayudarte a sentirte mejor, y en la UPC hay personas dispuestas a escucharte.",
    nextStep: "Cuando te sientas listo/a, puedes agendar una conversación con el Servicio Psicológico de la UPC.",
    range: "10-14",
    icon: "forum",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-400",
  },
  moderadamente_severo: {
    key: "moderadamente_severo",
    label: "Mereces acompañamiento",
    message:
      "Notamos que estas semanas han sido difíciles para ti. No tienes que pasar por esto solo/a: conversar pronto con un psicólogo de la UPC puede ayudarte mucho.",
    nextStep: "Te animamos a conversar pronto con el Servicio Psicológico de la UPC. Están para acompañarte.",
    range: "15-19",
    icon: "volunteer_activism",
    color: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800",
    dot: "bg-indigo-400",
  },
  severo: {
    key: "severo",
    label: "Queremos acompañarte",
    message:
      "Notamos que estás pasando por un momento muy difícil. Lo que sientes importa y hay personas preparadas para acompañarte. Te animamos a conversar con el equipo de bienestar de la UPC lo antes que puedas.",
    nextStep: "Busca al Servicio Psicológico de la UPC lo antes que puedas; un profesional te escuchará con calma.",
    range: "20-27",
    icon: "favorite",
    color: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    dot: "bg-violet-400",
  },
};

export const STUDENT_LEVEL_ORDER: LevelKey[] = [
  "minimo",
  "leve",
  "moderado",
  "moderadamente_severo",
  "severo",
];

export function getLevelKey(score: number): LevelKey {
  if (score <= 4) return "minimo";
  if (score <= 9) return "leve";
  if (score <= 14) return "moderado";
  if (score <= 19) return "moderadamente_severo";
  return "severo";
}

/**
 * Normaliza `nivel_riesgo` del backend a una LevelKey. Acepta tanto la clave
 * cruda ("moderadamente_severo") como la versión formateada que devuelven
 * algunos endpoints ("Moderadamente severo").
 */
export function normalizeLevelKey(value: string | null | undefined): LevelKey | null {
  if (!value) return null;
  const key = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  return key in STUDENT_LEVELS ? (key as LevelKey) : null;
}

/** Nivel amable a partir del puntaje o de `nivel_riesgo` del backend. */
export function getStudentLevel(scoreOrKey: number | string | null | undefined): StudentLevel | null {
  if (typeof scoreOrKey === "number") return STUDENT_LEVELS[getLevelKey(scoreOrKey)];
  const key = normalizeLevelKey(scoreOrKey);
  return key ? STUDENT_LEVELS[key] : null;
}

/** Niveles en los que se sugiere acompañamiento profesional (PHQ-9 >= 10). */
export function suggestsSupport(value: string | null | undefined): boolean {
  const key = normalizeLevelKey(value);
  return key === "moderado" || key === "moderadamente_severo" || key === "severo";
}

export function isValidPhq9Responses(responses: number[]): boolean {
  return (
    responses.length === 9 &&
    responses.every((v) => Number.isInteger(v) && v >= 0 && v <= 3)
  );
}

export const MSPSS_QUESTIONS = [
  "Hay una persona especial que está cerca cuando la necesito.",
  "Hay una persona especial con la que puedo compartir mis alegrías y mis penas.",
  "Mi familia realmente intenta ayudarme.",
  "Obtengo la ayuda y el apoyo emocional que necesito de mi familia.",
  "Tengo una persona especial que es una verdadera fuente de consuelo para mí.",
  "Mis amigos realmente intentan ayudarme.",
  "Puedo contar con mis amigos cuando las cosas van mal.",
  "Puedo hablar de mis problemas con mi familia.",
  "Tengo amigos con los que puedo compartir mis alegrías y mis penas.",
  "Hay una persona especial en mi vida que se interesa por mis sentimientos.",
  "Mi familia está dispuesta a ayudarme a tomar decisiones.",
  "Puedo hablar de mis problemas con mis amigos."
] as const;

export const MSPSS_OPTIONS = [
  { value: 1, label: "Muy en desacuerdo" },
  { value: 2, label: "Bastante en desacuerdo" },
  { value: 3, label: "Algo en desacuerdo" },
  { value: 4, label: "Ni de acuerdo ni en desacuerdo" },
  { value: 5, label: "Algo de acuerdo" },
  { value: 6, label: "Bastante de acuerdo" },
  { value: 7, label: "Muy de acuerdo" }
] as const;

export const CALIDAD_SUENIO_OPTIONS = [
  "Muy mala",
  "Mala",
  "Regular",
  "Buena",
  "Muy buena"
] as const;

export const HISTORIA_SALUD_MENTAL_OPTIONS = [
  "Nunca",
  "Previo no actual",
  "Actual",
  "Prefiero no responder"
] as const;

export const GENERO_OPTIONS = ["Masculino", "Femenino", "Otro"] as const;
export const CICLO_OPTIONS = ["1-2", "3-4", "5-6", "7-8", "9-10+"] as const;
export const SITUACION_PAREJA_OPTIONS = ["Soltero/a", "Con pareja", "Prefiero no responder"] as const;
export const CONVIVENCIA_OPTIONS = ["Solo/a", "Con familia", "Con compañeros/amigos", "Otro"] as const;
export const TRABAJO_ESTUDIO_OPTIONS = ["Solo estudio", "Estudio y trabajo parcial", "Estudio y trabajo completo"] as const;
export const MIGRACION_OPTIONS = ["Sí", "No"] as const;

