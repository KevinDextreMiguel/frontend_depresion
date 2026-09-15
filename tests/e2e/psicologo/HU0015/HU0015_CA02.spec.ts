import { test, expect } from '@playwright/test';

/**
 * HU0015 — Configurar respuestas predeterminadas del chatbot
 * CA2 — Edición de respuestas
 * Contexto: el psicólogo desea actualizar una respuesta existente.
 * Evento: realiza modificaciones sobre una respuesta ya creada.
 * Resultado esperado: el sistema actualiza la configuración correctamente.
 *
 * Corre en el proyecto "psicologo" (storageState del psicólogo ya autenticado).
 */
test('el psicólogo edita una respuesta predeterminada existente del chatbot', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="nav-chatbot-config"]').click();
  await expect(page.getByText('Configurar Chatbot')).toBeVisible({ timeout: 10_000 });

  // Primero se crea una respuesta para asegurarnos de tener un registro propio que editar.
  const clave = `clave_e2e_edit_${Date.now()}`;
  const textoOriginal = `Texto original ${Date.now()}`;
  const textoEditado = `Texto editado ${Date.now()}`;

  await page.locator('[data-testid="chatbot-response-new-btn"]').click();
  await page.locator('[data-testid="chatbot-response-clave-input"]').fill(clave);
  await page.locator('[data-testid="chatbot-response-texto-input"]').fill(textoOriginal);
  await page.locator('[data-testid="chatbot-response-save-btn"]').click();

  const row = page.locator(`[data-testid="chatbot-response-row-${clave}"]`);
  await expect(row).toBeVisible({ timeout: 15_000 });

  // Ahora se edita esa respuesta.
  await page.locator(`[data-testid="chatbot-response-edit-${clave}"]`).click();
  const textoInput = page.locator('[data-testid="chatbot-response-texto-input"]');
  await expect(textoInput).toHaveValue(textoOriginal);
  await textoInput.fill(textoEditado);
  await page.locator('[data-testid="chatbot-response-save-btn"]').click();

  await expect(row).toBeVisible({ timeout: 15_000 });
  // Reabrir el editor confirma que el texto persistido es el nuevo.
  await page.locator(`[data-testid="chatbot-response-edit-${clave}"]`).click();
  await expect(page.locator('[data-testid="chatbot-response-texto-input"]')).toHaveValue(textoEditado);
});
