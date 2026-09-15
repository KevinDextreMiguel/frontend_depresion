import { test, expect } from '@playwright/test';

/**
 * HU0011 — Visualizar avance durante el cuestionario
 * CA3 — Indicador de preguntas
 * Contexto: el usuario navega entre preguntas.
 * Evento: cambia de pregunta.
 * Resultado esperado: el sistema muestra la pregunta actual y total.
 */
test('al cambiar de pregunta, el sistema muestra el número de pregunta actual y el total', async ({ page }) => {
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
  await expect(page.getByText('Pregunta 2 de 12')).toBeVisible({ timeout: 10_000 });

  // Avanza hasta el PHQ-9 para verificar también su indicador "X de 9".
  for (let i = 2; i <= 12; i++) {
    await page.getByRole('button', { name: 'De acuerdo', exact: true }).click();
  }
  await expect(page.getByTestId('phq9-question-indicator')).toHaveText('Pregunta 1 de 9', { timeout: 10_000 });
});
