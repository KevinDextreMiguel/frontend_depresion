import { test, expect } from '@playwright/test';

/**
 * HU0044 — Auditorías del modelo predictivo de Machine Learning
 * CA1 — Registro de entrenamiento
 * Contexto: se ejecuta un reentrenamiento del modelo.
 * Evento: finaliza el proceso de entrenamiento.
 * Resultado esperado: el sistema registra versión, fecha, métricas y
 * responsable del entrenamiento.
 *
 * `retrain_model` (backend/app/routers/admin.py) inserta una fila en
 * `auditoria_model_ml` con tipo_evento="entrenamiento", la versión, las
 * métricas (precision/recall/f1/accuracy) y el usuario responsable
 * (`id_usuario`). El panel "Auditoría ML & Métricas" lista ese registro.
 */
test('al finalizar un reentrenamiento, el sistema registra versión, fecha, métricas y responsable', async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto('/');
  await page.reload();
  await page.getByRole('button', { name: 'Reentrenar Modelo' }).click();
  await expect(page.getByRole('heading', { name: 'Reentrenar Modelo' })).toBeVisible();

  await page.getByRole('button', { name: 'Reentrenar Modelo', exact: true }).last().click();
  await expect(page.getByText(/Modelo reentrenado y comparado exitosamente\./)).toBeVisible({ timeout: 60_000 });

  await page.locator('#nav-mlaudit, [id="nav-mlaudit"]').first().click();
  await expect(page.getByText('Auditoría ML & Métricas')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Registro de Auditoría (Reentrenamientos)')).toBeVisible({ timeout: 15_000 });

  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 15_000 });
  await expect(firstRow.getByText('Entrenamiento')).toBeVisible();
  // Debe mostrar versión, fecha y métricas (no "—" en todas las columnas).
  await expect(firstRow.getByText(/P:.*R:.*F1:.*Acc:/)).toBeVisible();
});
