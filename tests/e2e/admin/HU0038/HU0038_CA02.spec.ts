import { test, expect } from '@playwright/test';

/**
 * HU0038 — Exportación de reportes en PDF y Excel
 * CA2 — Exportación en Excel
 * Contexto: se selecciona formato Excel.
 * Evento: se solicita la descarga.
 * Resultado esperado: el sistema genera y descarga el archivo en formato
 * XLSX.
 */
test('el administrador descarga un reporte en formato Excel (XLSX)', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-exports, [id="nav-exports"]').first().click();

  await expect(page.getByText('Exportación de Datos')).toBeVisible({ timeout: 10_000 });

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    page.getByRole('button', { name: /Descargar Excel/ }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
});
