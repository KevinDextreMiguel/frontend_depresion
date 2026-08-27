import { test, expect } from '@playwright/test';

/**
 * HU0002 — Inicio de sesión seguro
 * CA3 — Campos vacíos
 * Contexto: no completa correo o contraseña.
 * Evento: el usuario intenta iniciar sesión.
 * Resultado esperado: el sistema solicita completar los campos.
 */
test('intentar iniciar sesión sin completar correo y contraseña solicita completarlos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('button', { name: /Estudiante/ }).click();

  await page.getByTestId('login-submit').click();

  await expect(page.getByText('El correo es obligatorio')).toBeVisible();
  await expect(page.getByText('La contraseña es obligatoria')).toBeVisible();
});
