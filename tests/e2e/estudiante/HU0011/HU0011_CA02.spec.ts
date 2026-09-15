import { test, expect } from '@playwright/test';

/**
 * HU0011 — Visualizar avance durante el cuestionario
 * CA2 — Porcentaje de avance
 * Contexto: avanza en el cuestionario.
 * Evento: completa una pregunta.
 * Resultado esperado: el sistema actualiza el porcentaje completado.
 */
test('al completar una pregunta, el sistema actualiza el porcentaje de avance mostrado', async ({ page }) => {
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

  const progressText = page.getByTestId('questionnaire-progress-text');
  await expect(progressText).toContainText('Progreso Total: 0%');

  await siguientePasoBtn.click();
  await expect(progressText).not.toContainText('Progreso Total: 0%', { timeout: 10_000 });
});
