import { test, expect } from '@playwright/test';

/**
 * HU0011 — Visualizar avance durante el cuestionario
 * CA1 — Barra de progreso visible
 * Contexto: el usuario inicia el cuestionario.
 * Evento: responde preguntas.
 * Resultado esperado: el sistema muestra una barra de progreso actualizada.
 */
test('al responder preguntas, el sistema muestra una barra de progreso que se actualiza', async ({ page }) => {
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

  const progressBar = page.getByTestId('questionnaire-progress-bar');
  await expect(progressBar).toBeVisible({ timeout: 10_000 });
  const before = await progressBar.getAttribute('aria-valuenow');

  await siguientePasoBtn.click();
  await expect(page.getByText('Pregunta 1 de 12')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'De acuerdo', exact: true }).click();
  await expect(page.getByText('Pregunta 2 de 12')).toBeVisible({ timeout: 10_000 });

  const after = await progressBar.getAttribute('aria-valuenow');
  expect(Number(after)).toBeGreaterThan(Number(before));
});
