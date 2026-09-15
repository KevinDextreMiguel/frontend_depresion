import { test, expect } from '@playwright/test';

/**
 * HU0011 — Visualizar avance durante el cuestionario
 * CA4 — Finalización del progreso
 * Contexto: completa todas las preguntas.
 * Evento: llega a la última pregunta.
 * Resultado esperado: el progreso indica 100% completado.
 */
test('al llegar a la última pregunta del PHQ-9, el progreso indica 100% completado', async ({ page, request }) => {
  test.setTimeout(90_000);

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
    await page.reload();
  }

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
  for (let i = 1; i <= 12; i++) {
    await expect(page.getByText(`Pregunta ${i} de 12`)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'De acuerdo', exact: true }).click();
  }
  for (let i = 1; i <= 8; i++) {
    await expect(page.getByText(`Pregunta ${i} de 9`)).toBeVisible({ timeout: 10_000 });
    if (await closeChatbotBtn.isVisible().catch(() => false)) await closeChatbotBtn.click();
    await page.getByRole('button', { name: 'Nunca', exact: true }).click();
  }
  await expect(page.getByText('Pregunta 9 de 9')).toBeVisible({ timeout: 10_000 });
  if (await closeChatbotBtn.isVisible().catch(() => false)) await closeChatbotBtn.click();
  await page
    .getByRole('checkbox', { name: /Autorizo expresamente el tratamiento de mis respuestas de salud mental y datos demográficos/i })
    .check();
  await page.getByRole('button', { name: 'Nunca', exact: true }).click();

  await expect(page.getByTestId('questionnaire-progress-text')).toContainText('Progreso Total: 100%', { timeout: 10_000 });
});
