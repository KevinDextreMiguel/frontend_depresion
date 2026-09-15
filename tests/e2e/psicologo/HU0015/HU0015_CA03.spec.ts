import { test, expect } from '@playwright/test';

/**
 * HU0015 — Configurar respuestas predeterminadas del chatbot
 * CA3 — Clasificación por categoría
 * Contexto: el psicólogo gestiona múltiples respuestas.
 * Evento: las organiza por tipo de consulta.
 * Resultado esperado: el sistema permite categorizarlas y administrarlas.
 *
 * La tabla de respuestas del chatbot (`chatbot-responses-table`) muestra una
 * columna "Categoría" (AdminPanel.tsx) que refleja el campo `categoria` de
 * cada respuesta creada vía `chatbot-response-categoria-input`. Se crean dos
 * respuestas con categorías distintas y se confirma que cada una se lista
 * bajo su propia categoría.
 */
test('el psicólogo organiza respuestas del chatbot en distintas categorías y el sistema las administra por separado', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="nav-chatbot-config"]').click();
  await expect(page.getByText('Configurar Chatbot')).toBeVisible({ timeout: 10_000 });

  const claveA = `clave_cat_a_${Date.now()}`;
  const claveB = `clave_cat_b_${Date.now()}`;

  await page.locator('[data-testid="chatbot-response-new-btn"]').click();
  await page.locator('[data-testid="chatbot-response-clave-input"]').fill(claveA);
  await page.locator('[data-testid="chatbot-response-texto-input"]').fill('Respuesta categoría Ansiedad');
  await page.locator('[data-testid="chatbot-response-categoria-input"]').fill('Ansiedad');
  await page.locator('[data-testid="chatbot-response-save-btn"]').click();
  await expect(page.locator(`[data-testid="chatbot-response-row-${claveA}"]`)).toBeVisible({ timeout: 15_000 });

  await page.locator('[data-testid="chatbot-response-new-btn"]').click();
  await page.locator('[data-testid="chatbot-response-clave-input"]').fill(claveB);
  await page.locator('[data-testid="chatbot-response-texto-input"]').fill('Respuesta categoría Sueño');
  await page.locator('[data-testid="chatbot-response-categoria-input"]').fill('Sueño');
  await page.locator('[data-testid="chatbot-response-save-btn"]').click();
  await expect(page.locator(`[data-testid="chatbot-response-row-${claveB}"]`)).toBeVisible({ timeout: 15_000 });

  const rowA = page.locator(`[data-testid="chatbot-response-row-${claveA}"]`);
  const rowB = page.locator(`[data-testid="chatbot-response-row-${claveB}"]`);
  await expect(rowA.getByText('Ansiedad')).toBeVisible();
  await expect(rowB.getByText('Sueño')).toBeVisible();
});
