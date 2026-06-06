import { useState } from "react";

interface EvaluationInstructionsProps {
  onBegin: () => void;
  onCancel: () => void;
  onShowSupport: () => void;
}

export function EvaluationInstructions({ onBegin, onCancel, onShowSupport }: EvaluationInstructionsProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 sm:p-10">
          <div className="mb-8">
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Instrucciones antes de iniciar
            </span>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-on-surface">
              Antes de comenzar la evaluación
            </h1>
            <p className="mt-4 text-body-lg text-on-surface-variant leading-8">
              Esta evaluación es un cuestionario breve para entender cómo te has sentido en las últimas dos semanas. Responde con honestidad; no hay respuestas correctas ni incorrectas.
            </p>
          </div>

          <section className="grid gap-4">
            <div className="rounded-3xl bg-surface-variant/80 p-6 border border-outline-variant">
              <h2 className="text-xl font-semibold text-on-surface">¿Qué debes hacer?</h2>
              <ul className="mt-4 space-y-3 text-body-md text-on-surface-variant leading-7 list-disc list-inside">
                <li>Lee cada pregunta atentamente y selecciona la opción que mejor describe tu experiencia.</li>
                <li>Responde según lo que realmente has sentido durante las últimas 2 semanas.</li>
                <li>Si lo deseas, puedes volver atrás antes de enviar tu evaluación.</li>
                <li>Tu información se procesa de forma anónima y segura para brindarte orientación.</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-surface-variant/80 p-6 border border-outline-variant">
              <h2 className="text-xl font-semibold text-on-surface">¿Por qué es importante?</h2>
              <p className="mt-4 text-body-md text-on-surface-variant leading-7">
                Esta herramienta ayuda a identificar señales de riesgo emocional y suicida. Si tu respuesta al ítem 9 indica riesgo, se activará un protocolo de atención prioritaria.
              </p>
            </div>

            <div className="rounded-3xl bg-surface-variant/80 p-6 border border-outline-variant">
              <h2 className="text-xl font-semibold text-on-surface">Acceso a ayuda adicional</h2>
              <p className="mt-4 text-body-md text-on-surface-variant leading-7">
                Si necesitas apoyo ahora mismo, puedes visitar la sección de soporte o comunicarte con un profesional de confianza.</p>
              <button
                type="button"
                onClick={onShowSupport}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-all hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Ver opciones de soporte
              </button>
            </div>
          </section>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <label className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-body-md text-on-surface leading-7">
                He leído las instrucciones y comprendo el propósito de esta evaluación.
              </span>
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              Volver al inicio
            </button>
            <button
              type="button"
              disabled={!confirmed}
              onClick={onBegin}
              className={`w-full sm:w-auto rounded-full px-6 py-3 text-sm font-semibold text-white transition-all ${
                confirmed ? "bg-primary hover:bg-primary-container" : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              Comenzar evaluación
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
