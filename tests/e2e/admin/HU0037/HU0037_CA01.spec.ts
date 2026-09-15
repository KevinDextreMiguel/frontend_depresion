import { test, expect } from '@playwright/test';

/**
 * HU0037 — Analizar tendencias de riesgo en la población estudiantil
 * CA1 — Análisis de tendencias
 * Contexto: existen datos históricos suficientes.
 * Evento: se consulta el módulo analítico.
 * Resultado esperado: el sistema muestra tendencias por periodo, facultad o
 * grupo.
 *
 * HALLAZGO: la HU describe esta capacidad "Como psicólogo", pero el ítem de
 * navegación "Dashboard Analítico" (`nav-dashboard`, AdminPanel.tsx) solo es
 * visible cuando `getAuthUser()?.rol === "admin"` — un psicólogo no tiene
 * este acceso en la UI, aunque el backend (`dashboard-kpis`/`trends-advanced`)
 * sí acepta ambos roles. Se prueba con la sesión que realmente tiene acceso
 * (admin) y se reporta el hallazgo por separado (mismo patrón que
 * admin/HU0028/HU0028_CA01).
 */
test('el administrador consulta el módulo analítico y ve tendencias por periodo y carrera', async ({ page }) => {
  test.setTimeout(30_000);

  await page.goto('/');
  await page.locator('#nav-dashboard, [id="nav-dashboard"]').first().click();

  await expect(page.getByText('Dashboard Analítico')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Total Evaluaciones')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Tendencias por Periodo / Carrera')).toBeVisible();
  await expect(page.getByPlaceholder('Filtrar por carrera...')).toBeVisible();
});
