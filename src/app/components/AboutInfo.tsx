import { Brain, ShieldCheck, GitBranch, Users, PhoneCall, ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface AboutInfoProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const RISK_LEVELS = [
  { range: "0-4 puntos", label: "Mínima", color: "bg-green-50 text-green-700" },
  { range: "5-9 puntos", label: "Leve", color: "bg-blue-50 text-blue-700" },
  { range: "10-14 puntos", label: "Moderada", color: "bg-yellow-50 text-yellow-700" },
  { range: "15-19 puntos", label: "Moderadamente Severa", color: "bg-orange-50 text-orange-700" },
  { range: "20-27 puntos", label: "Severa", color: "bg-red-50 text-red-700" },
];

const FAQ_ITEMS = [
  {
    question: "¿Qué es MindCheck?",
    answer:
      "MindCheck es una aplicación web desarrollada como proyecto de tesis en la Universidad Peruana de Ciencias Aplicadas, orientada a la detección temprana de indicios de depresión en jóvenes universitarios de Lima mediante el cuestionario PHQ-9 y un modelo de Machine Learning basado en árboles de decisión.",
  },
  {
    question: "¿Qué es el PHQ-9?",
    answer:
      "El PHQ-9 (Patient Health Questionnaire-9) es un instrumento clínico validado de 9 preguntas, basado en criterios diagnósticos estandarizados, utilizado mundialmente para el tamizaje y monitoreo de síntomas depresivos.",
  },
  {
    question: "¿Cómo se calcula mi nivel de riesgo?",
    answer:
      "Tus respuestas al PHQ-9 se procesan mediante un modelo entrenado con datos clínicos de estudiantes universitarios. A diferencia de la suma aritmética tradicional, el modelo identifica patrones no lineales entre respuestas para estimar el nivel de riesgo (bajo, medio o alto) de forma más contextualizada.",
  },
  {
    question: "¿La aplicación reemplaza a un psicólogo?",
    answer:
      "No. MindCheck es una herramienta de tamizaje y apoyo a la decisión clínica, NO un diagnóstico. Los resultados sirven como guía para que un profesional de salud mental realice la evaluación final.",
  },
  {
    question: "¿Mis datos están protegidos?",
    answer:
      "Sí. La información personal y clínica se almacena cifrada, con control de acceso basado en roles y bajo los principios de la Ley N.° 29733 de Protección de Datos Personales del Perú. Solo psicólogos y administradores autorizados pueden acceder a datos clínicos.",
  },
  {
    question: "¿Qué pasa si mis respuestas indican riesgo alto?",
    answer:
      "El sistema detecta automáticamente respuestas críticas (como el ítem 9 del PHQ-9, asociado a ideación suicida) y genera una alerta prioritaria hacia el psicólogo responsable para una atención oportuna.",
  },
  {
    question: "¿Cuánto tiempo toma la evaluación?",
    answer: "El cuestionario está diseñado para completarse en aproximadamente 5 minutos.",
  },
];

export function AboutInfo({ onBack, onNavigate }: AboutInfoProps) {
  return (
    <div className="bg-background text-on-background font-body-md antialiased w-full">
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        <section className="space-y-4 text-center">
          <span className="text-label-caps font-label-caps text-primary uppercase tracking-widest">
            Acerca de MindCheck
          </span>
          <h1 className="font-h1 text-h1 text-on-surface">
            Tamizaje de depresión para jóvenes universitarios de Lima
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Aplicación web desarrollada como tesis de Ingeniería de Sistemas de Información (UPC), que
            combina el cuestionario clínico PHQ-9 con un modelo de Machine Learning basado en árboles de
            decisión para identificar tempranamente indicios de depresión.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-outline-variant space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-h2 text-xl text-on-surface">Objetivo del proyecto</h3>
            <p className="text-sm text-on-surface-variant">
              Facilitar la detección temprana de indicios de depresión en estudiantes universitarios,
              permitiendo un seguimiento clínico oportuno por parte de profesionales de salud mental.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-outline-variant space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="font-h2 text-xl text-on-surface">Árboles de decisión</h3>
            <p className="text-sm text-on-surface-variant">
              El modelo predictivo complementa la puntuación clínica tradicional del PHQ-9, capturando
              relaciones complejas entre respuestas para estimar el nivel de riesgo de forma más precisa.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-outline-variant space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-h2 text-xl text-on-surface">Privacidad por diseño</h3>
            <p className="text-sm text-on-surface-variant">
              Cifrado de datos sensibles, control de acceso por roles y cumplimiento de la Ley N.° 29733 de
              Protección de Datos Personales del Perú.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-outline-variant space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-h2 text-xl text-on-surface">Acompañamiento profesional</h3>
            <p className="text-sm text-on-surface-variant">
              Los resultados llegan a psicólogos asignados, quienes priorizan y dan seguimiento a los casos
              de mayor riesgo. El sistema es un apoyo, nunca un reemplazo del criterio clínico.
            </p>
          </div>
        </section>

        <section className="bg-surface-container-low rounded-3xl p-8 md:p-10 space-y-4">
          <h2 className="font-h2 text-2xl text-on-surface">Interpretación de resultados</h2>
          <p className="text-sm text-on-surface-variant">
            El puntaje del PHQ-9 se clasifica en cinco niveles de severidad, validados por la literatura
            clínica especializada:
          </p>
          <div className="space-y-2">
            {RISK_LEVELS.map((level) => (
              <div key={level.label} className={`flex justify-between items-center p-3 rounded-xl ${level.color}`}>
                <span className="font-medium text-sm">{level.range}</span>
                <span className="text-sm font-semibold">{level.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-h2 text-2xl text-on-surface text-center">Preguntas frecuentes</h2>
          <div className="bg-white rounded-3xl border border-outline-variant px-6 md:px-8">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-on-surface">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-on-surface-variant">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <p className="text-sm text-red-800">
            <strong>Descargo de responsabilidad:</strong> Este cuestionario es una herramienta de tamizaje,
            NO un diagnóstico clínico. Solo un profesional de salud mental calificado puede realizar un
            diagnóstico formal.
          </p>
        </div>
      </main>
    </div>
  );
}
