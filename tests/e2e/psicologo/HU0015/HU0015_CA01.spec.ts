import { test, expect } from '@playwright/test';

/**
 * HU0015 — Configurar respuestas predeterminadas del chatbot
 * CA1 — Creación de respuestas
 * Contexto: el psicólogo accede al módulo de configuración.
 * Evento: registra una nueva respuesta.
 * Resultado esperado: el sistema guarda la respuesta predeterminada.
 *
 * Corre en el proyecto "psicologo" (storageState del psicólogo ya autenticado).
 */
test('el psicólogo crea una nueva respuesta predeterminada del chatbot', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="nav-chatbot-config"]').click();

  await expect(page.getByText('Configurar Chatbot')).toBeVisible({ timeout: 10_000 });

  const clave = `clave_e2e_${Date.now()}`;
  const texto = `Respuesta de prueba creada por E2E ${Date.now()}`;

  await page.locator('[data-testid="chatbot-response-new-btn"]').click();
  await page.locator('[data-testid="chatbot-response-clave-input"]').fill(clave);
  await page.locator('[data-testid="chatbot-response-texto-input"]').fill(texto);
  await page.locator('[data-testid="chatbot-response-categoria-input"]').fill('Pruebas E2E');
  await page.locator('[data-testid="chatbot-response-save-btn"]').click();

  await expect(page.locator(`[data-testid="chatbot-response-row-${clave}"]`)).toBeVisible({ timeout: 15_000 });
});
