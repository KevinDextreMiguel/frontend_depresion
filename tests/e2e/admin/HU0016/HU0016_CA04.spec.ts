import { test, expect } from '@playwright/test';

/**
 * HU0016 — Monitorear desempeño del chatbot
 * CA4 — Reportes de desempeño
 * Contexto: se requiere análisis histórico.
 * Evento: el administrador exporta información.
 * Resultado esperado: el sistema genera reportes detallados del rendimiento.
 *
 * El botón "Exportar CSV" (`chatbot-export-csv-btn`) descarga las
 * conversaciones no resueltas (incidencias) en formato CSV. Se genera una
 * incidencia real antes de exportar para que el botón esté habilitado
 * (`disabled={... incidencias.length === 0}`).
 */
test('el administrador exporta un reporte detallado del desempeño del chatbot en CSV', async ({ page, request }) => {
  const preguntaUnica = `pregunta_export_e2e_${Date.now()}`;

  const reportRes = await request.post('/api/chatbot/interactions', {
    data: { pregunta: preguntaUnica, resuelta: false, clave_respuesta: null },
  });
  expect(reportRes.ok()).toBeTruthy();

  await page.goto('/');
  await page.locator('[data-testid="nav-chatbot-monitor"]').click();
  await expect(page.getByText('Desempeño del Chatbot')).toBeVisible({ timeout: 10_000 });

  const exportBtn = page.locator('[data-testid="chatbot-export-csv-btn"]');
  await expect(exportBtn).toBeVisible({ timeout: 15_000 });
  await expect(exportBtn).toBeEnabled();

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    exportBtn.click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.csv$/i);
});
