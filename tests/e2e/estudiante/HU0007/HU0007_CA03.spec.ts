import { test, expect } from '@playwright/test';

/**
 * HU0007 — Responder el PHQ-9 desde cualquier dispositivo
 * CA3 — Compatibilidad de navegador
 * Contexto: el usuario usa un navegador compatible.
 * Evento: inicia el cuestionario.
 * Resultado esperado: el sistema permite una navegación fluida y sin
 * errores.
 *
 * Se ejecuta en el proyecto "estudiante" (Chromium/Desktop Chrome, el
 * navegador de referencia de esta suite — ver playwright.config.ts, sección
 * de proyectos cross-browser comentada). Se valida ausencia de errores de
 * consola/página durante el arranque del flujo.
 */
test('iniciar el cuestionario en un navegador compatible no produce errores de consola ni de página', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('/');
  await page.getByText('Nueva Evaluación').first().click();
  await expect(page.getByTestId('evaluation-instructions')).toBeVisible({ timeout: 10_000 });
  await page.getByTestId('instructions-read-confirmation').check();
  await page.getByTestId('instructions-continue-button').click();

  await expect(
    page.getByRole('checkbox', { name: /Autorizo expresamente/i }).or(page.getByRole('button', { name: 'Siguiente Paso' }))
  ).toBeVisible({ timeout: 10_000 });

  expect(pageErrors, `Errores de página: ${pageErrors.join('; ')}`).toHaveLength(0);
  expect(
    consoleErrors.filter((e) => !e.includes('favicon')),
    `Errores de consola: ${consoleErrors.join('; ')}`
  ).toHaveLength(0);
});
