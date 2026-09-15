import { test, expect } from '@playwright/test';

/**
 * HU0006 — Editar perfil personal
 * CA4 — Cancelación de cambios
 * Contexto: el usuario decide no guardar.
 * Evento: selecciona cancelar.
 * Resultado esperado: el sistema conserva la información original.
 */
test('al cancelar la edición del perfil, el sistema conserva la información original', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Mi Perfil').first().click();

  const originalName = await page.getByTestId('profile-name-display').textContent();

  await page.getByTestId('profile-edit-button').click();
  await page.getByTestId('profile-name-input').fill('Nombre Temporal Que No Se Debe Guardar');
  await page.getByTestId('profile-cancel-button').click();

  await expect(page.getByTestId('profile-name-display')).toHaveText(originalName?.trim() || '', { timeout: 10_000 });
});
