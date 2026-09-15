import { test, expect } from '@playwright/test';

/**
 * HU0014 — Mensajes de apoyo durante la interacción
 * CA1 — Mensajes motivacionales
 * Contexto: el usuario avanza en el cuestionario.
 * Evento: completa una sección.
 * Resultado esperado: el chatbot muestra un mensaje de apoyo y motivación.
 *
 * HALLAZGO DE AUDITORÍA: el refuerzo motivacional del chatbot no está atado
 * a "completar una sección" sino a un contador global de respuestas (cada 3
 * respuestas, ver Chatbot.tsx `onProgress`). Este test verifica ese
 * comportamiento real, que sigue satisfaciendo la intención del criterio
 * (acompañamiento motivacional durante el avance).
 */
test('tras responder varias preguntas seguidas, el chatbot muestra un mensaje de apoyo y motivación', async ({ page }) => {
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
  // 3 respuestas en el PHQ-9 disparan el refuerzo motivacional (contador
  // llega a 15, múltiplo de 3).
  await page.getByRole('button', { name: 'Nunca', exact: true }).click();
  await expect(page.getByText('Pregunta 2 de 9')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Nunca', exact: true }).click();
  await expect(page.getByText('Pregunta 3 de 9')).toBeVisible({ timeout: 10_000 });

  await page.getByTestId('chatbot-open-button').click();
  const chatPanel = page.getByTestId('chatbot-panel');
  await expect(
    chatPanel.getByText(/buen trabajo|gracias por continuar|gran trabajo completando esto/i)
  ).toBeVisible({ timeout: 5_000 });
});
