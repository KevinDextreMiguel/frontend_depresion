import { test, expect } from '@playwright/test';

/**
 * HU0006 — Editar perfil personal
 * CA3 — Cambio de foto de perfil
 * Contexto: el usuario carga una imagen válida.
 * Evento: actualiza su foto.
 * Resultado esperado: el sistema guarda y muestra la nueva imagen.
 */
test('un estudiante actualiza su foto de perfil y el sistema la guarda y muestra', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Mi Perfil').first().click();
  await page.getByTestId('profile-edit-button').click();

  const fileInput = page.getByTestId('profile-photo-input');
  // Imagen PNG mínima válida (1x1 px) generada inline para no depender de
  // un archivo externo en el repo de pruebas.
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64'
  );
  await fileInput.setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: pngBuffer,
  });

  await page.getByTestId('profile-save-button').click();
  await expect(page.getByText('Actualización exitosa')).toBeVisible({ timeout: 10_000 });

  const avatarImg = page.locator('img[alt="avatar"]').first();
  await expect(avatarImg).toBeVisible({ timeout: 10_000 });
  await expect(avatarImg).toHaveAttribute('src', /^data:image\/png;base64,/);
});
