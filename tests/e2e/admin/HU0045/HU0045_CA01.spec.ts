import { test, expect } from '@playwright/test';

/**
 * HU0045 — Métricas del modelo predictivo
 * CA1 — Visualización de métricas
 * Contexto: existen resultados de evaluación del modelo.
 * Evento: el administrador accede al panel de métricas.
 * Resultado esperado: el sistema muestra indicadores como precisión, recall,
 * F1-score y exactitud.
 */
test('el administrador ve precisión, recall, F1-score y exactitud del modelo en el panel de métricas', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-mlaudit, [id="nav-mlaudit"]').first().click();

  await expect(page.getByText('Auditoría ML & Métricas')).toBeVisible({ timeout: 10_000 });

  await expect(page.getByText('Accuracy').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('F1-Score').first()).toBeVisible();
  await expect(page.getByText('Precisión').first()).toBeVisible();
  await expect(page.getByText('Recall').first()).toBeVisible();
});
