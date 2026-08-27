import { test, expect } from '@playwright/test';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0009 — Detección de riesgo suicida (CRÍTICA)
 * CA2 — Evaluación independiente del puntaje total
 * Contexto: existe una respuesta positiva en el ítem 9.
 * Evento: el sistema procesa el cuestionario.
 * Resultado esperado: el sistema ejecuta el protocolo de riesgo suicida
 * independientemente del puntaje obtenido.
 *
 * A diferencia de CA1 (que solo prueba que el ítem 9 activa el protocolo),
 * este test verifica explícitamente que un puntaje TOTAL bajo (1/27 — el
 * mínimo posible con el ítem 9 en su valor positivo más bajo) no impide la
 * activación.
 */
test('un puntaje total bajo con el ítem 9 positivo igual activa el protocolo', async ({ page, request }) => {
  test.setTimeout(90_000);

  await completeQuestionnaire(page, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Algunas veces' }, request);

  await expect(page.getByText('Puntaje: 1/27')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('alert')).toBeVisible();
});
