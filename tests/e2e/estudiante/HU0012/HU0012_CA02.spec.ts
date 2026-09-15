import { test, expect } from '@playwright/test';

/**
 * HU0012 — Versión amigable y accesible del cuestionario
 * CA2 — Compatibilidad con accesibilidad
 * Contexto: el usuario utiliza tecnologías de apoyo.
 * Evento: interactúa con la plataforma.
 * Resultado esperado: el sistema es compatible con lectores de pantalla y
 * navegación por teclado.
 */
test('las opciones del PHQ-9 son navegables por teclado y anunciables por lectores de pantalla', async ({ page }) => {
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

  // Barra de progreso con semántica ARIA para lectores de pantalla.
  const progressBar = page.getByTestId('questionnaire-progress-bar');
  await expect(progressBar).toHaveAttribute('role', 'progressbar');
  await expect(progressBar).toHaveAttribute('aria-label', /progreso/i);

  // Navegación por teclado: cada opción de respuesta es un <button> real
  // (focuseable con Tab y activable con Enter/Espacio, sin necesitar mouse).
  await siguientePasoBtn.click();
  await expect(page.getByText('Pregunta 1 de 12')).toBeVisible({ timeout: 10_000 });
  const firstOption = page.getByRole('button', { name: 'Muy en desacuerdo', exact: true });
  await firstOption.focus();
  await expect(firstOption).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Pregunta 2 de 12')).toBeVisible({ timeout: 10_000 });
});
