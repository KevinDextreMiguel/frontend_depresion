import { test, expect } from '@playwright/test';

/**
 * HU0041 — Monitorear el uso de la plataforma en tiempo real
 * CA2 — Alertas de uso anómalo
 * Contexto: se detectan patrones inusuales.
 * Evento: ocurre una anomalía.
 * Resultado esperado: el sistema genera una alerta automática.
 *
 * `GET /api/admin-ext/monitoring/live` (backend/app/routers/extended_features.py)
 * genera una alerta "critical" cuando las sesiones activas (estimadas)
 * superan el umbral configurable "anomalous_session_threshold". Se baja el
 * umbral a un valor que el estado actual del sistema ya supera (1), se
 * confirma la alerta, y se restaura el umbral original al finalizar para no
 * afectar otras pruebas.
 */
test('cuando el uso supera el umbral configurado, el sistema genera una alerta automática de anomalía', async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await page.reload();
  await page.locator('#nav-monitoring').click();
  await expect(page.getByText('Monitoreo en Vivo')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Cargar configuración' }).click();

  const label = page.getByText('anomalous_session_threshold', { exact: true });
  await expect(label).toBeVisible({ timeout: 15_000 });
  const row = label.locator('xpath=ancestor::div[contains(@class,"flex-col")][1]');
  const input = row.locator('input');
  const originalValue = await input.inputValue();

  try {
    await input.fill('1');
    await row.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Configuración actualizada.')).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Actualizar' }).click();
    await expect(page.getByText(/Sobrecarga de uso/i)).toBeVisible({ timeout: 15_000 });
  } finally {
    // Restaurar el umbral original para no dejar el sistema en un estado que
    // genere alertas falsas para otras pruebas.
    await page.getByRole('button', { name: 'Cargar configuración' }).click();
    const labelRestore = page.getByText('anomalous_session_threshold', { exact: true });
    const rowRestore = labelRestore.locator('xpath=ancestor::div[contains(@class,"flex-col")][1]');
    await rowRestore.locator('input').fill(originalValue);
    await rowRestore.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Configuración actualizada.')).toBeVisible({ timeout: 10_000 });
  }
});
