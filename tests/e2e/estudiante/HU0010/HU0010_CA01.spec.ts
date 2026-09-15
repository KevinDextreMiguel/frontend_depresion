import { test, expect } from '@playwright/test';

/**
 * HU0010 — Instrucciones claras antes de iniciar la evaluación
 * CA1 — Visualización de instrucciones
 * Contexto: el usuario ingresa al módulo de evaluación.
 * Evento: selecciona iniciar cuestionario.
 * Resultado esperado: el sistema muestra instrucciones claras y concisas.
 */
test('al seleccionar iniciar el cuestionario, el sistema muestra instrucciones claras y concisas', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Nueva Evaluación').first().click();

  const instructions = page.getByTestId('evaluation-instructions');
  await expect(instructions).toBeVisible({ timeout: 10_000 });
  await expect(instructions.getByText('Antes de comenzar la evaluación')).toBeVisible();
  await expect(instructions.getByText('¿Qué debes hacer?')).toBeVisible();
});
