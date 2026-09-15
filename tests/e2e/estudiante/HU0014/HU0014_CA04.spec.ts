import { test, expect } from '@playwright/test';

/**
 * HU0014 — Mensajes de apoyo durante la interacción
 * CA4 — Lenguaje empático
 * Contexto: cualquier interacción.
 * Evento: se comunica con el usuario.
 * Resultado esperado: el chatbot utiliza un lenguaje respetuoso, cálido y no
 * invasivo.
 */
test('los mensajes de bienvenida del chatbot usan un tono respetuoso y cálido, sin lenguaje invasivo', async ({ page }) => {
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

  const chatPanel = page.getByTestId('chatbot-panel');
  await expect(chatPanel).toBeVisible({ timeout: 10_000 });

  const allMessagesText = (await chatPanel.getByTestId('chatbot-message').allInnerTexts()).join(' ').toLowerCase();

  const invasiveOrHarshTerms = ['debes', 'obligatorio que', 'tienes que decirme', 'es una orden'];
  for (const term of invasiveOrHarshTerms) {
    expect(allMessagesText).not.toContain(term);
  }
  // Evidencia positiva de tono cálido/acompañante.
  expect(allMessagesText).toMatch(/te guiaré|estoy aquí|recuerda/);
});
