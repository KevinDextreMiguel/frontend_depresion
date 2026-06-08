import { Shield } from "lucide-react";

interface LandingPageProps {
  onStartEvaluation: () => void;
  onShowInfo: () => void;
  onNavigate?: (screen: string) => void;
  hasSavedProgress?: boolean;
  onContinueEvaluation?: () => void;
}

export function LandingPage({ 
  onStartEvaluation, 
  onShowInfo, 
  onNavigate, 
  hasSavedProgress = false,
  onContinueEvaluation 
}: LandingPageProps) {
  return (
    <div className="bg-background text-on-background font-body-md antialiased w-full">
      <main className="w-full pt-6 pb-12">
        {/* Banner de Cuestionario Guardado / Pendiente */}
        {hasSavedProgress && onContinueEvaluation && (
          <div className="max-w-7xl mx-auto px-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 animate-pulse">
                  <span className="material-symbols-outlined text-2xl">assignment_late</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Tienes una evaluación en progreso</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Retoma tu cuestionario desde donde te quedaste para no perder tus respuestas.</p>
                </div>
              </div>
              <button
                onClick={onContinueEvaluation}
                className="w-full md:w-auto px-6 py-3 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continuar Evaluación</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-outline-variant">
              <span className="text-label-caps font-label-caps text-on-secondary-container">
                INICIATIVA DE BIENESTAR UNIVERSITARIO
              </span>
            </div>
            <h1 className="font-h1 text-h1 text-on-surface max-w-xl">
              Prioriza tu salud mental con <span className="text-primary">MindCheck</span>.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
              Tamizaje temprano de depresión en jóvenes universitarios de Lima. Un espacio seguro, anónimo y profesional
              para entender tu bienestar emocional hoy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => onNavigate && onNavigate('auth')}
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-button text-button hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                Registrarse para Empezar
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                onClick={onShowInfo}
                className="border-2 border-primary text-primary px-8 py-4 rounded-xl font-button text-button hover:bg-surface-container-low active:scale-95 transition-all flex items-center justify-center"
              >
                Conoce más
              </button>
            </div>
            <div className="flex items-center gap-6 pt-8 border-t border-outline-variant/30">
              <div className="flex -space-x-3">
                <img
                  className="w-10 h-10 rounded-full border-2 border-background"
                  alt="Estudiante universitario"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaEJ2HAd3buxzI12y-FhBCN8ORSQV46DBJRikRwzUzWLnGN2HaSfUJ-z2XquAqSBDZTdwHS79CLQdIg5AgWoK-lgb_ilRfxbkw4kgwBP_wr1S6F-oQZSyjdwiJyHhHRU207pE-SOq_pjA-iFv8i6rOuXNtaOO7KzXtWtYVQ_D3nMrS5LhYztpxd3RCPjMeHWRJVdBowJQ1h-ZFzKxQnV--Y1N_-RJj7QVFlkovevVlewEXL_ezWYGatfWHh24qLqt134iKxbQEZQ"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-background"
                  alt="Estudiante universitaria en Lima"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi-iJMxh1_GSuviky7xB8xXWbAVVyIZ1rFxWaEs0UaC8CGW0OeJzSyk_DwERKw4Bqw-ifGxVZUWitXk4SMnOD3_HeMUBq5zGpAWrdKYFiz8K32UIP-qGiv4ANVh8ynBP0ofwHAKAKIYZCFMygLGyf5zt-5SEhvRUHWV4rKA53jg3hBQoXihr-ozoA7iScwtJeuXhSZn8Oi1Kyt41E8X4FbvW8UvgCLwbVY2Bw81ewTwPJMf5G_ARx2Q_EDjcU2gxvZylKDhUPidg"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-background"
                  alt="Joven profesional"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8-mV1HzwuE0sPEqVDPIvxgvjsmxH77Gq2Hi-jqW1zG3gU7oyDxsy2ixzhlkEdVUvw-OJUJv_552_D6dB7BlhPEXQFs_m8y-L8QRK8_g9Bj-YRWWOjS43RhDp-xinvMq9WGVLnbpgZY14U3P3yE2TL1soT65AVqG6fOtBiMdLwA4Zs6C8DC_01kCiXF0uIo5XanJQrNy6igUfFzmxzd_GzLQNjSVIunjMrtfOSh-BVXoALdgAHIbErMQ7ESn9DnAzarEhxbPHqGg"
                />
              </div>
              <p className="text-label-caps font-label-caps text-on-surface-variant">+2,500 estudiantes ya participaron</p>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
            <div className="relative bg-white p-4 rounded-[2rem] border border-outline-variant soft-elevation">
              <img
                className="w-full h-[500px] object-cover rounded-[1.5rem]"
                alt="Conversación de apoyo"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHaH_FzvK7hbBdaFsskK4Ma9t-VqONjBTY-85xHentNUJg07oYoPJHtTqfrRueHm7T2TwICf1dHsrV69mzsi93EHNOHP3Rinc9yFYzuU4BS1q2OaEDR2UuOLZPgth3uauWlrLu1bm-4bBIO2AoS2Rw_vtLp47FDtxiqNfteVsaEkTiH2Rfzk2aNYnISf8M1qdbPZ588H4kTzGCP3bsL5bPqUOl-x-Zoi2rPlP-JSy4QBJ5J5G_GLPx_kxQk8g-Jq5m9S9_R5I-1g"
              />
              {/* Floating Empathetic Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl soft-elevation border border-primary/10 max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="material-symbols-outlined text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                  <span className="font-bold text-on-surface text-sm">Privado & Seguro</span>
                </div>
                <p className="text-xs text-on-surface-variant">Tus datos son anónimos y protegidos bajo estándares éticos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="bg-surface-container-low py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-h2 text-h2 text-on-surface">Un proceso diseñado para ti</h2>
              <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto">
                Nuestro enfoque de Minimalismo Suave reduce la carga cognitiva para brindarte una experiencia tranquila y
                enfocada.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Card 1 */}
              <div className="md:col-span-2 bg-white p-10 rounded-3xl border border-outline-variant flex flex-col justify-between hover:border-primary/30 transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">analytics</span>
                  </div>
                  <h3 className="font-h2 text-2xl text-on-surface">Validación Clínica</h3>
                  <p className="text-body-md text-on-surface-variant">
                    Utilizamos instrumentos estandarizados para jóvenes universitarios, asegurando resultados precisos y
                    confiables basados en evidencia científica local.
                  </p>
                </div>
                <div className="mt-8 pt-8 border-t border-outline-variant/30 flex items-center justify-between">
                  <span className="text-label-caps font-label-caps text-primary">BASADO EN EL PHQ-9</span>
                  <span className="material-symbols-outlined text-outline">arrow_outward</span>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-primary p-10 rounded-3xl text-on-primary flex flex-col justify-between shadow-xl shadow-primary/10">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined">timer</span>
                  </div>
                  <h3 className="font-h2 text-2xl">Solo 5 Minutos</h3>
                  <p className="opacity-90">
                    Evaluación ágil diseñada para adaptarse a tu ritmo de vida universitario sin generar estrés adicional.
                  </p>
                </div>
                <button
                  onClick={onStartEvaluation}
                  className="mt-8 w-full bg-white text-primary py-3 rounded-xl font-button hover:bg-opacity-90 transition-all"
                >
                  Empezar ahora
                </button>
              </div>
              {/* Card 3 */}
              <div className="bg-white p-10 rounded-3xl border border-outline-variant flex flex-col gap-6 hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">forum</span>
                </div>
                <h3 className="font-h2 text-2xl text-on-surface">Soporte Inmediato</h3>
                <p className="text-body-md text-on-surface-variant">
                  Al finalizar, recibirás una guía de recursos y centros de apoyo disponibles en Lima.
                </p>
              </div>
              {/* Card 4 */}
              <div className="md:col-span-2 bg-white p-10 rounded-3xl border border-outline-variant flex flex-col md:flex-row items-center gap-10 hover:border-primary/30 transition-all">
                <div className="flex-1 space-y-4">
                  <h3 className="font-h2 text-2xl text-on-surface">Resultados en Tiempo Real</h3>
                  <p className="text-body-md text-on-surface-variant">
                    Visualiza tu estado emocional a través de gráficos simples y recomendaciones personalizadas para tu
                    bienestar diario.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                      Reporte descargable
                    </li>
                    <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                      Seguimiento de progreso
                    </li>
                  </ul>
                </div>
                <div className="flex-1 w-full bg-surface-container rounded-2xl p-6 border border-outline-variant/50">
                  <div className="h-4 bg-white rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-secondary w-2/3"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-white/60 rounded-full w-full"></div>
                    <div className="h-3 bg-white/60 rounded-full w-5/6"></div>
                    <div className="h-3 bg-white/60 rounded-full w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contextual Help Section */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="bg-white p-12 rounded-[3rem] border border-outline-variant soft-elevation space-y-6">
            <span
              className="material-symbols-outlined text-5xl text-primary"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
            >
              volunteer_activism
            </span>
            <h2 className="font-h2 text-3xl text-on-surface">¿Necesitas hablar con alguien ahora?</h2>
            <p className="text-body-md text-on-surface-variant max-w-xl mx-auto">
              Si te encuentras en una situación de crisis, por favor contacta a los servicios de emergencia de inmediato.
              No estás solo.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                className="bg-error text-on-error px-6 py-3 rounded-full font-button flex items-center gap-2 hover:opacity-90 transition-opacity"
                href="tel:988"
              >
                <span className="material-symbols-outlined">call</span>
                Llamar al 988 (Línea de Crisis)
              </a>
              <a
                className="bg-surface-container text-primary px-6 py-3 rounded-full font-button flex items-center gap-2 hover:bg-surface-variant transition-colors"
                href="#"
                onClick={(e) => { e.preventDefault(); onShowInfo(); }}
              >
                <span className="material-symbols-outlined">chat</span>
                Chat de ayuda en vivo
              </a>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
