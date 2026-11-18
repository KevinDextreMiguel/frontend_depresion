import { test, expect } from '@playwright/test';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0019 — Visualización clara del resultado
 * CA1 — Presentación clara del resultado
 * Contexto: la evaluación ha finalizado.
 * Evento: el estudiante consulta sus resultados.
 * Resultado esperado: el sistema muestra el nivel de riesgo de forma clara y
 * destacada.
 */
test('el estudiante ve su nivel de riesgo de forma clara y destacada al terminar la evaluación', async ({ page, request }) => {
  test.setTimeout(90_000);

  await completeQuestionnaire(page, { phq9DefaultLabel: 'Algunas veces', phq9Item9Label: 'Nunca' }, request);

  await expect(page.getByText('Cómo te has sentido estas dos semanas')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('result-summary')).toBeVisible();
  await expect(page.getByText(/Puntaje: \d+\/27/)).toBeVisible();
});
