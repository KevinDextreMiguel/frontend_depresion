import { Menu, X } from "lucide-react";
import { useState } from "react";
import { getStudentLevel, hasSuicideRisk, STUDENT_LEVELS, STUDENT_LEVEL_ORDER } from "@/lib/phq9";

interface ResultsProps {
  score: number;
  interpretability?: any;
  responses?: number[];
  suicideAlert?: boolean;
  onReturnHome: () => void;
  onNavigate?: (screen: string) => void;
}

export function Results({
  score,
  interpretability = null,
  responses = [],
  suicideAlert = false,
  onReturnHome,
  onNavigate,
}: ResultsProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const level = getStudentLevel(score)!;

  const handleDownloadReport = () => {
    window.print();
  };
  const showCrisisBanner =
    suicideAlert || (responses.length >= 9 && hasSuicideRisk(responses));
  const habitsNeedCare = interpretability?.ml_prediction === "riesgo_depresion";
  const mspssMean: number | null =
    typeof interpretability?.mspss_mean === "number"
      ? interpretability.mspss_mean
      : typeof interpretability?.mspss_total === "number"
        ? interpretability.mspss_total / 12
        : null;

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
          
          <section className="text-center space-y-stack-sm">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              EVALUACIÓN COMPLETADA
            </div>
            <h1 className="font-h1 text-h1 text-on-surface">Gracias por tomarte este momento</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Detenerte a pensar en cómo te sientes ya es una forma de cuidarte. Lo que verás a continuación no es un diagnóstico: es una guía para acompañarte.
            </p>
          </section>

          {showCrisisBanner && (
            <section
              role="status"
              aria-live="polite"
              aria-label="Acompañamiento del equipo de bienestar"
              data-testid="crisis-support"
              className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start"
            >
              <span className="material-symbols-outlined text-violet-500 text-3xl">volunteer_activism</span>
              <div className="space-y-3 flex-1">
                <h2 className="font-bold text-violet-900 dark:text-violet-100 text-lg">
                  No estás solo/a
                </h2>
                <p className="text-violet-900/80 dark:text-violet-200 text-sm leading-relaxed">
                  En una de tus respuestas compartiste pensamientos que pueden ser difíciles de llevar. Gracias por la confianza de contarlo.
                  Una persona del equipo de bienestar de la UPC se pondrá en contacto contigo para conversar con calma y de forma confidencial.
                </p>
                <p className="text-violet-900/80 dark:text-violet-200 text-sm leading-relaxed">
                  Si en algún momento sientes que necesitas hablar con alguien ahora, puedes llamar gratis a la <strong>Línea 113, opción 5</strong>, disponible las 24 horas.
                </p>
                <a
                  href="tel:113"
                  className="inline-flex items-center gap-2 mt-1 bg-violet-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  Hablar con alguien ahora
                </a>
              </div>
            </section>
          )}

          {/* Resumen amable */}
          <div data-testid="result-summary" className={`rounded-xl p-8 flex flex-col md:flex-row items-center gap-gutter border ${level.bg} ${level.border}`}>
            <div className="w-32 h-32 rounded-full bg-white/70 dark:bg-slate-900/40 flex items-center justify-center flex-shrink-0">
              <span className={`material-symbols-outlined text-6xl ${level.color}`}>{level.icon}</span>
            </div>
            <div className="flex-1 space-y-stack-sm text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Cómo te has sentido estas dos semanas</p>
              <h2 className={`font-h2 text-h2 ${level.color}`}>{level.label}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{level.message}</p>
              <p className="pt-1">
                <span className="bg-white/70 dark:bg-slate-900/40 px-3 py-1 rounded-full text-on-surface-variant text-xs font-medium">Puntaje: {score}/27</span>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-on-surface">Un siguiente paso posible</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface-container p-4 text-sm">
                <p className="font-semibold text-on-surface">Para ti</p>
                <p className="text-on-surface-variant mt-2">{level.nextStep}</p>
              </div>
              <div className="rounded-2xl bg-surface-container p-4 text-sm">
                <p className="font-semibold text-on-surface">Qué revisamos</p>
                <p className="text-on-surface-variant mt-2">
                  Cómo te has sentido emocional y físicamente en las últimas dos semanas, con el cuestionario PHQ-9.
                </p>
              </div>
            </div>

            <details className="mt-4 rounded-2xl bg-surface-container p-4 text-sm">
              <summary className="cursor-pointer font-semibold text-on-surface">¿Cómo se interpreta el cuestionario?</summary>
              <p className="text-on-surface-variant mt-3">
                Un puntaje más alto indica que algunas emociones se han sentido con más frecuencia; no define quién eres y puede cambiar con el tiempo y el apoyo adecuado.
              </p>
              <ul className="mt-3 space-y-2">
                {STUDENT_LEVEL_ORDER.map((key) => {
                  const tier = STUDENT_LEVELS[key];
                  return (
                    <li
                      key={key}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 ${key === level.key ? `${tier.bg} border ${tier.border}` : ""}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${tier.dot}`} />
                      <span className="text-on-surface">{tier.label}</span>
                      <span className="ml-auto text-on-surface-variant text-xs">{tier.range}</span>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>

          {/* Hábitos y red de apoyo */}
          <div className="bg-surface-container-low p-6 rounded-xl space-y-4 border border-outline-variant/20">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined">self_improvement</span>
              <h3 className="font-bold">Tu descanso y tu red de apoyo</h3>
            </div>

            {interpretability ? (
              <div className="space-y-4">
                <p className="text-on-surface-variant text-body-md">
                  {habitsNeedCare
                    ? "Tu descanso y tu red de apoyo son aspectos que vale la pena cuidar. Dormir un poco mejor o acercarte a las personas que te importan puede hacer una diferencia, y el equipo de bienestar puede ayudarte con ello."
                    : "Tu descanso y tu red de apoyo parecen ser una fortaleza para ti. ¡Sigue cuidándolos!"}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Horas de sueño",
                      value: interpretability.horas_sueno != null ? `${interpretability.horas_sueno} h por noche` : "—",
                      icon: "bedtime",
                    },
                    {
                      label: "Calidad de sueño",
                      value: interpretability.calidad_sueno ?? "—",
                      icon: "nights_stay",
                    },
                    {
                      label: "Apoyo que percibes",
                      value: mspssMean != null ? `${mspssMean.toFixed(1)} de 7` : "—",
                      icon: "group",
                    },
                  ].map((feat) => (
                    <div key={feat.label} className="bg-surface-container rounded-xl p-3 flex flex-col gap-1">
                      <span className="material-symbols-outlined text-primary text-base">{feat.icon}</span>
                      <p className="text-xs text-on-surface-variant font-medium">{feat.label}</p>
                      <p className="text-sm font-bold text-on-surface">{feat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm">
                Por ahora no pudimos mostrar este resumen. Puedes revisarlo más tarde desde tu historial.
              </p>
            )}
          </div>

          {/* Disclaimer Box */}
          <div className="bg-surface-variant/50 p-6 rounded-xl flex gap-4 items-start border-l-4 border-primary">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-on-surface-variant text-body-md leading-relaxed">
              Este resultado no es un diagnóstico; es una herramienta para conocerte mejor y orientarte. Si quieres conversar sobre cómo te sientes, el equipo de bienestar de la UPC está para ti.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
            <button 
              onClick={() => onNavigate && onNavigate("support")}
              className="w-full sm:w-auto bg-primary text-on-primary font-button text-button px-8 py-4 rounded-full shadow-lg hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">medical_services</span>
              Conversar con un especialista
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
              <p className="text-white font-h2 text-h2">No estás solo/a en este camino.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F8FAFC] dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 full-width font-manrope text-xs tracking-wide text-slate-500 dark:text-slate-400 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 max-w-7xl mx-auto gap-4">
          <p>© 2026 Iniciativa de Salud Mental Universitaria. Si necesitas hablar con alguien, la Línea 113 (opción 5) atiende las 24 horas.</p>
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
