import { test, expect } from '@playwright/test';

/**
 * HU0014 — Mensajes de apoyo durante la interacción
 * CA3 — Contención emocional
 * Contexto: se detectan respuestas sensibles.
 * Evento: identifica indicadores de malestar.
 * Resultado esperado: el chatbot emite un mensaje de contención adecuado.
 */
test('al responder con un indicador de malestar alto, el chatbot emite un mensaje de contención', async ({ page }) => {
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
  const closeChatbotBtn = page.getByTestId('chatbot-close-button');
  await closeChatbotBtn.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);
  if (await closeChatbotBtn.isVisible().catch(() => false)) {
    await closeChatbotBtn.click();
  }

  await siguientePasoBtn.click();
  for (let i = 1; i <= 12; i++) {
    await expect(page.getByText(`Pregunta ${i} de 12`)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'De acuerdo', exact: true }).click();
  }
  await expect(page.getByText('Pregunta 1 de 9')).toBeVisible({ timeout: 10_000 });
  // "Casi siempre" (value=2) es un indicador de malestar alto en un ítem
  // distinto al 9 (riesgo suicida, cubierto por HU0009).
  await page.getByRole('button', { name: 'Casi siempre', exact: true }).click();

  await page.getByTestId('chatbot-open-button').click();
  const chatPanel = page.getByTestId('chatbot-panel');
  await expect(chatPanel.getByText(/esa pregunta fue difícil/i)).toBeVisible({ timeout: 5_000 });
});
