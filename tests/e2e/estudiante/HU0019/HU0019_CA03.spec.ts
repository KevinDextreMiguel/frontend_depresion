import { test, expect } from '@playwright/test';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0019 — Visualización clara del resultado
 * CA3 — Visualización amigable
 * Contexto: se accede desde cualquier dispositivo.
 * Evento: se revisa el informe.
 * Resultado esperado: el sistema presenta gráficos e indicadores fáciles de
 * interpretar.
 *
 * Results.tsx dibuja un medidor circular (SVG) con el puntaje PHQ-9 además
 * de íconos de estado (check_circle / warning). Se verifica en un viewport
 * móvil, ya que el CA menciona explícitamente "cualquier dispositivo".
 */
test('el estudiante ve gráficos e indicadores fáciles de interpretar de su resultado, incluso en un dispositivo móvil', async ({ page, request }) => {
  test.setTimeout(90_000);

  await page.setViewportSize({ width: 390, height: 844 });

  await completeQuestionnaire(page, { phq9DefaultLabel: 'Algunas veces', phq9Item9Label: 'Nunca' }, request);

  await expect(page.getByText('Tu Perfil de Salud Mental')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('svg circle').first()).toBeVisible();
  await expect(page.getByText(/Nivel:/)).toBeVisible();
});
