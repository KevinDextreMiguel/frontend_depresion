import { test, expect } from '@playwright/test';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0007 — Responder el PHQ-9 desde cualquier dispositivo
 * CA4 — Recuperación de sesión
 * Contexto: existe una interrupción de conexión.
 * Evento: vuelve a ingresar.
 * Resultado esperado: el sistema conserva el progreso guardado.
 *
 * Simula la interrupción recargando la página a mitad del cuestionario (el
 * guardado automático hacia el backend es HU0008; aquí se verifica el efecto
 * observable para el usuario: retomar exactamente donde se quedó).
 */
test('al reingresar tras una interrupción, el sistema conserva el progreso guardado del cuestionario', async ({ page, request }) => {
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

  // Avanza al paso 1 (MSPSS) y responde un par de preguntas antes de
  // "interrumpir" la sesión.
  await siguientePasoBtn.click();
  await expect(page.getByText('Pregunta 1 de 12')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'De acuerdo', exact: true }).click();
  await expect(page.getByText('Pregunta 2 de 12')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'De acuerdo', exact: true }).click();
  await expect(page.getByText('Pregunta 3 de 12')).toBeVisible({ timeout: 10_000 });

  // Deja tiempo para el auto-guardado con debounce (ver Questionnaire.tsx)
  // antes de simular la interrupción con una recarga completa.
  await page.waitForTimeout(1500);
  await page.reload();

  // Al reingresar, el sistema debe recuperar el progreso: seguir en el paso
  // MSPSS, ya avanzado más allá de la primera pregunta.
  await expect(page.getByText(/Pregunta [23] de 12/)).toBeVisible({ timeout: 15_000 });
});
