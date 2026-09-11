import { ArrowLeft, Lock, Database, UserCheck, ShieldAlert, Mail } from "lucide-react";

interface PrivacyPolicyProps {
  onBack: () => void;
}

const SECTIONS = [
  {
    icon: Database,
    title: "1. Datos que recopilamos",
    body: [
      "Datos de cuenta: nombre, correo electrónico y rol (estudiante, psicólogo o administrador), cifrados en la base de datos.",
      "Datos académicos del estudiante: edad, género, universidad y carrera, utilizados únicamente para contextualizar la evaluación.",
      "Respuestas del cuestionario PHQ-9 (ítems q1 a q9) y los resultados de riesgo generados por el modelo predictivo.",
      "Registros técnicos de auditoría: fecha, dirección IP y acción realizada, con fines de trazabilidad y seguridad.",
    ],
  },
  {
    icon: UserCheck,
    title: "2. Cómo usamos tus datos",
    body: [
      "Generar tu nivel de riesgo de depresión mediante el modelo de Machine Learning a partir de tus respuestas.",
      "Permitir que el psicólogo asignado revise tus resultados y brinde seguimiento clínico cuando corresponda.",
      "Detectar automáticamente respuestas críticas (ítem 9 del PHQ-9) y generar alertas de riesgo suicida hacia el profesional responsable.",
      "Elaborar estadísticas agregadas y anónimas para mejorar el modelo y los servicios de bienestar universitario.",
    ],
  },
  {
    icon: Lock,
    title: "3. Cómo protegemos tus datos",
    body: [
      "Cifrado de datos sensibles en reposo y comunicación segura mediante HTTPS/TLS en tránsito.",
      "Control de acceso basado en roles (RBAC) y políticas de seguridad a nivel de fila (RLS) en la base de datos, de modo que cada usuario solo accede a la información que le corresponde.",
      "Los datos utilizados para análisis y mejora del modelo se manejan de forma seudonimizada, sin identificadores directos.",
      "Copias de seguridad periódicas y mecanismos de recuperación ante fallos para evitar la pérdida de información.",
    ],
  },
  {
    icon: ShieldAlert,
    title: "4. Tus derechos (Ley N.° 29733)",
    body: [
      "De acuerdo con la Ley de Protección de Datos Personales del Perú (Ley N.° 29733).",
      "Puedes revocar tu consentimiento informado en cualquier momento desde la sección de Privacidad de tu panel de estudiante.",
      "Puedes solicitar la eliminación de tu cuenta y de tus datos asociados escribiendo a tu centro de salud.",
    ],
  },
];

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
          <h1 className="font-h1 text-h1 text-on-surface">Política de Privacidad</h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
            En MindCheck, la confidencialidad de tu información de salud mental es una prioridad. Esta
            política explica qué datos recopilamos, cómo los usamos y protegemos, y cuáles son tus derechos
            conforme a la normativa peruana de protección de datos personales.
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
      </main>
    </div>
  );
}
