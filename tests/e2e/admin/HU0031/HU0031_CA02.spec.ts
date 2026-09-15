import { test, expect } from '@playwright/test';

/**
 * HU0031 — Gestión de políticas de privacidad y consentimiento informado
 * CA2 — Control de versiones
 * Contexto: existen cambios en los documentos legales.
 * Evento: se registra una modificación.
 * Resultado esperado: el sistema conserva el historial de versiones y
 * fechas.
 *
 * Antes, publicar una nueva versión de T&C (clave "tc_version"/"tc_content"
 * en Parámetros del Sistema) simplemente sobreescribía el valor vigente en
 * `configuracion_sistema`, sin dejar rastro de versiones anteriores. Se
 * agregó la tabla `politica_version_historial` (backend/app/models.py) y el
 * endpoint `GET /admin-ext/tc-versions`; cada publicación ahora inserta una
 * fila nueva (ver `update_setting` en backend/app/routers/extended_features.py)
 * en vez de sobreescribir, y el panel de administración muestra una tabla
 * con versión, fecha de publicación y quién la publicó.
 */
test('al publicar una nueva versión de los T&C, el sistema conserva el historial de versiones y fechas', async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await page.reload();

  await page.locator('#nav-monitoring').click();
  await expect(page.getByText('Monitoreo en Vivo')).toBeVisible({ timeout: 15_000 });

  // Cargar parámetros del sistema y localizar la fila de tc_version.
  await page.getByRole('button', { name: 'Cargar configuración' }).click();
  const tcLabel = page.getByText('tc_version', { exact: true });
  await expect(tcLabel).toBeVisible({ timeout: 15_000 });
  const tcRow = tcLabel.locator('xpath=ancestor::div[contains(@class,"flex-col")][1]');
  await expect(tcRow).toBeVisible({ timeout: 15_000 });

  const input = tcRow.locator('input');
  const newVersion = `2.${Date.now()}`;
  await input.fill(newVersion);
  await tcRow.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Configuración actualizada.')).toBeVisible({ timeout: 10_000 });

  // El historial de versiones debe reflejar la nueva versión publicada,
  // con su fecha, sin haber perdido el registro de la publicación.
  const historyCard = page.getByTestId('tc-version-history-card');
  await expect(historyCard).toBeVisible();
  await historyCard.getByRole('button', { name: 'Cargar historial' }).click();

  const historyTable = page.getByTestId('tc-version-history-table');
  await expect(historyTable).toBeVisible({ timeout: 10_000 });
  await expect(historyTable.getByText(newVersion)).toBeVisible({ timeout: 10_000 });

  const rows = page.getByTestId('tc-version-history-row');
  await expect(rows.first()).toBeVisible();
});
