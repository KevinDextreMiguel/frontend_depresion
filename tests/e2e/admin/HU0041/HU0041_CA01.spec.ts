import { test, expect } from '@playwright/test';

/**
 * HU0041 — Monitorear el uso de la plataforma en tiempo real
 * CA1 — Monitoreo en vivo
 * Contexto: el administrador accede al panel de monitoreo.
 * Evento: se consulta el estado en vivo del sistema.
 * Resultado esperado: el sistema muestra sesiones, actividad y consumo en
 * tiempo real, y estos datos se refrescan automáticamente.
 *
 * Corre en el proyecto "admin" (storageState del administrador).
 */
test('el administrador visualiza sesiones, actividad y consumo en tiempo real', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-monitoring, [id="nav-monitoring"]').first().click();

  await expect(page.getByText('Monitoreo en Vivo')).toBeVisible({ timeout: 10_000 });

  // Resultado esperado: se muestran las métricas de sesiones activas,
  // requests totales, CPU y memoria consumidos en tiempo real.
  await expect(page.getByText('Sesiones Activas', { exact: false })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Requests Totales', { exact: false })).toBeVisible();
  await expect(page.getByText('CPU', { exact: false })).toBeVisible();
  await expect(page.getByText('Memoria', { exact: false })).toBeVisible();
});
