import { AlertCircle, CheckCircle, AlertTriangle, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getRiskLevel, getRecommendation, hasSuicideRisk } from "@/lib/phq9";

interface ResultsProps {
  score: number;
  interpretability?: any;
  responses?: number[];
  suicideAlert?: boolean;
  onReturnHome: () => void;
  onNavigate?: (screen: string) => void;
}

const RISK_ICONS = {
  Mínima: CheckCircle,
  Leve: AlertCircle,
  Moderada: AlertTriangle,
  "Moderadamente Severa": AlertCircle,
  Severa: AlertCircle,
} as const;

const RISK_TIERS = [
  { label: "Mínima", range: "0-4", description: "Síntomas muy leves o ninguno" },
  { label: "Leve", range: "5-9", description: "Síntomas leves, seguimiento preventivo" },
  { label: "Moderada", range: "10-14", description: "Síntomas moderados, se sugiere evaluación" },
  { label: "Moderadamente Severa", range: "15-19", description: "Síntomas serios, busque apoyo profesional" },
  { label: "Severa", range: "20-27", description: "Síntomas severos, atención urgente recomendada" },
] as const;

export function Results({
  score,
  interpretability = null,
  responses = [],
  suicideAlert = false,
  onReturnHome,
  onNavigate,
}: ResultsProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const level = getRiskLevel(score);

  const handleDownloadReport = () => {
    window.print();
  };
  const risk = { level, icon: RISK_ICONS[level] };
  const recommendation = getRecommendation(score);
  const showCrisisBanner =
    suicideAlert || (responses.length >= 9 && hasSuicideRisk(responses));
  const percentage = Math.round((score / 27) * 100);
  
  // Animate the circular progress
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const dashArray = 502.4; // 2 * pi * 80
  const dashOffset = dashArray - (dashArray * animatedScore) / 100;

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">
      {/* TopAppBar */}
      <nav className="bg-[#F8FAFC] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto font-manrope antialiased tracking-tight sticky top-0 z-50">
        <div className="text-xl font-bold text-[#4A90E2] dark:text-blue-400 cursor-pointer" onClick={onReturnHome}>MindCheck</div>
        <div className="hidden md:flex gap-8 items-center">
          <a
            className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#4A90E2] dark:hover:text-blue-200 transition-colors duration-200"
            href="#"
            onClick={(e) => { e.preventDefault(); onReturnHome(); }}
          >
            Inicio
          </a>
          <a
            className="text-[#4A90E2] dark:text-blue-300 font-bold border-b-2 border-[#4A90E2] pb-1"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Evaluación
          </a>
          <a
            className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#4A90E2] dark:hover:text-blue-200 transition-colors duration-200"
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("support"); }}
          >
            Soporte
          </a>
          <a
            className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#4A90E2] dark:hover:text-blue-200 transition-colors duration-200"
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("auth"); }}
          >
            Portal Admin
          </a>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-slate-500">
            <span onClick={() => document.documentElement.classList.toggle('dark')} className="material-symbols-outlined hover:text-[#4A90E2] cursor-pointer transition-colors">contrast</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-[#4A90E2] transition-colors">text_increase</span>
          </div>
          <button onClick={onReturnHome} className="hidden md:block bg-primary text-on-primary px-6 py-2 rounded-full font-button text-button active:scale-95 transition-transform">
            Volver al Inicio
          </button>
          <button 
            className="md:hidden p-2 text-slate-500 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2 z-40">
          <a
            className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#4A90E2]"
            href="#"
            onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onReturnHome(); }}
          >
            Inicio
          </a>
          <a
            className="text-[#4A90E2] dark:text-blue-300 font-bold"
            href="#"
            onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); }}
          >
            Resultados
          </a>
          <a
            className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#4A90E2]"
            href="#"
            onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigate && onNavigate('support'); }}
          >
            Soporte
          </a>
          <a
            className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#4A90E2]"
            href="#"
            onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigate && onNavigate('auth'); }}
          >
            Portal Admin
          </a>
          <hr className="border-slate-200 dark:border-slate-800 my-2" />
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Modo Oscuro</span>
            <button 
              onClick={() => document.documentElement.classList.toggle('dark')} 
              className="material-symbols-outlined text-slate-500 hover:text-[#4A90E2] transition-colors"
            >
              contrast
            </button>
          </div>
          <button
            onClick={() => { setIsMobileMenuOpen(false); onReturnHome(); }}
            className="w-full bg-primary text-on-primary px-5 py-3 rounded-xl font-button text-button hover:bg-primary-container active:scale-95 transition-all mt-2"
          >
            Volver al Inicio
          </button>
        </div>
      )}

      <main className="flex-grow pt-12 pb-12 px-6">
        <div className="max-w-[800px] mx-auto space-y-stack-lg">
          
          {showCrisisBanner && (
            <div
              role="alert"
              className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start"
            >
              <span className="material-symbols-outlined text-red-600 text-3xl">emergency</span>
              <div className="space-y-2 flex-1">
                <h2 className="font-bold text-red-900 dark:text-red-200 text-lg">
                  Tu bienestar es prioritario
                </h2>
                <p className="text-red-800 dark:text-red-300 text-sm leading-relaxed">
                  Indicaste pensamientos que requieren atención inmediata. Llama al{" "}
                  <strong>113</strong> (Lima) o al <strong>988</strong> (línea de crisis). No estás solo/a.
                </p>
                <p className="text-red-800 dark:text-red-300 text-sm leading-relaxed font-medium">
                  Se ha activado automáticamente el protocolo de riesgo suicida y el equipo clínico ha sido notificado. Si te sientes en peligro inmediato, llama ahora.
                </p>
                <a
                  href="tel:113"
                  className="inline-flex items-center gap-2 mt-2 bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  Llamar ahora
                </a>
              </div>
            </div>
          )}

          <section className="text-center space-y-stack-sm">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              EVALUACIÓN COMPLETADA
            </div>
            <h1 className="font-h1 text-h1 text-on-surface">Gracias por tu honestidad</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Has dado un paso valiente hoy. Estos resultados son una herramienta para ayudarte a entender mejor tu bienestar emocional actual.
            </p>
          </section>

          {/* Visual Summary: Risk Gauge Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 flex flex-col md:flex-row items-center gap-gutter">
            <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
              {/* Circular Gauge Representation */}
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-high" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
                <circle 
                  className="text-primary" 
                  cx="96" cy="96" 
                  fill="transparent" 
                  r="80" 
                  stroke="currentColor" 
                  strokeDasharray={dashArray} 
                  strokeDashoffset={dashOffset} 
                  strokeWidth="12"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-h1 text-h1 text-primary">{animatedScore}%</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-center leading-tight mt-1">
                  Nivel de<br/>Riesgo
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-stack-sm">
              <h2 className="font-h2 text-h2 text-on-surface">Tu Perfil de Salud Mental</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {recommendation}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="bg-surface-container px-3 py-1 rounded-full text-on-surface-variant text-xs font-semibold">Nivel: {risk.level}</span>
                <span className="bg-surface-container px-3 py-1 rounded-full text-on-surface-variant text-xs font-semibold">Puntaje: {score}/27</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-on-surface">Resumen claro del resultado</h3>
            <p className="text-sm text-on-surface-variant mt-3">
              Tu resultado se ubica en la categoría <strong>{risk.level}</strong>, lo que significa que {recommendation.toLowerCase()}.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-surface-container p-4 text-sm">
                <p className="font-semibold text-on-surface">Qué mide</p>
                <p className="text-on-surface-variant mt-2">Frecuencia de síntomas emocionales y físicos en las últimas dos semanas.</p>
              </div>
              <div className="rounded-2xl bg-surface-container p-4 text-sm">
                <p className="font-semibold text-on-surface">Tu puntaje</p>
                <p className="text-on-surface-variant mt-2">{score} de 27 indicando un nivel de riesgo {risk.level.toLowerCase()}.</p>
              </div>
              <div className="rounded-2xl bg-surface-container p-4 text-sm">
                <p className="font-semibold text-on-surface">Próximo paso</p>
                <p className="text-on-surface-variant mt-2">
                  {score <= 9
                    ? "Mantén tus prácticas de autocuidado y revisa tus resultados en unas semanas."
                    : "Agenda una consulta con el Servicio Psicológico de la UPC para recibir orientación personalizada."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-on-surface">¿Qué significa tu puntaje?</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Aquí tienes una explicación clara y fácil de leer sobre el rango de puntaje obtenido.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RISK_TIERS.map((tier) => (
                <div
                  key={tier.label}
                  className={`rounded-2xl p-4 border ${tier.label === risk.level ? "border-primary bg-primary/10" : "border-slate-200 bg-surface-container"}`}
                >
                  <h4 className="font-semibold text-sm text-on-surface">{tier.label} ({tier.range})</h4>
                  <p className="text-sm text-on-surface-variant mt-2">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Grid for Detailed Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Insight Card 1 */}
            <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border border-outline-variant/20">
              <div className="flex items-center gap-3 text-secondary">
                <span className="material-symbols-outlined">psychology</span>
                <h3 className="font-bold">Análisis PHQ-9</h3>
              </div>
              <p className="text-on-surface-variant text-body-md">
                El cuestionario evalúa la frecuencia de síntomas depresivos en las últimas 2 semanas. Un puntaje de {score} sugiere una carga {risk.level.toLowerCase()} de estrés emocional en este periodo.
              </p>
            </div>

            {/* Insight Card 2 */}
            <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border border-outline-variant/20">
              <div className="flex items-center gap-3 text-primary">
                <span className="material-symbols-outlined">lightbulb</span>
                <h3 className="font-bold">Sugerencia de Enfoque</h3>
              </div>
              <p className="text-on-surface-variant text-body-md">
                {score <= 9 
                  ? "Considera practicar técnicas de relajación preventivas y mantener tus rutinas de autocuidado actuales."
                  : "Es muy recomendable agendar una cita en el Servicio Psicológico de la UPC para conversar sobre estos resultados."}
              </p>
            </div>

            {/* Insight Card 3: ML Predictive Assessment */}
            <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border border-outline-variant/20 md:col-span-2">
              <div className="flex items-center gap-3 text-violet-600 dark:text-violet-400">
                <span className="material-symbols-outlined">model_training</span>
                <h3 className="font-bold">Evaluación Predictiva (Modelo RandomForest)</h3>
              </div>

              {interpretability?.ml_prediction ? (
                <div className="space-y-4">
                  {/* Prediction Badge */}
                  <div className="flex flex-wrap items-center gap-4">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                        interpretability.ml_prediction === "riesgo_depresion"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {interpretability.ml_prediction === "riesgo_depresion" ? "warning" : "check_circle"}
                      </span>
                      {interpretability.ml_prediction === "riesgo_depresion"
                        ? "Riesgo de depresión detectado"
                        : "Sin indicadores de riesgo predictivo"}
                    </span>
                    {typeof interpretability.ml_probability === "number" && (
                      <span className="text-sm text-on-surface-variant">
                        Probabilidad estimada: <strong>{interpretability.ml_probability.toFixed(1)}%</strong>
                      </span>
                    )}
                  </div>

                  {/* Probability Bar */}
                  {typeof interpretability.ml_probability === "number" && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-on-surface-variant">
                        <span>Probabilidad de riesgo</span>
                        <span>{interpretability.ml_probability.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            interpretability.ml_probability > 50
                              ? "bg-gradient-to-r from-orange-400 to-red-500"
                              : "bg-gradient-to-r from-emerald-400 to-teal-500"
                          }`}
                          style={{ width: `${Math.min(100, interpretability.ml_probability)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Feature Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      {
                        label: "Horas de sueño",
                        value: interpretability.horas_sueno != null ? `${interpretability.horas_sueno} hrs` : "—",
                        icon: "bedtime",
                      },
                      {
                        label: "Apoyo social (MSPSS)",
                        value: interpretability.mspss_total != null ? `${interpretability.mspss_total} pts` : "—",
                        icon: "group",
                      },
                      {
                        label: "Calidad de sueño",
                        value: interpretability.calidad_sueno ?? "—",
                        icon: "star",
                      },
                      {
                        label: "Antecedentes salud mental",
                        value: interpretability.historia_salud_mental ?? "—",
                        icon: "history",
                      },
                    ].map((feat) => (
                      <div
                        key={feat.label}
                        className="bg-surface-container rounded-xl p-3 flex flex-col gap-1"
                      >
                        <span className="material-symbols-outlined text-primary text-base">{feat.icon}</span>
                        <p className="text-xs text-on-surface-variant font-medium">{feat.label}</p>
                        <p className="text-sm font-bold text-on-surface">{feat.value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-on-surface-variant italic">
                    Este modelo fue entrenado con datos de estudiantes universitarios peruanos. La evaluación predictiva complementa (no reemplaza) el diagnóstico clínico del PHQ-9.
                  </p>
                </div>
              ) : (
                <p className="text-on-surface-variant text-sm">
                  No hay evaluación predictiva disponible. Asegúrate de que el servidor backend esté activo.
                </p>
              )}
            </div>

            {/* Insight Card 4: Interpretability (feature importance table) */}
            <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border border-outline-variant/20">
              <div className="flex items-center gap-3 text-emerald-600">
                <span className="material-symbols-outlined">insights</span>
                <h3 className="font-bold">Interpretabilidad del Modelo</h3>
              </div>
              <p className="text-on-surface-variant text-body-md">
                {interpretability?.tree_path
                  ? interpretability.tree_path
                  : "No hay explicación disponible."}
              </p>

              {interpretability?.risk_factors && interpretability.risk_factors.length > 0 ? (
                <div className="w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-on-surface-variant">
                        <th className="pb-2">Variable</th>
                        <th className="pb-2">Importancia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interpretability.risk_factors.filter(Boolean).map((f: any, idx: number) => {
                        const name = typeof f === 'string' ? f : f.name || f.key || JSON.stringify(f);
                        const score = typeof f === 'object' && f.score != null ? Number(f.score) : null;
                        const pct = score != null ? Math.max(0, Math.min(100, Math.round(score * 100))) : 0;
                        return (
                          <tr key={idx} className="align-top">
                            <td className="py-2 text-on-surface-variant">{name}</td>
                            <td className="py-2">
                              {score != null ? (
                                <div className="w-full bg-surface-container rounded-full h-3">
                                  <div className="bg-primary h-3 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              ) : (
                                <span className="text-on-surface-variant italic">(importancia no disponible)</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-on-surface-variant">No se encontraron factores explicativos.</p>
              )}
            </div>
          </div>

          {/* Disclaimer Box */}
          <div className="bg-surface-variant/50 p-6 rounded-xl flex gap-4 items-start border-l-4 border-primary">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-on-surface-variant text-body-md leading-relaxed italic">
              <strong>Nota importante:</strong> Este resultado no reemplaza una evaluación clínica profesional. Es una herramienta de autopercepción diseñada para orientar. Si te sientes en riesgo o necesitas un diagnóstico formal, te recomendamos consultar con un especialista.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
            <button 
              onClick={() => onNavigate && onNavigate("support")}
              className="w-full sm:w-auto bg-primary text-on-primary font-button text-button px-8 py-4 rounded-full shadow-lg hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">medical_services</span>
              Contactar especialista
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("student-evolution")}
              className="w-full sm:w-auto bg-slate-100 text-slate-900 font-button text-button px-8 py-4 rounded-full shadow-lg hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">timeline</span>
              Ver mi evolución
            </button>
            <button className="w-full sm:w-auto bg-primary text-on-primary font-button text-button px-8 py-4 rounded-full shadow-lg hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
            onClick={handleDownloadReport}
          >
              <span className="material-symbols-outlined">download</span>
              Descargar Informe PDF
            </button>
          </div>
          <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-2 max-w-xl mx-auto">
            Se abrirá la ventana de impresión del navegador; elige "Guardar como PDF" para descargar tu informe.
          </p>

          {/* Support Image Section */}
          <div className="relative h-64 w-full rounded-2xl overflow-hidden group">
            <img 
              alt="Interior sereno de una oficina de consulta" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJFdP6DkRuyQJsGTWmj3qk2OU1oNK-m3gGRbh5EGYC9PfNyB3_tRo_9Sh5E-XEksv6rYli4nEVprUbsb9uLD8ImCFyu6JE7_xzoqv8zy9AfcDbgZ3cdys6MB4SD2TwW4mo0zuHEEYNy-dtoKQBzUTMVbm7V_TySzAlrfnzfRAPGK8uUWHAJRS7rACq3cOi9trVAGE65vAEbb64atOaHnqR5Rwv0ptaeoCL_-VN4Uqm5DamqGZoRQ7YZy6RUayUytOidBuHIyZpaw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent flex items-end p-8">
              <p className="text-white font-h2 text-h2">No estás solo en este camino.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F8FAFC] dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 full-width font-manrope text-xs tracking-wide text-slate-500 dark:text-slate-400 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 max-w-7xl mx-auto gap-4">
          <p>© 2026 Iniciativa de Salud Mental Universitaria. Para apoyo en crisis, llama al 113.</p>
          <div className="flex gap-6">
            <a className="hover:text-[#4A90E2] dark:hover:text-blue-300 transition-colors" href="#">Política de Privacidad</a>
            <a className="hover:text-[#4A90E2] dark:hover:text-blue-300 transition-colors" href="#">Contactar Soporte</a>
            <a className="hover:text-[#4A90E2] dark:hover:text-blue-300 transition-colors" href="#">Términos de Servicio</a>
            <a className="hover:text-[#4A90E2] dark:hover:text-blue-300 transition-colors" href="#">Accesibilidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
