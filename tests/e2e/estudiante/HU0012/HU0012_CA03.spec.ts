import { test, expect } from '@playwright/test';

/**
 * HU0012 — Versión amigable y accesible del cuestionario
 * CA3 — Lenguaje inclusivo
 * Contexto: el usuario lee el contenido.
 * Evento: responde el cuestionario.
 * Resultado esperado: el sistema utiliza lenguaje claro, empático e
 * inclusivo.
 */
test('el cuestionario utiliza lenguaje claro y empático, sin términos estigmatizantes', async ({ page }) => {
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
  const questionText = (await page.locator('h3.text-xl.font-bold').first().innerText()).toLowerCase();

  // Frases estigmatizantes que un cuestionario clínico bien redactado evita.
  const stigmatizingTerms = ['loco', 'demente', 'enfermo mental', 'anormal'];
  for (const term of stigmatizingTerms) {
    expect(questionText).not.toContain(term);
  }
});
