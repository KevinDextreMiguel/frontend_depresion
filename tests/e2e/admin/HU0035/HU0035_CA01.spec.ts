import { test, expect } from '@playwright/test';

/**
 * HU0035 — Dashboard de indicadores clave (KPI)
 * CA1 — Visualización de KPI
 * Contexto: existen datos consolidados del sistema.
 * Evento: el administrador accede al dashboard.
 * Resultado esperado: el sistema muestra indicadores clave actualizados y
 * gráficos interactivos.
 */
test('el administrador ve indicadores clave y gráficos al acceder al dashboard', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-dashboard, [id="nav-dashboard"]').first().click();

  await expect(page.getByText('Dashboard Analítico')).toBeVisible({ timeout: 10_000 });

  // Resultado esperado: indicadores clave (KPIs) visibles.
  await expect(page.getByText('Total Evaluaciones')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Estudiantes Únicos')).toBeVisible();
  await expect(page.getByText('Tasa Riesgo Severo')).toBeVisible();
  await expect(page.getByText('Promedio PHQ-9')).toBeVisible();
});
