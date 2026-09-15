import { test, expect } from '@playwright/test';

/**
 * HU0008 — Guardado automático de respuestas del PHQ-9
 * CA3 — Confirmación de guardado
 * Contexto: se registra una respuesta.
 * Evento: el estudiante selecciona una opción.
 * Resultado esperado: el sistema muestra un mensaje de registro exitoso.
 */
test('al seleccionar una respuesta, el sistema muestra un mensaje de registro exitoso', async ({ page }) => {
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
  const closeChatbotBtn = page.getByRole('button', { name: 'close' });
  await closeChatbotBtn.waitFor({ state: 'visible', timeout: 3_000 }).catch(() => undefined);
  if (await closeChatbotBtn.isVisible().catch(() => false)) {
    await closeChatbotBtn.click();
  }

  await siguientePasoBtn.click();
  await expect(page.getByText('Pregunta 1 de 12')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'De acuerdo', exact: true }).click();

  const confirmation = page.getByTestId('answer-save-confirmation');
  await expect(confirmation).toBeVisible({ timeout: 3_000 });
  await expect(confirmation).toContainText(/registro exitoso/i);
});
