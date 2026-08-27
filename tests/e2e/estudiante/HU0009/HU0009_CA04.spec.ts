import { test, expect } from '@playwright/test';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0009 — Detección de riesgo suicida (CRÍTICA)
 * CA4 — Mensaje de contención emocional
 * Contexto: el estudiante presenta indicadores de riesgo suicida.
 * Evento: finaliza el cuestionario.
 * Resultado esperado: el sistema muestra mensaje de apoyo, orientación y
 * canales de apoyo inmediato.
 */
test('finalizar el cuestionario con riesgo detectado muestra mensaje de apoyo y canales de ayuda', async ({ page, request }) => {
  test.setTimeout(90_000);

  await completeQuestionnaire(page, { phq9Item9Label: 'Siempre' }, request);

  const banner = page.getByRole('alert');
  await expect(banner).toBeVisible({ timeout: 15_000 });
  await expect(banner).toContainText('Tu bienestar es prioritario');
  await expect(banner).toContainText('No estás solo/a');
  await expect(banner.getByRole('link', { name: /Llamar ahora/i })).toHaveAttribute('href', 'tel:113');
});
