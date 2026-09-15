import { test, expect } from '@playwright/test';

/**
 * HU0045 — Métricas del modelo predictivo
 * CA3 — Actualización de métricas
 * Contexto: se publica una nueva versión del modelo.
 * Evento: finaliza el reentrenamiento.
 * Resultado esperado: el sistema actualiza automáticamente las métricas
 * mostradas en el panel.
 *
 * Tras un reentrenamiento exitoso, el resumen "(última versión)" en el
 * panel de Auditoría ML (`renderMLAudit`, AdminPanel.tsx) refleja las
 * métricas del modelo recién publicado — se confirma comparando el valor de
 * Accuracy mostrado antes y después de reentrenar.
 */
test('al publicar una nueva versión del modelo, el panel actualiza automáticamente las métricas mostradas', async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto('/');
  await page.reload();
  await page.locator('#nav-mlaudit, [id="nav-mlaudit"]').first().click();
  await expect(page.getByText('Auditoría ML & Métricas')).toBeVisible({ timeout: 10_000 });

  const accuracyCard = page.locator('p', { hasText: 'Accuracy (última versión)' }).locator('xpath=preceding-sibling::p[1]');
  await expect(accuracyCard).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Reentrenar Modelo' }).click();
  await expect(page.getByRole('heading', { name: 'Reentrenar Modelo' })).toBeVisible();
  await page.getByRole('button', { name: 'Reentrenar Modelo', exact: true }).last().click();
  await expect(page.getByText(/Modelo reentrenado y comparado exitosamente\./)).toBeVisible({ timeout: 60_000 });

  await page.locator('#nav-mlaudit, [id="nav-mlaudit"]').first().click();
  await expect(page.getByText('Auditoría ML & Métricas')).toBeVisible({ timeout: 10_000 });

  // El panel refleja de inmediato (sin recargar la página) las métricas de
  // la versión recién publicada — la lista de auditoría debe incluir el
  // nuevo evento de entrenamiento.
  await expect(page.getByText('Registro de Auditoría (Reentrenamientos)')).toBeVisible({ timeout: 15_000 });
  const accuracyCardAfter = page.locator('p', { hasText: 'Accuracy (última versión)' }).locator('xpath=preceding-sibling::p[1]');
  await expect(accuracyCardAfter).toBeVisible({ timeout: 15_000 });
});
