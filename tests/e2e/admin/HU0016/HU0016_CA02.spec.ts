import { test, expect } from '@playwright/test';

/**
 * HU0016 — Monitorear desempeño del chatbot
 * CA2 — Tasa de resolución
 * Contexto: existen conversaciones registradas.
 * Evento: el administrador revisa el rendimiento.
 * Resultado esperado: el sistema presenta el porcentaje de consultas
 * resueltas.
 *
 * Genera una interacción marcada como resuelta (`resuelta: true`) vía el
 * endpoint público que usa el chatbot, y confirma que el indicador
 * "Tasa de resolución" refleja al menos una interacción resuelta.
 */
test('el administrador visualiza el porcentaje de consultas resueltas del chatbot', async ({ page, request }) => {
  const preguntaResuelta = `pregunta_resuelta_e2e_${Date.now()}`;

  const reportRes = await request.post('/api/chatbot/interactions', {
    data: { pregunta: preguntaResuelta, resuelta: true, clave_respuesta: null },
  });
  expect(reportRes.ok()).toBeTruthy();

  await page.goto('/');
  await page.locator('[data-testid="nav-chatbot-monitor"]').click();
  await expect(page.getByText('Desempeño del Chatbot')).toBeVisible({ timeout: 10_000 });

  const tasaCard = page.locator('[data-testid="chatbot-kpi-tasa-resolucion"]');
  await expect(tasaCard).toBeVisible({ timeout: 15_000 });
  await expect(tasaCard.getByText(/%/)).toBeVisible();
  await expect(tasaCard.getByText(/resueltas/i)).toBeVisible();
});
