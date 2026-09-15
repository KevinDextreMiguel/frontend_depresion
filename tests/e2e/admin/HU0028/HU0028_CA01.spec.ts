import { test, expect } from '@playwright/test';

/**
 * HU0028 — Exportar reportes individuales en PDF
 * CA1 — Exportación en PDF
 * Contexto: se selecciona un rango de datos a exportar.
 * Evento: se solicita exportar el reporte.
 * Resultado esperado: el sistema genera un archivo PDF descargable.
 *
 * HALLAZGO: la HU describe esta capacidad "Como psicólogo", pero en el
 * código la pestaña "Exportar Datos" (`renderExports`) solo es visible para
 * el rol admin (`getAuthUser()?.rol === "admin"`, ver nav en AdminPanel.tsx)
 * — un psicólogo no tiene este ítem de menú. Se prueba con la sesión que
 * realmente tiene acceso (admin) y se reporta el hallazgo por separado.
 */
test('el administrador exporta un reporte consolidado en PDF descargable', async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await page.reload();

  await page.getByRole('button', { name: 'Exportar Datos' }).click();
  await expect(page.getByText('Exportar Reportes')).toBeVisible({ timeout: 15_000 });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Descargar PDF/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});
