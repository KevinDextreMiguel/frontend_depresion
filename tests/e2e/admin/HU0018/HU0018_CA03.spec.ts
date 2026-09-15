import { test, expect } from '@playwright/test';

/**
 * HU0018 — Reentrenamiento del modelo con nuevos datos
 * CA3 — Publicación de nueva versión
 * Contexto: el reentrenamiento es exitoso.
 * Evento: finaliza el proceso.
 * Resultado esperado: el sistema despliega una nueva versión del modelo.
 *
 * Tras un reentrenamiento exitoso, `POST /api/admin/model/retrain`
 * desactiva la versión activa anterior y publica una nueva fila en
 * `modelo_version` con `activo=True` (backend/app/routers/admin.py). Se
 * confirma comparando la versión mostrada en "Estado del Modelo" antes y
 * después del reentrenamiento.
 */
test('al finalizar el reentrenamiento el sistema despliega y muestra una nueva versión activa del modelo', async ({ page }) => {
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

  const versionAfter = (await versionCard.textContent())?.trim();
  expect(versionAfter).not.toEqual(versionBefore);
});
