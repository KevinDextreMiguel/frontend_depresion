import { test, expect } from '@playwright/test';

/**
 * HU0028 — Exportar reportes individuales en PDF
 * CA3 — Error en generación
 * Contexto: ocurre una falla técnica.
 * Evento: se intenta exportar.
 * Resultado esperado: el sistema muestra un mensaje de error y opción de
 * reintento.
 *
 * `handleDownloadPdf` (AdminPanel.tsx) captura cualquier respuesta no
 * exitosa del backend y muestra un toast de error, dejando el mismo botón
 * "Descargar PDF" disponible para reintentar de inmediato (no queda
 * bloqueado). Para simular la falla técnica de forma determinística, se
 * intercepta la respuesta de red del endpoint de exportación con
 * `page.route` (sin tocar la lógica real de negocio del backend) y luego se
 * confirma que, al liberar la intercepción, un reintento sí funciona.
 */
test('si la exportación en PDF falla por un error técnico, el sistema avisa y permite reintentar', async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await page.reload();
  await page.locator('#nav-exports, [id="nav-exports"]').first().click();
  await expect(page.getByText('Exportación de Datos')).toBeVisible({ timeout: 10_000 });

  await page.route('**/reports/export/pdf**', (route) => {
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Error simulado E2E' }) });
  });

  await page.getByRole('button', { name: /Descargar PDF/i }).click();
  await expect(page.getByText(/error al descargar reporte en pdf/i)).toBeVisible({ timeout: 15_000 });

  // Opción de reintento: el mismo botón sigue habilitado y, sin la falla
  // simulada, la descarga se completa con éxito.
  await page.unroute('**/reports/export/pdf**');
  const downloadButton = page.getByRole('button', { name: /Descargar PDF/i });
  await expect(downloadButton).toBeEnabled();

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    downloadButton.click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});
