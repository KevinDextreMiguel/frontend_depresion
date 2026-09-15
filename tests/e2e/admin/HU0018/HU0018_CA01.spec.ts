import { test, expect } from '@playwright/test';

/**
 * HU0018 — Reentrenamiento del modelo con nuevos datos
 * CA1 — Inicio de reentrenamiento
 * Contexto: existen nuevos datos validados.
 * Evento: el administrador inicia el proceso.
 * Resultado esperado: el sistema ejecuta el reentrenamiento del modelo.
 *
 * Corre en el proyecto "admin" (storageState de administrador). La sección
 * "Reentrenar Modelo" solo es visible para el rol admin (un psicólogo no ve
 * este ítem de menú).
 */
test('el administrador inicia el reentrenamiento del modelo y ve confirmación', async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto('/');
  await page.reload();

  await page.getByRole('button', { name: 'Reentrenar Modelo' }).click();
  await expect(page.getByRole('heading', { name: 'Reentrenar Modelo' })).toBeVisible();

  await page.getByRole('button', { name: 'Reentrenar Modelo', exact: true }).last().click();

  await expect(page.getByText(/Modelo reentrenado y comparado exitosamente\./)).toBeVisible({ timeout: 60_000 });
});
