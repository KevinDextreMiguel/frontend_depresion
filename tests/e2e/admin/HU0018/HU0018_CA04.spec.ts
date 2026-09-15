import { test, expect } from '@playwright/test';

/**
 * HU0018 — Reentrenamiento del modelo con nuevos datos
 * CA4 — Respaldo de versión anterior
 * Contexto: se actualiza el modelo.
 * Evento: se publica la nueva versión.
 * Resultado esperado: el sistema conserva la versión anterior para
 * recuperación.
 *
 * `retrain_model` (backend/app/routers/admin.py) NO elimina la versión
 * anterior: la marca `activo=False` y la deja en la tabla `modelo_version`.
 * `GET /api/admin-ext/ml/metrics` lista TODAS las versiones (activas e
 * inactivas) ordenadas por fecha, y el panel "Auditoría ML & Métricas" las
 * muestra en el registro de auditoría — por eso, tras un reentrenamiento, la
 * versión previa sigue siendo consultable ahí (no desaparece).
 */
test('tras reentrenar, la versión anterior del modelo se conserva y sigue siendo consultable', async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto('/');
  await page.reload();

  await page.getByRole('button', { name: 'Reentrenar Modelo' }).click();
  await expect(page.getByRole('heading', { name: 'Reentrenar Modelo' })).toBeVisible();

  const versionCard = page.locator('p.text-xs', { hasText: 'Versión' }).locator('xpath=following-sibling::p[1]');
  await expect(versionCard).toBeVisible({ timeout: 15_000 });
  const versionBefore = (await versionCard.textContent())?.trim();

  await page.getByRole('button', { name: 'Reentrenar Modelo', exact: true }).last().click();
  await expect(page.getByText(/Modelo reentrenado y comparado exitosamente\./)).toBeVisible({ timeout: 60_000 });

  // La versión anterior (desactivada, no eliminada) debe seguir apareciendo
  // en el registro histórico de auditoría ML.
  await page.locator('#nav-mlaudit, [id="nav-mlaudit"]').first().click();
  await expect(page.getByText('Auditoría ML & Métricas')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Registro de Auditoría (Reentrenamientos)')).toBeVisible({ timeout: 15_000 });

  if (versionBefore) {
    await expect(page.getByText(versionBefore, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  }
});
