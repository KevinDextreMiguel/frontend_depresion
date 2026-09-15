import { test, expect } from '@playwright/test';

/**
 * HU0045 — Métricas del modelo predictivo
 * CA2 — Comparación entre versiones
 * Contexto: existen múltiples versiones del modelo.
 * Evento: se selecciona comparar versiones.
 * Resultado esperado: el sistema muestra diferencias de desempeño entre
 * modelos entrenados.
 *
 * `GET /api/admin-ext/ml/metrics` (backend/app/routers/extended_features.py)
 * devuelve métricas por CADA versión de modelo publicada (no solo la
 * activa), y el gráfico "Evolución de Métricas del Modelo" (AdminPanel.tsx)
 * las traza todas juntas con la versión en el eje X — permitiendo comparar
 * el desempeño entre versiones distintas. Se reentrena el modelo para
 * garantizar al menos dos versiones y se confirma que el gráfico las
 * incluye.
 */
test('el administrador compara el desempeño entre distintas versiones del modelo en el gráfico de métricas', async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto('/');
  await page.reload();
  await page.getByRole('button', { name: 'Reentrenar Modelo' }).click();
  await expect(page.getByRole('heading', { name: 'Reentrenar Modelo' })).toBeVisible();
  await page.getByRole('button', { name: 'Reentrenar Modelo', exact: true }).last().click();
  await expect(page.getByText(/Modelo reentrenado y comparado exitosamente\./)).toBeVisible({ timeout: 60_000 });

  await page.locator('#nav-mlaudit, [id="nav-mlaudit"]').first().click();
  await expect(page.getByText('Auditoría ML & Métricas')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Evolución de Métricas del Modelo')).toBeVisible({ timeout: 15_000 });

  // El gráfico de líneas debe trazar al menos dos puntos (dos versiones
  // distintas) para que exista algo que comparar.
  const linePoints = page.locator('.recharts-line-dots circle, .recharts-dot');
  await expect(linePoints.nth(1)).toBeVisible({ timeout: 15_000 });
});
