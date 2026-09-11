import { ArrowLeft, FileText, AlertTriangle, Users, Gavel, Mail } from "lucide-react";

interface TermsOfServiceProps {
  onBack: () => void;
}

const SECTIONS = [
  {
    icon: FileText,
    title: "1. Descripción del servicio",
    body: [
      "MindCheck es una aplicación web de tamizaje de depresión dirigida a jóvenes universitarios de Lima, basada en el cuestionario clínico PHQ-9 y un modelo de Machine Learning (árboles de decisión) que estima un nivel de riesgo orientativo.",
      "El servicio es un proyecto de investigación académica (tesis de Ingeniería de Sistemas de Información, UPC) y se ofrece con fines educativos y de apoyo, no como un servicio médico certificado.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "2. Naturaleza del resultado: no es un diagnóstico",
    body: [
      "El resultado del cuestionario es una herramienta de tamizaje, NO un diagnóstico clínico. Únicamente un profesional de salud mental calificado puede emitir un diagnóstico formal.",
      "Si tus respuestas indican síntomas moderados, severos o riesgo de ideación suicida, se recomienda buscar ayuda profesional de inmediato.",
    ],
  },
  {
    icon: Users,
    title: "3. Roles y responsabilidades",
    body: [
      "Estudiante: es responsable de brindar respuestas honestas y de aceptar el consentimiento informado antes de iniciar la evaluación.",
      "Psicólogo: utiliza los resultados como apoyo para priorizar y dar seguimiento clínico a los estudiantes asignados; la decisión clínica final es siempre de su responsabilidad profesional.",
      "Administrador: gestiona usuarios, supervisa el funcionamiento del sistema y el entrenamiento del modelo, sin acceder a contenido clínico más allá de lo necesario para la operación de la plataforma.",
    ],
  },
  {
    icon: Gavel,
    title: "4. Uso aceptable y limitación de responsabilidad",
    body: [
      "Aceptas utilizar la plataforma únicamente con fines legítimos de autoevaluación y seguimiento de bienestar emocional.",
      "MindCheck y su equipo de desarrollo no se responsabilizan por decisiones tomadas exclusivamente en base al resultado automatizado, sin la intervención de un profesional de salud mental.",
      "Nos reservamos el derecho de suspender el acceso ante un uso indebido de la plataforma o de las cuentas de otros usuarios.",
    ],
  },
];

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="bg-background text-on-background font-body-md antialiased w-full">
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        <section className="space-y-4">
          <span className="text-label-caps font-label-caps text-primary uppercase tracking-widest">
            Legal
          </span>
          <h1 className="font-h1 text-h1 text-on-surface">Términos de Servicio</h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
            Al usar MindCheck aceptas los siguientes términos. Te recomendamos leerlos junto con nuestra{" "}
            Política de Privacidad antes de completar el cuestionario PHQ-9.
          </p>
          <p className="text-xs text-outline">Última actualización: septiembre de 2026</p>
        </section>

        <section className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title} className="bg-white p-8 rounded-3xl border border-outline-variant space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <section.icon className="w-5 h-5" />
                </div>
                <h2 className="font-h2 text-xl text-on-surface">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.body.map((item, i) => (
                  <li key={i} className="text-sm text-on-surface-variant flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="bg-red-50 border border-red-200 rounded-3xl p-8 space-y-2">
          <h2 className="font-h2 text-lg text-red-800">Descargo de responsabilidad</h2>
          <p className="text-sm text-red-800">
            Este cuestionario es una herramienta de tamizaje, NO un diagnóstico clínico. Solo un profesional
            de salud mental calificado puede realizar un diagnóstico formal.
          </p>
        </section>
      </main>
    </div>
  );
}
