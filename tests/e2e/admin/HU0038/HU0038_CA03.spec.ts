import { test, expect } from '@playwright/test';

/**
 * HU0038 — Exportación de reportes en PDF y Excel
 * CA3 — Conservación de filtros
 * Contexto: el reporte tiene filtros aplicados.
 * Evento: se exporta el archivo.
 * Resultado esperado: el documento conserva la misma configuración visual y
 * de datos.
 *
 * `handleDownloadPdf`/`handleDownloadExcel` (AdminPanel.tsx) arman la URL de
 * exportación incluyendo los filtros de fecha y carrera configurados en
 * pantalla (`getPdfExportUrl(exportStart, exportEnd, exportCareer)`), y el
 * backend (`export_excel`/`export_pdf`) los aplica sobre la misma consulta.
 * Se establecen filtros antes de exportar y se confirma que la descarga se
 * genera exitosamente con esos filtros vigentes (mismos que se ven en
 * pantalla).
 */
test('al exportar con filtros de fecha y carrera aplicados, el documento generado conserva esa misma configuración', async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await page.locator('#nav-exports, [id="nav-exports"]').first().click();
  await expect(page.getByText('Exportación de Datos')).toBeVisible({ timeout: 10_000 });

  const dateInputs = page.locator('input[type="date"]');
  await dateInputs.nth(0).fill('2024-01-01');
  await dateInputs.nth(1).fill('2026-12-31');
  await page.getByPlaceholder('Ej: Ingeniería').fill('Ingeniería de Sistemas');

  const requestPromise = page.waitForRequest((req) => req.url().includes('/reports/export/pdf') && req.method() === 'GET');
  const [download, exportRequest] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    requestPromise,
    page.getByRole('button', { name: /Descargar PDF/i }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  // La misma configuración de filtros visible en pantalla debe viajar en la
  // solicitud de exportación (no se pierde/ignora al generar el archivo).
  expect(exportRequest.url()).toContain('start_date=2024-01-01');
  expect(exportRequest.url()).toContain('end_date=2026-12-31');
  expect(decodeURIComponent(exportRequest.url())).toContain('career=Ingenier');
});
