import { test, expect } from '@playwright/test';

/**
 * HU0045 — Métricas del modelo predictivo
 * CA4 — Consulta histórica
 * Contexto: el administrador requiere revisar desempeño anterior.
 * Evento: accede al historial de métricas.
 * Resultado esperado: el sistema muestra el registro histórico de métricas
 * por versión y fecha.
 */
test('el administrador consulta el registro histórico de reentrenamientos con métricas por versión', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-mlaudit, [id="nav-mlaudit"]').first().click();

  await expect(page.getByText('Auditoría ML & Métricas')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Registro de Auditoría (Reentrenamientos)')).toBeVisible({ timeout: 15_000 });
});
