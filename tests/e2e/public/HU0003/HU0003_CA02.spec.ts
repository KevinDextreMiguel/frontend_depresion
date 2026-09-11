import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';

/**
 * HU0003 — Recuperación de contraseña
 * CA2 — Correo no registrado
 * Contexto: el correo no existe en el sistema.
 * Evento: solicita la recuperación.
 * Resultado esperado: el sistema informa que el correo no está registrado.
 */
test('solicitar recuperación con un correo no registrado informa que no existe', async ({ page }) => {
  const email = uniqueTestEmail('no-registrado');

  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByTestId('link-forgot-password').click();

  await page.getByTestId('forgot-email').fill(email);
  await page.getByTestId('forgot-submit').click();

  await expect(page.getByTestId('forgot-error')).toContainText(/no está registrado/i, { timeout: 10_000 });
});
