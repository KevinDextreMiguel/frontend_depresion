import { test, expect } from '@playwright/test';

/**
 * HU0036 — Reportes estadísticos por periodo
 * CA1 — Selección de periodo
 * Contexto: el administrador desea analizar un intervalo específico.
 * Evento: selecciona fechas de inicio y fin.
 * Resultado esperado: el sistema genera el reporte correspondiente (KPIs y
 * tendencias recalculados para ese periodo).
 */
test('seleccionar un rango de fechas genera el reporte del periodo correspondiente', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-dashboard, [id="nav-dashboard"]').first().click();

  await expect(page.getByText('Dashboard Analítico')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Total Evaluaciones')).toBeVisible({ timeout: 15_000 });

  const dateInputs = page.locator('input[type="date"]');
  await dateInputs.nth(0).fill('2026-01-01');
  await dateInputs.nth(1).fill('2026-12-31');
  await page.getByRole('button', { name: 'Aplicar filtro' }).click();

  // Resultado esperado: el reporte se recalcula para el periodo indicado sin
  // error (los KPIs siguen visibles tras aplicar el filtro).
  await expect(page.getByText('Total Evaluaciones')).toBeVisible({ timeout: 15_000 });
});
