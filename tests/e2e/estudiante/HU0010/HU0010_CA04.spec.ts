import { test, expect } from '@playwright/test';

/**
 * HU0010 — Instrucciones claras antes de iniciar la evaluación
 * CA4 — Acceso a ayuda adicional
 * Contexto: el usuario requiere orientación.
 * Evento: selecciona ayuda.
 * Resultado esperado: el sistema brinda información complementaria.
 */
test('al seleccionar la opción de ayuda desde las instrucciones, el sistema brinda información complementaria', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Nueva Evaluación').first().click();
  await expect(page.getByTestId('evaluation-instructions')).toBeVisible({ timeout: 10_000 });

  await page.getByTestId('instructions-help-button').click();

  // "Ver opciones de soporte" navega a la sección de Soporte y Recursos,
  // que lista canales de ayuda adicional (línea de crisis, recursos, etc.).
  await expect(page.getByText(/soporte/i).first()).toBeVisible({ timeout: 10_000 });
});
