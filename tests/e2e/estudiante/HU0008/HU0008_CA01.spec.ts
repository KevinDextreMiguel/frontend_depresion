import { test, expect } from '@playwright/test';

/**
 * HU0008 — Guardado automático de respuestas del PHQ-9
 * CA1 — Guardado automático
 * Contexto: el estudiante avanza en el cuestionario.
 * Evento: responde una pregunta.
 * Resultado esperado: el sistema guarda automáticamente la respuesta durante
 * la sesión activa.
 */
test('al responder una pregunta, el sistema dispara el guardado automático hacia el backend', async ({ page }) => {
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

  const saveRequestPromise = page.waitForRequest(
    (req) => req.url().includes('/api/questionnaire/progress/save') && req.method() === 'POST',
    { timeout: 10_000 }
  );

  await siguientePasoBtn.click();
  await expect(page.getByText('Pregunta 1 de 12')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'De acuerdo', exact: true }).click();

  const saveRequest = await saveRequestPromise;
  expect(saveRequest.method()).toBe('POST');
});
