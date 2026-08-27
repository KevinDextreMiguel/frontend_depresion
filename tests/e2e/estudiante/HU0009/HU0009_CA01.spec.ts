import { test, expect } from '@playwright/test';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0009 — Detección de riesgo suicida (CRÍTICA)
 * CA1 — Activación automática del protocolo
 * Contexto: el estudiante responde de forma positiva en el ítem 9 del PHQ-9
 * (ver nota en tests/helpers/questionnaire.ts sobre las etiquetas reales).
 * Evento: envía sus respuestas.
 * Resultado esperado: el sistema activa automáticamente el protocolo de
 * riesgo suicida.
 *
 * Corre en el proyecto "estudiante" (ya autenticado vía storageState de
 * tests/setup/auth.setup.ts) — no repite el login, que es HU0002.
 */
test('responder positivamente el ítem 9 activa automáticamente el protocolo de riesgo suicida', async ({ page, request }) => {
  // El flujo completo (22 campos + inferencia ML + escritura en varias
  // tablas al enviar) toma más que el timeout por defecto de Playwright.
  test.setTimeout(90_000);

  await completeQuestionnaire(page, { phq9Item9Label: 'Algunas veces' }, request);

  const banner = page.getByRole('alert');
  await expect(banner).toBeVisible({ timeout: 15_000 });
  await expect(banner).toContainText('Se ha activado automáticamente el protocolo de riesgo suicida');
});
