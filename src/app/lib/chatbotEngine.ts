import { API_BASE } from "@/lib/api";

export interface ChatbotResponseItem {
  clave: string;
  texto: string;
  categoria?: string | null;
  activa: boolean;
  orden?: number | null;
}

function getChatbotResponsesUrl() {
  const base = API_BASE?.replace(/\/$/, "") || "";
  return base
    ? `${base}/make-server-d427d5bf/chatbot/responses?active=true`
    : "/make-server-d427d5bf/chatbot/responses?active=true";
}

export async function fetchChatbotResponses(): Promise<ChatbotResponseItem[]> {
  try {
    const response = await fetch(getChatbotResponsesUrl());
    if (!response.ok) return [];
    const results = await response.json();
    return results || [];
  } catch (error) {
    console.warn("No se pudieron cargar respuestas dinámicas del chatbot", error);
    return [];
  }
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

const CRISIS_KEYWORDS = [
  "suicidio",
  "suicidarme",
  "hacerme dano",
  "quitarme la vida",
  "matarme",
  "no quiero vivir",
  "acabar con todo",
  "quiero morir",
  "ayuda para crisis",
  "apoyo en crisis",
];

const CRISIS_RESPONSE =
  "Si estás en crisis o tienes pensamientos de hacerte daño, por favor contacta inmediatamente:\n\n" +
  "No estás solo/a. Hay profesionales disponibles para ayudarte.";

interface FaqEntry {
  keywords: string[];
  answer: string;
}

const STATIC_FAQ: FaqEntry[] = [
  {
    keywords: ["que es phq-9", "que es el phq-9", "phq9", "phq-9", "que es el cuestionario"],
    answer:
      "El PHQ-9 es un cuestionario de 9 preguntas validado científicamente para detectar síntomas de depresión. Es utilizado por profesionales de salud mental en todo el mundo.",
  },
  {
    keywords: ["confidencial", "anonimo", "privacidad", "mis datos"],
    answer:
      "Tus respuestas se tratan de forma confidencial: se almacenan cifradas y solo el psicólogo asignado y los administradores autorizados pueden acceder a información clínica. Puedes revisar los detalles en nuestra Política de Privacidad.",
  },
  {
    keywords: ["cuanto tarda", "cuanto dura", "cuanto tiempo toma", "cuanto demora"],
    answer: "El cuestionario toma aproximadamente 5 minutos en completarse.",
  },
  {
    keywords: ["tengo sintomas", "que hago si tengo sintomas", "me siento mal"],
    answer:
      "Si tus resultados indican síntomas moderados o severos, te recomendamos contactar a un profesional de salud mental. En la pantalla de resultados encontrarás recursos de apoyo.",
  },
  {
    keywords: ["es un diagnostico", "es diagnostico", "esto es un diagnostico"],
    answer:
      "No, este cuestionario es una herramienta de tamizaje, NO un diagnóstico clínico. Solo un profesional de salud mental puede realizar un diagnóstico formal.",
  },
  {
    keywords: ["quien ve mis resultados", "quien puede ver mis resultados", "quien accede a mis datos"],
    answer:
      "Solo el psicólogo asignado a tu seguimiento y los administradores autorizados pueden acceder a tus resultados clínicos.",
  },
  {
    keywords: ["como funciona", "que hace la app", "que hace mindcheck", "para que sirve"],
    answer:
      "Respondes el cuestionario PHQ-9 y un modelo de Machine Learning basado en árboles de decisión analiza tus respuestas para estimar un nivel de riesgo (bajo, medio o alto), que puede ser revisado por un psicólogo.",
  },
  {
    keywords: ["olvide mi contrasena", "recuperar contrasena", "cambiar contrasena", "restablecer contrasena"],
    answer:
      "Puedes restablecer tu contraseña desde la pantalla de inicio de sesión, en la opción “¿Olvidaste tu contraseña?”.",
  },
  {
    keywords: ["como empiezo", "como inicio la evaluacion", "donde inicio", "quiero hacer la evaluacion"],
    answer: "Puedes iniciar la evaluación desde el botón “Iniciar Evaluación” en la parte superior o en tu panel de estudiante.",
  },
  {
    keywords: ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches"],
    answer:
      "¡Hola! ¿En qué puedo ayudarte hoy? Puedo contarte sobre el cuestionario PHQ-9, la confidencialidad de tus datos o conectarte con recursos de apoyo.",
  },
  {
    keywords: ["gracias"],
    answer: "¡De nada! Estoy aquí si necesitas algo más.",
  },
  {
    keywords: ["quien eres", "que eres", "eres un bot", "eres una ia", "eres humano"],
    answer:
      "Soy el asistente virtual de MindCheck. Puedo orientarte sobre el cuestionario PHQ-9, la privacidad de tus datos y ponerte en contacto con recursos de apoyo emocional.",
  },
];

const OFF_TOPIC_FALLBACKS = [
  "Esa pregunta se sale un poco de mi especialidad — estoy enfocado en bienestar emocional y el cuestionario PHQ-9 — pero no quiero dejarte sin respuesta: cuéntame si buscas ayuda para completar la evaluación, entender tus resultados o contactar a un profesional, y te oriento con gusto.",
  "No tengo información certera sobre eso, ya que mi función principal es acompañarte en la evaluación PHQ-9 y el bienestar emocional. Mientras tanto, ¿te ayudo con algo relacionado a tu evaluación?",
  "Buena pregunta, aunque no es exactamente mi área. Soy el asistente de MindCheck y puedo ayudarte con el cuestionario, la confidencialidad de tus datos o recursos de apoyo emocional. ¿Quieres que conversemos sobre alguno de esos temas?",
];

function pickOffTopicFallback(): string {
  return OFF_TOPIC_FALLBACKS[Math.floor(Math.random() * OFF_TOPIC_FALLBACKS.length)];
}

export function getBotResponse(rawText: string, dynamicResponses: ChatbotResponseItem[] = []): string {
  const text = normalize(rawText);
  if (!text) return pickOffTopicFallback();

  if (CRISIS_KEYWORDS.some((keyword) => text.includes(normalize(keyword)))) {
    return CRISIS_RESPONSE;
  }

  for (const item of dynamicResponses) {
    const keyword = normalize(item.clave || "");
    if (keyword && text.includes(keyword)) {
      return item.texto;
    }
  }

  for (const entry of STATIC_FAQ) {
    if (entry.keywords.some((keyword) => text.includes(normalize(keyword)))) {
      return entry.answer;
    }
  }

  return pickOffTopicFallback();
}
