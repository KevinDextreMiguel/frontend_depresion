import { test, expect } from '@playwright/test';

/**
 * HU0016 — Monitorear desempeño del chatbot
 * CA3 — Identificación de incidencias
 * Contexto: se detectan errores o abandonos (el chatbot no encuentra una
 * respuesta configurada y cae en un fallback genérico).
 * Evento: el administrador analiza las interacciones.
 * Resultado esperado: el sistema resalta las conversaciones problemáticas.
 *
 * Genera una interacción "no resuelta" real (una pregunta sin match posible)
 * a través del endpoint público que el chatbot usa para reportar sus
 * interacciones, y verifica que aparezca listada como incidencia.
 */
test('el administrador identifica conversaciones del chatbot que no fueron resueltas', async ({ page, request }) => {
  const preguntaUnica = `pregunta_sin_match_e2e_${Date.now()}`;

  const reportRes = await request.post('/api/chatbot/interactions', {
    data: { pregunta: preguntaUnica, resuelta: false, clave_respuesta: null },
  });
  expect(reportRes.ok()).toBeTruthy();

  await page.goto('/');
  await page.locator('[data-testid="nav-chatbot-monitor"]').click();
  await expect(page.getByText('Desempeño del Chatbot')).toBeVisible({ timeout: 10_000 });

  await expect(page.getByText('Conversaciones problemáticas (sin resolver)')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(preguntaUnica)).toBeVisible({ timeout: 15_000 });
});
