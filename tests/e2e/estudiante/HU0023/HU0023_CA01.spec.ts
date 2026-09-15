import { test, expect } from '@playwright/test';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0023 — Evolución del estudiante en el tiempo
 * CA1 — Visualización de evolución
 * Contexto: existen evaluaciones previas.
 * Evento: el estudiante accede a su historial.
 * Resultado esperado: el sistema muestra una gráfica de evolución temporal.
 */
test('el estudiante ve una gráfica de su evolución temporal tras completar una evaluación', async ({ page, request }) => {
  test.setTimeout(90_000);

  await completeQuestionnaire(page, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
  await expect(page.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Ver mi evolución' }).click();

  await expect(page.getByRole('heading', { name: 'Mi Evolución' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Evolución del Puntaje PHQ-9')).toBeVisible();
  await expect(page.getByText('Historial de Evaluaciones')).toBeVisible();
});
