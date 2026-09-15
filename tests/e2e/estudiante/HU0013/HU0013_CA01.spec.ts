import { test, expect } from '@playwright/test';

/**
 * HU0013 — Chatbot guía paso a paso durante el cuestionario
 * CA1 — Inicio de guía conversacional
 * Contexto: el estudiante inicia el cuestionario.
 * Evento: selecciona la modalidad chatbot.
 * Resultado esperado: el sistema activa el chatbot y presenta una
 * bienvenida interactiva.
 *
 * Se agregó un selector explícito de modalidad ("Cuestionario guiado por
 * chatbot" / "Cuestionario directo") en EvaluationInstructions. Solo cuando
 * se elige la modalidad chatbot se dispara `mindcheck:guide:start` y se abre
 * el chat con la bienvenida guiada.
 */
test('al seleccionar la modalidad chatbot, el sistema activa el chatbot con una bienvenida guiada', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Nueva Evaluación').first().click();

  const modalitySelector = page.getByTestId('modality-selector');
  await expect(modalitySelector).toBeVisible({ timeout: 10_000 });
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

  const chatPanel = page.getByTestId('chatbot-panel');
  await expect(chatPanel).toBeVisible({ timeout: 10_000 });
  await expect(chatPanel.getByText(/te guiaré paso a paso durante la evaluación/i)).toBeVisible({ timeout: 5_000 });
});

test('al seleccionar la modalidad directa, el chatbot no se abre automáticamente', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Nueva Evaluación').first().click();

  await page.getByTestId('modality-directo-option').check();
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

  await expect(page.getByTestId('chatbot-open-button')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('chatbot-panel')).not.toBeVisible();
});
