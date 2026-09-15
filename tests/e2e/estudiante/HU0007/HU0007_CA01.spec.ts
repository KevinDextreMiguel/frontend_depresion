import { test, expect, devices } from '@playwright/test';

/**
 * HU0007 — Responder el PHQ-9 desde cualquier dispositivo
 * CA1 — Acceso multidispositivo
 * Contexto: el estudiante accede desde un dispositivo compatible.
 * Evento: ingresa a la plataforma.
 * Resultado esperado: el sistema muestra el cuestionario adaptado al
 * dispositivo.
 */
test.use({ ...devices['iPhone 13'] });

test('un estudiante accede desde un dispositivo móvil y el sistema muestra el cuestionario adaptado', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Nueva Evaluación').first().click();

  await expect(page.getByTestId('evaluation-instructions')).toBeVisible({ timeout: 10_000 });
  // El contenido debe caber dentro del ancho del viewport móvil (sin scroll
  // horizontal), evidencia de que el sistema adapta la vista al dispositivo.
  const bodyScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 5);
});
