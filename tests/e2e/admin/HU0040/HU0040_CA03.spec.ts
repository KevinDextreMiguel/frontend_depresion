import { test, expect } from '@playwright/test';

/**
 * HU0040 — Gestión de usuarios, psicólogos y configuraciones generales
 * CA3 — Configuración general
 * Contexto: se actualizan parámetros del sistema.
 * Evento: se guardan los cambios.
 * Resultado esperado: el sistema aplica la nueva configuración.
 *
 * La sección "Parámetros del Sistema" (`Monitoreo en Vivo`, AdminPanel.tsx)
 * permite editar cualquier fila de `configuracion_sistema` y persistirla vía
 * `PUT /api/admin-ext/settings/{id}`. Se edita el parámetro
 * "anomalous_session_threshold" y se confirma que el nuevo valor persiste
 * tras recargar.
 */
test('el administrador actualiza un parámetro de configuración general y el sistema lo aplica', async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await page.reload();
  await page.locator('#nav-monitoring').click();
  await expect(page.getByText('Monitoreo en Vivo')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Cargar configuración' }).click();

  const label = page.getByText('anomalous_session_threshold', { exact: true });
  await expect(label).toBeVisible({ timeout: 15_000 });
  const row = label.locator('xpath=ancestor::div[contains(@class,"flex-col")][1]');
  await expect(row).toBeVisible();

  const newValue = String(40 + (Date.now() % 10));
  await row.locator('input').fill(newValue);
  await row.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Configuración actualizada.')).toBeVisible({ timeout: 10_000 });

  await page.reload();
  await page.locator('#nav-monitoring').click();
  await expect(page.getByText('Monitoreo en Vivo')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Cargar configuración' }).click();

  const labelAfter = page.getByText('anomalous_session_threshold', { exact: true });
  await expect(labelAfter).toBeVisible({ timeout: 15_000 });
  const rowAfter = labelAfter.locator('xpath=ancestor::div[contains(@class,"flex-col")][1]');
  await expect(rowAfter.locator('input')).toHaveValue(newValue, { timeout: 15_000 });
});
