import { test, expect } from '@playwright/test';

/**
 * HU0008 — Guardado automático de respuestas del PHQ-9
 * CA2 — Recuperación por interrupción temporal
 * Contexto: ocurre una interrupción inesperada durante la sesión.
 * Evento: el usuario vuelve a ingresar inmediatamente.
 * Resultado esperado: el sistema recupera las respuestas registradas antes
 * de la interrupción.
 */
test('tras una interrupción, al reingresar inmediatamente el sistema recupera las respuestas registradas', async ({ page, request }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  const userId: string | null = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('mindcheck_user');
      return raw ? JSON.parse(raw).id : null;
    } catch {
      return null;
    }
  });
  if (userId) {
    await request.delete('/api/questionnaire/progress/delete', { data: { session_id: userId } });
  }

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

  // Deja que el auto-guardado con debounce (1s, ver Questionnaire.tsx) llegue
  // al backend antes de simular la interrupción.
  await page.waitForTimeout(1500);
  await page.reload();

  await expect(page.getByText('Pregunta 2 de 12')).toBeVisible({ timeout: 15_000 });
});
