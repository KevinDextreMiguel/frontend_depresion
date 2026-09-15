import { test, expect } from '@playwright/test';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0019 — Visualización clara del resultado
 * CA2 — Explicación del resultado
 * Contexto: se genera una clasificación.
 * Evento: el estudiante visualiza el detalle.
 * Resultado esperado: el sistema presenta una explicación sencilla del
 * significado del resultado.
 */
test('el estudiante ve una explicación en lenguaje simple de lo que significa su resultado', async ({ page, request }) => {
  test.setTimeout(90_000);

  await completeQuestionnaire(page, { phq9DefaultLabel: 'Algunas veces', phq9Item9Label: 'Nunca' }, request);

  await expect(page.getByText('Resumen claro del resultado')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('¿Qué significa tu puntaje?')).toBeVisible();
});
