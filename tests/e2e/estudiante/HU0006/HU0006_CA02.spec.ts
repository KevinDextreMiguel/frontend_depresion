import { test, expect } from '@playwright/test';

/**
 * HU0006 — Editar perfil personal
 * CA2 — Validación de campos
 * Contexto: existen datos con formato incorrecto.
 * Evento: el usuario intenta guardar.
 * Resultado esperado: el sistema muestra mensajes de validación.
 */
test('al intentar guardar el perfil con el nombre vacío, el sistema muestra un mensaje de validación', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Mi Perfil').first().click();

  await page.getByTestId('profile-edit-button').click();
  await page.getByTestId('profile-name-input').fill('   ');
  await page.getByTestId('profile-save-button').click();

  await expect(page.getByText(/campo obligatorio/i)).toBeVisible({ timeout: 10_000 });
});
