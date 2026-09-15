import { test, expect } from '@playwright/test';

/**
 * HU0016 — Monitorear desempeño del chatbot
 * CA1 — Visualización de métricas
 * Contexto: el administrador accede al panel.
 * Evento: consulta el dashboard.
 * Resultado esperado: el sistema muestra indicadores clave del chatbot
 * (total de interacciones y tasa de resolución).
 */
test('el administrador visualiza los indicadores clave de desempeño del chatbot', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="nav-chatbot-monitor"]').click();

  await expect(page.getByText('Desempeño del Chatbot')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-testid="chatbot-kpi-total"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-testid="chatbot-kpi-tasa-resolucion"]')).toBeVisible();
  await expect(page.locator('[data-testid="chatbot-kpi-incidencias"]')).toBeVisible();
});
