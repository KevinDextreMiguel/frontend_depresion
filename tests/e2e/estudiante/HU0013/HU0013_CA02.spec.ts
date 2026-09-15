import { test, expect } from '@playwright/test';

/**
 * HU0013 — Chatbot guía paso a paso durante el cuestionario
 * CA2 — Orientación secuencial
 * Contexto: el usuario avanza en el cuestionario.
 * Evento: responde una pregunta.
 * Resultado esperado: el chatbot presenta la siguiente pregunta de forma
 * ordenada.
 */
test('al responder una pregunta del PHQ-9, el chatbot confirma el avance y orienta hacia la siguiente', async ({ page }) => {
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

  // El panel del chatbot se cierra para poder interactuar con las opciones
  // del cuestionario sin que el panel fijo las tape (mismo hallazgo de
  // superposición documentado en tests/helpers/questionnaire.ts); los
  // listeners de eventos del chatbot siguen activos aunque el panel esté
  // oculto, así que la orientación se sigue registrando en su historial.
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
  await page.getByRole('button', { name: 'Nunca', exact: true }).click();

  await page.getByTestId('chatbot-open-button').click();
  const chatPanel = page.getByTestId('chatbot-panel');
  await expect(chatPanel).toBeVisible({ timeout: 5_000 });
  await expect(
    chatPanel.getByText(/respondiste la pregunta 1|siguiente: por favor responde la pregunta 2/i)
  ).toBeVisible({ timeout: 5_000 });
});
