import { test, expect } from '@playwright/test';

/**
 * HU0038 — Exportación de reportes en PDF y Excel
 * CA1 — Exportación en PDF
 * Contexto: se selecciona formato PDF.
 * Evento: se solicita la descarga.
 * Resultado esperado: el sistema genera y descarga el archivo en formato PDF.
 */
test('el administrador descarga un reporte en formato PDF', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-exports, [id="nav-exports"]').first().click();

  await expect(page.getByText('Exportación de Datos')).toBeVisible({ timeout: 10_000 });

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    page.getByRole('button', { name: /Descargar PDF/ }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});
