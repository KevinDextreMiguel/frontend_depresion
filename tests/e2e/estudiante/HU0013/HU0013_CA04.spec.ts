import { test, expect } from '@playwright/test';

/**
 * HU0013 — Chatbot guía paso a paso durante el cuestionario
 * CA4 — Asistencia contextual
 * Contexto: el usuario requiere apoyo durante la interacción.
 * Evento: solicita ayuda.
 * Resultado esperado: el chatbot brinda orientación específica sobre el
 * proceso.
 */
test('al solicitar ayuda desde el chatbot, brinda orientación específica sobre el proceso del cuestionario', async ({ page }) => {
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
  await page.getByTestId('chatbot-quick-reply-ayuda').click();

  await expect(chatPanel.getByText(/responde cada pregunta del cuestionario/i)).toBeVisible({ timeout: 5_000 });
});
