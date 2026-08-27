import { expect, type Page, type APIRequestContext } from '@playwright/test';

/**
 * Helper de flujo para completar el cuestionario PHQ-9 + MSPSS en los specs
 * de HU0007/HU0008/HU0009/HU0013/HU0015. No contiene aserciones — cada CA
 * pone sus propias verificaciones después de llamarlo. Esto es
 * infraestructura reutilizable (mecánica del flujo), no el criterio en sí.
 *
 * HALLAZGO DE AUDITORÍA: las opciones reales del PHQ-9 en la UI son
 * "Nunca" / "Algunas veces" / "Casi siempre" / "Siempre" (`lib/phq9.ts`),
 * que NO coinciden con el texto de la propia HU0009 ("Varios días", "Más de
 * la mitad de los días", "Casi todos los días") ni con el fraseo estándar
 * del instrumento clínico PHQ-9. El mapeo de valores (0-3) sí es el correcto
 * para el scoring, por eso se usa aquí "Algunas veces" (value=1) como la
 * opción que activa el protocolo de riesgo en el ítem 9 — es la opción REAL
 * más baja que aún es "positiva" (>=1) según la lógica de riesgo del backend.
 */
export const PHQ9_OPTION_LABELS = ['Nunca', 'Algunas veces', 'Casi siempre', 'Siempre'] as const;
export const MSPSS_OPTION_LABELS = ['Muy en desacuerdo', 'En desacuerdo', 'De acuerdo', 'Muy de acuerdo'] as const;

export interface QuestionnaireOptions {
  /** Etiqueta de opción a elegir en los ítems 1–8 del PHQ-9 (por defecto "Nunca", value=0). */
  phq9DefaultLabel?: (typeof PHQ9_OPTION_LABELS)[number];
  /** Etiqueta de opción a elegir en el ítem 9 (riesgo suicida). */
  phq9Item9Label: (typeof PHQ9_OPTION_LABELS)[number];
  /** Etiqueta de opción MSPSS a repetir en las 12 preguntas. */
  mspssLabel?: (typeof MSPSS_OPTION_LABELS)[number];
}

/**
 * Navega desde el panel del estudiante (ya autenticado) hasta el final del
 * cuestionario, respondiendo con los valores indicados, y confirma el envío.
 * Los datos demográficos NO se tocan: sus valores por defecto ya son válidos
 * (`isDemographicsValid()` en Questionnaire.tsx pasa sin editar nada).
 */
export async function completeQuestionnaire(
  page: Page,
  options: QuestionnaireOptions,
  request?: APIRequestContext
): Promise<void> {
  const phq9Default = options.phq9DefaultLabel ?? 'Nunca';
  const mspssLabel = options.mspssLabel ?? 'De acuerdo';

  await page.goto('/');

  // HU0008 (guardado/recuperación de progreso) funciona correctamente — por
  // eso, si se reutiliza la misma cuenta de estudiante entre corridas de
  // pruebas, el cuestionario recupera progreso de un intento anterior en vez
  // de empezar limpio. Se limpia explícitamente antes de cada corrida para
  // que el test sea reproducible e independiente de ejecuciones previas.
  if (request) {
    const userId: string | null = await page.evaluate(() => {
      try {
        const raw = localStorage.getItem('mindcheck_user');
        return raw ? JSON.parse(raw).id : null;
      } catch {
        return null;
      }
    });
    if (userId) {
      await request.delete('/api/questionnaire/progress/delete', { data: { session_id: userId } });
      await page.reload();
    }
  }

  await page.getByText('Nueva Evaluación').first().click();

  // Pantalla de instrucciones (HU0010).
  await page.getByRole('checkbox', { name: /He leído las instrucciones/i }).check();
  await page.getByRole('button', { name: 'Comenzar evaluación' }).click();

  // Modal de consentimiento de salud mental (HU0035) — puede no aparecer si
  // ya se aceptó antes con la misma versión vigente (el modal decide esto de
  // forma asíncrona, tras consultar el backend). Se espera a que se resuelva
  // cualquiera de los dos estados posibles antes de decidir qué hacer.
  const consentCheckbox = page.getByRole('checkbox', { name: /Autorizo expresamente/i });
  const siguientePasoBtn = page.getByRole('button', { name: 'Siguiente Paso' });
  await Promise.race([
    consentCheckbox.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined),
    siguientePasoBtn.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined),
  ]);
  if (await consentCheckbox.isVisible()) {
    await consentCheckbox.check();
    await page.getByRole('button', { name: 'Acepto y Continuar' }).click();
  }

  // HALLAZGO: al aceptar el consentimiento, el widget del Chatbot se auto-abre
  // (comportamiento preexistente, `App.tsx::confirmConsent` dispara
  // 'mindcheck:guide:start' para todo usuario) y su panel fijo
  // (bottom-8 right-8, 384px de ancho) puede superponerse a los botones de
  // respuesta del cuestionario en viewports de ~1280px, bloqueando los clics
  // ("subtree intercepts pointer events"). Se cierra aquí para poder probar
  // HU0009 sin que un problema de otra HU (superposición de UI) bloquee esta
  // prueba — se reporta como hallazgo aparte, no se oculta.
  const closeChatbotBtn = page.getByRole('button', { name: 'close' });
  await closeChatbotBtn.waitFor({ state: 'visible', timeout: 3_000 }).catch(() => undefined);
  if (await closeChatbotBtn.isVisible().catch(() => false)) {
    await closeChatbotBtn.click();
  }

  // Paso 0 — Datos demográficos: los valores por defecto ya son válidos.
  await siguientePasoBtn.click();

  // Paso 1 — MSPSS (12 preguntas, avance automático ~300ms tras cada
  // respuesta). Se sincroniza con el indicador "Pregunta X de 12" en vez de
  // asumir que cada clic corresponde a una pregunta nueva — clickear el
  // mismo botón más rápido que la animación de avance podía registrar dos
  // clics sobre la misma pregunta.
  for (let i = 1; i <= 12; i++) {
    await expect(page.getByText(`Pregunta ${i} de 12`)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: mspssLabel, exact: true }).click();
  }

  // Paso 2 — PHQ-9 (9 preguntas). Ítems 1–8 con la opción por defecto.
  for (let i = 1; i <= 8; i++) {
    await expect(page.getByText(`Pregunta ${i} de 9`)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: phq9Default, exact: true }).click();
  }
  await expect(page.getByText('Pregunta 9 de 9')).toBeVisible({ timeout: 10_000 });

  // Defensa adicional: si el chatbot volviera a abrirse por cualquier motivo
  // antes del ítem 9, se cierra de nuevo (mismo hallazgo documentado arriba).
  if (await closeChatbotBtn.isVisible().catch(() => false)) {
    await closeChatbotBtn.click();
  }

  // Ítem 9: checkbox de consentimiento explícito + la opción bajo prueba.
  await page
    .getByRole('checkbox', { name: /Autorizo expresamente el tratamiento de mis respuestas de salud mental y datos demográficos/i })
    .check();
  await page.getByRole('button', { name: options.phq9Item9Label, exact: true }).click();

  await page.getByRole('button', { name: 'Enviar Respuestas' }).click();
}
