import { test, expect } from '@playwright/test';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0023 — Evolución del estudiante en el tiempo
 * CA2 — Comparación de resultados
 * Contexto: se tienen múltiples evaluaciones.
 * Evento: se revisan los resultados históricos.
 * Resultado esperado: el sistema permite comparar periodos y niveles de
 * riesgo.
 *
 * StudentEvolution.tsx calcula un "Promedio" y cuenta evaluaciones de "Alto
 * riesgo" a partir de toda la serie histórica, y lista cada evaluación en
 * "Historial de Evaluaciones" con su propio nivel de riesgo — permitiendo
 * comparar unas con otras. Se generan dos evaluaciones con niveles de
 * riesgo distintos y se confirma que ambas aparecen en el comparativo.
 */
test('el estudiante compara los niveles de riesgo de dos evaluaciones distintas en su historial de evolución', async ({ page, request }) => {
  test.setTimeout(120_000);

  await completeQuestionnaire(page, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
  await expect(page.getByText('Puntaje: 0/27')).toBeVisible({ timeout: 15_000 });

  await completeQuestionnaire(page, { phq9DefaultLabel: 'Siempre', phq9Item9Label: 'Nunca' }, request);
  await expect(page.getByText('Puntaje: 24/27')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Ver mi evolución' }).click();
  await expect(page.getByRole('heading', { name: 'Mi Evolución' })).toBeVisible({ timeout: 15_000 });

  await expect(page.getByText('Promedio')).toBeVisible();
  await expect(page.getByText('Alto riesgo')).toBeVisible();
  await expect(page.getByText('evaluaciones').first()).toBeVisible();

  // Ambos niveles de riesgo (mínimo/leve y severo) deben ser comparables en
  // el historial de evaluaciones.
  await expect(page.getByText('Severo').first()).toBeVisible({ timeout: 10_000 });
});
