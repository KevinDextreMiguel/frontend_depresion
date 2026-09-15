import { test, expect } from '@playwright/test';

/**
 * HU0010 — Instrucciones claras antes de iniciar la evaluación
 * CA2 — Confirmación de lectura
 * Contexto: se presentan las instrucciones.
 * Evento: el usuario presiona continuar.
 * Resultado esperado: el sistema registra la aceptación de lectura.
 *
 * El sistema exige marcar la casilla "He leído las instrucciones..." antes de
 * habilitar "Comenzar evaluación": ese es el registro de la aceptación de
 * lectura — el botón permanece deshabilitado sin ella.
 */
test('el sistema no permite continuar sin registrar la aceptación de lectura de las instrucciones', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Nueva Evaluación').first().click();
  await expect(page.getByTestId('evaluation-instructions')).toBeVisible({ timeout: 10_000 });

  const continueBtn = page.getByTestId('instructions-continue-button');
  await expect(continueBtn).toBeDisabled();

  await page.getByTestId('instructions-read-confirmation').check();
  await expect(continueBtn).toBeEnabled();

  await continueBtn.click();
  // Al aceptar la lectura y continuar, el sistema avanza más allá de la
  // pantalla de instrucciones (registro efectivo de la aceptación).
  await expect(page.getByTestId('evaluation-instructions')).not.toBeVisible({ timeout: 10_000 });
});
