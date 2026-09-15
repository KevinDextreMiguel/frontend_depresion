import { test, expect } from '@playwright/test';

/**
 * HU0031 — Gestión de políticas de privacidad y consentimiento informado
 * CA1 — Publicación de políticas
 * Contexto: se actualizan las políticas institucionales.
 * Evento: el administrador publica una nueva versión.
 * Resultado esperado: el sistema muestra la versión vigente a todos los
 * usuarios.
 *
 * El administrador publica una nueva versión de "tc_version" en Parámetros
 * del Sistema (misma acción que HU0031 CA2). `GET /api/admin-ext/tc-status`
 * es el endpoint público que consulta cualquier usuario (autenticado o no)
 * al ingresar a la plataforma (TermsModal.tsx); se confirma que, tras la
 * publicación, ese endpoint (sin sesión) ya devuelve la nueva versión
 * vigente.
 */
test('al publicar una nueva versión de políticas, el sistema la muestra como vigente a cualquier usuario', async ({ page, request }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await page.reload();

  await page.locator('#nav-monitoring').click();
  await expect(page.getByText('Monitoreo en Vivo')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Cargar configuración' }).click();

  const tcLabel = page.getByText('tc_version', { exact: true });
  await expect(tcLabel).toBeVisible({ timeout: 15_000 });
  const tcRow = tcLabel.locator('xpath=ancestor::div[contains(@class,"flex-col")][1]');
  await expect(tcRow).toBeVisible({ timeout: 15_000 });

  const newVersion = `3.${Date.now()}`;
  await tcRow.locator('input').fill(newVersion);
  await tcRow.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Configuración actualizada.')).toBeVisible({ timeout: 10_000 });

  // Consulta pública (sin token de sesión) del estado vigente de T&C.
  const statusRes = await request.get('/api/admin-ext/tc-status');
  expect(statusRes.ok()).toBeTruthy();
  const body = await statusRes.json();
  expect(body.version).toBe(newVersion);
});
