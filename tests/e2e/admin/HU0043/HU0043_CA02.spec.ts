import { test, expect } from '@playwright/test';

/**
 * HU0043 — Registrar auditorías de acceso y cambios del sistema
 * CA2 — Registro de modificaciones
 * Contexto: se actualiza información crítica.
 * Evento: un usuario modifica un registro.
 * Resultado esperado: el sistema almacena el detalle del cambio realizado.
 *
 * `PUT /api/admin-ext/settings/{id}` (backend/app/routers/extended_features.py)
 * escribe en `auditoria_acceso` con accion="actualizacion_configuracion" y
 * un `detalle` que incluye el valor anterior y el nuevo
 * ("Actualizó clave 'X': 'old' -> 'new'"). Se modifica un parámetro y se
 * confirma, vía API de auditoría, que el detalle del cambio quedó
 * almacenado.
 */
test('modificar un parámetro de configuración almacena el detalle del cambio en la auditoría', async ({ page, request }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await page.reload();
  await page.locator('#nav-monitoring').click();
  await expect(page.getByText('Monitoreo en Vivo')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Cargar configuración' }).click();

  const label = page.getByText('tc_content', { exact: true }).or(page.getByText('consent_content', { exact: true })).first();
  await expect(label).toBeVisible({ timeout: 15_000 });
  const row = label.locator('xpath=ancestor::div[contains(@class,"flex-col")][1]');

  const marker = `Detalle auditado E2E ${Date.now()}`;
  const currentValue = await row.locator('input').inputValue();
  await row.locator('input').fill(`${currentValue} ${marker}`);
  await row.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Configuración actualizada.')).toBeVisible({ timeout: 10_000 });

  await page.locator('[data-testid="nav-audit"]').click();
  await expect(page.getByText('Auditoría del Sistema')).toBeVisible({ timeout: 10_000 });
  await page.locator('[data-testid="audit-filter-accion"]').fill('actualizacion_configuracion');
  await page.locator('[data-testid="audit-filter-apply-btn"]').click();

  const table = page.locator('[data-testid="audit-log-table"]');
  await expect(table).toBeVisible({ timeout: 15_000 });
  await expect(table.getByText('actualizacion_configuracion').first()).toBeVisible({ timeout: 15_000 });

  // El detalle del cambio (valor anterior -> nuevo) no se muestra en la
  // tabla de la UI, pero sí se almacena en el backend — se confirma vía API,
  // adjuntando manualmente el token de la sesión (page.request no reenvía el
  // Authorization Bearer que la app guarda en localStorage).
  const token = await page.evaluate(() => localStorage.getItem('mindcheck_access_token'));
  const auditRes = await request.get('/api/admin/audit?accion=actualizacion_configuracion', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  expect(auditRes.ok()).toBeTruthy();
  const body = await auditRes.json();
  const items = body.items ?? body;
  const found = (Array.isArray(items) ? items : []).some((item: any) => (item.detalle || '').includes(marker));
  expect(found).toBeTruthy();
});
