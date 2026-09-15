import { test, expect } from '@playwright/test';

/**
 * HU0013 — Chatbot guía paso a paso durante el cuestionario
 * CA3 — Reanudación guiada
 * Contexto: existe una interrupción.
 * Evento: el usuario retoma la sesión.
 * Resultado esperado: el chatbot continúa desde el último punto registrado.
 *
 * El progreso guiado (guidedMode/guidedIndex) se persiste en localStorage
 * (`mindcheck_chatbot_guided_state`) junto con el progreso del cuestionario.
 * Al recargar la página, si ambos existen, el chatbot se reabre mostrando un
 * mensaje de continuación desde la pregunta correcta.
 */
test('al recargar la página tras avanzar, el chatbot retoma la sesión desde el último punto', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Nueva Evaluación').first().click();
  await page.getByTestId('modality-chatbot-option').check();
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

  await expect(page.getByTestId('chatbot-panel')).toBeVisible({ timeout: 10_000 });

  // Cerramos el panel para poder interactuar con el cuestionario, y
  // avanzamos algunas preguntas para generar progreso guardado.
  await page.getByTestId('chatbot-close-button').click();
  await siguientePasoBtn.click();
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'De acuerdo', exact: true }).click();
  }

  // Confirmamos que hay progreso guiado y de cuestionario persistidos.
  const guidedState = await page.evaluate(() => localStorage.getItem('mindcheck_chatbot_guided_state'));
  expect(guidedState).not.toBeNull();

  await page.reload();

  const chatPanel = page.getByTestId('chatbot-panel');
  await expect(chatPanel).toBeVisible({ timeout: 10_000 });
  await expect(chatPanel.getByText(/hemos retomado tu evaluación/i)).toBeVisible({ timeout: 5_000 });
});
