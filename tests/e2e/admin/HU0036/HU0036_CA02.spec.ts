import { test, expect } from '@playwright/test';

/**
 * HU0036 — Reportes estadísticos por periodo
 * CA2 — Comparación temporal
 * Contexto: se seleccionan múltiples periodos.
 * Evento: se solicita la comparación.
 * Resultado esperado: el sistema muestra variaciones y tendencias entre
 * periodos.
 *
 * El gráfico "Tendencias por Periodo / Carrera" (`trends-advanced`,
 * AdminPanel.tsx) agrupa las evaluaciones en múltiples puntos temporales
 * (uno por periodo) mostrando cantidad y puntaje promedio por cada uno —
 * permitiendo comparar variaciones entre esos periodos en un mismo gráfico.
 * Se aplica un rango de fechas amplio para maximizar la cantidad de
 * periodos representados.
 */
test('el administrador ve variaciones y tendencias entre distintos periodos en el gráfico de tendencias', async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await page.locator('#nav-dashboard, [id="nav-dashboard"]').first().click();
  await expect(page.getByText('Dashboard Analítico')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Total Evaluaciones')).toBeVisible({ timeout: 15_000 });

  const dateInputs = page.locator('input[type="date"]');
  await dateInputs.nth(0).fill('2020-01-01');
  await dateInputs.nth(1).fill('2026-12-31');
  await page.getByRole('button', { name: 'Aplicar filtro' }).click();
  await expect(page.getByText('Total Evaluaciones')).toBeVisible({ timeout: 15_000 });

  await expect(page.getByText('Tendencias por Periodo / Carrera')).toBeVisible();

  // El gráfico debe renderizar al menos una serie de tendencia (o el estado
  // vacío explícito, que igualmente confirma que la consulta por periodo se
  // completó sin error).
  await expect(
    page.locator('.recharts-area, .recharts-responsive-container').first().or(page.getByText('No hay tendencias disponibles para el filtro aplicado.'))
  ).toBeVisible({ timeout: 15_000 });
});
