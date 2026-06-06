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

export type RiskLevel =
  | "Mínima"
  | "Leve"
  | "Moderada"
  | "Moderadamente Severa"
  | "Severa";

export function calculatePhq9Score(responses: number[]): number {
  return responses.reduce((sum, val) => sum + val, 0);
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 4) return "Mínima";
  if (score <= 9) return "Leve";
  if (score <= 14) return "Moderada";
  if (score <= 19) return "Moderadamente Severa";
  return "Severa";
}

export function hasSuicideRisk(responses: number[]): boolean {
  return responses.length >= 9 && responses[8] >= 1;
}

export function getRecommendation(score: number): string {
  if (score <= 4) {
    return "Tus respuestas indican síntomas mínimos. Continúa cuidando tu bienestar mental con actividades saludables.";
  }
  if (score <= 9) {
    return "Tus respuestas sugieren síntomas leves. Considera hablar con alguien de confianza o monitorear cómo te sientes.";
  }
  if (score <= 14) {
    return "Tus respuestas indican síntomas moderados. Te recomendamos consultar con un profesional de salud mental.";
  }
  if (score <= 19) {
    return "Tus respuestas sugieren síntomas moderadamente severos. Es importante que busques ayuda profesional pronto.";
  }
  return "Tus respuestas indican síntomas severos. Por favor, busca ayuda profesional de inmediato. No estás solo/a.";
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
  { value: 2, label: "En desacuerdo" },
  { value: 3, label: "De acuerdo" },
  { value: 4, label: "Muy de acuerdo" }
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

