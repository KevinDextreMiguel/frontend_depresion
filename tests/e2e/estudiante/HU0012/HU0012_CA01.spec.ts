import { test, expect } from '@playwright/test';

/**
 * HU0012 — Versión amigable y accesible del cuestionario
 * CA1 — Interfaz accesible
 * Contexto: el usuario accede al cuestionario.
 * Evento: visualiza la interfaz.
 * Resultado esperado: el sistema presenta una interfaz clara, intuitiva y
 * legible.
 */
test('la interfaz del cuestionario es clara e intuitiva: título, progreso y opciones de respuesta visibles', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Nueva Evaluación').first().click();
  await page.getByTestId('instructions-read-confirmation').check();
  await page.getByTestId('instructions-continue-button').click();

  const consentCheckbox = page.getByRole('checkbox', { name: /Autorizo expresamente/i });
  const siguientePasoBtn = page.getByRole('button', { name: 'Siguiente Paso' });
  await Promise.race([
    consentCheckbox.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined),
    siguientePasoBtn.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined),
  ]);
  if (await consentCheckbox.isVisible()) {
    await consentCheckbox.check();
    await page.getByRole('button', { name: 'Acepto y Continuar' }).click();
  }

  await expect(page.getByText('Cuestionario Integral de Bienestar')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('questionnaire-progress-bar')).toBeVisible();
  await expect(siguientePasoBtn).toBeVisible();
});
