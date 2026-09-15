import { test, expect } from '@playwright/test';

/**
 * HU0006 — Editar perfil personal
 * CA1 — Actualización exitosa
 * Contexto: los datos ingresados son válidos.
 * Evento: el usuario guarda los cambios.
 * Resultado esperado: el sistema actualiza la información del perfil.
 */
test('un estudiante edita su nombre y el sistema actualiza la información del perfil', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Mi Perfil').first().click();

  await page.getByTestId('profile-edit-button').click();

  const newName = `Estudiante E2E Editado ${Date.now()}`;
  const nameInput = page.getByTestId('profile-name-input');
  await nameInput.fill(newName);

  await page.getByTestId('profile-save-button').click();

  await expect(page.getByText('Actualización exitosa')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('profile-name-display')).toHaveText(newName, { timeout: 10_000 });
});
