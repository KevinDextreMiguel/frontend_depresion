import { test, expect } from '@playwright/test';
import { TEST_STUDENT } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';

/**
 * HU0002 — Inicio de sesión seguro
 * CA2 — Login fallido
 * Contexto: las credenciales son incorrectas.
 * Evento: el usuario intenta iniciar sesión.
 * Resultado esperado: el sistema muestra un mensaje de error.
 */
test.beforeAll(async ({ request }) => {
  await ensureStudentSession(request, TEST_STUDENT);
});

test('iniciar sesión con contraseña incorrecta muestra un mensaje de error', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await page.getByTestId('login-email').fill(TEST_STUDENT.email);
  await page.getByTestId('login-password').fill('ContraseñaIncorrecta999!');
  await page.getByTestId('login-submit').click();

  await expect(page.getByText(/correo o contraseña incorrectos/i)).toBeVisible({ timeout: 10_000 });

  // No debe otorgarse acceso.
  await expect(page.getByTestId('login-submit')).toBeVisible();
});
