import { test, expect } from '@playwright/test';

/**
 * HU0008 — Guardado automático de respuestas del PHQ-9
 * CA4 — Reinicio del cuestionario
 * Contexto: el estudiante abandona voluntariamente el cuestionario.
 * Evento: vuelve a iniciar un nuevo intento.
 * Resultado esperado: el sistema reinicia el cuestionario desde la primera
 * pregunta.
 */
test('al confirmar el reinicio, el sistema reinicia el cuestionario desde la primera pregunta', async ({ page }) => {
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

  // Avanza un par de pasos antes de "abandonar" reiniciando.
  await siguientePasoBtn.click();
  await expect(page.getByText('Pregunta 1 de 12')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'De acuerdo', exact: true }).click();
  await expect(page.getByText('Pregunta 2 de 12')).toBeVisible({ timeout: 10_000 });

  await page.getByTestId('questionnaire-restart-button').click();
  await page.getByTestId('restart-confirm-button').click();

  // El reinicio vuelve al paso 0 (datos demográficos); se avanza de nuevo
  // para comprobar que el cuestionario PHQ-9/MSPSS también arranca en su
  // primera pregunta, sin rastro del progreso anterior.
  await expect(page.getByRole('button', { name: 'Siguiente Paso' })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Siguiente Paso' }).click();
  await expect(page.getByText('Pregunta 1 de 12')).toBeVisible({ timeout: 10_000 });
});
