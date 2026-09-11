import { test, expect } from '@playwright/test';
import { TEST_STUDENT, uniqueTestEmail } from '../../../fixtures/test-data';

/**
 * HU0001 — Registro de usuarios
 * CA1 — Registro exitoso
 * Contexto: el estudiante ingresa datos válidos y completos.
 * Evento: presiona "Registrarse".
 * Resultado esperado: el sistema crea la cuenta y muestra mensaje de confirmación.
 *
 * Se prueba el comportamiento esperado por la HU (un estudiante se registra y
 * queda con acceso a la plataforma), no la existencia de un componente.
 */
test('un estudiante con datos válidos y completos puede registrarse y recibe confirmación', async ({ page }) => {
  const email = uniqueTestEmail('ca01');

  await page.goto('/');
  await page.getByRole('button', { name: /Registrarse para Empezar/ }).click();
  await page.getByRole('button', { name: /No tienes cuenta/ }).click();
  await page.getByRole('button', { name: /Estudiante/ }).click();

  await page.getByTestId('register-nombre').fill(TEST_STUDENT.nombre);
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-edad').fill(String(TEST_STUDENT.edad));
  await page.getByTestId('register-password').fill(TEST_STUDENT.password);
  await page.getByTestId('register-confirm-password').fill(TEST_STUDENT.password);

  await page.getByTestId('register-submit').click();

  // Resultado esperado #1: mensaje de confirmación explícito.
  await expect(page.getByText('¡Bienvenido!')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Tu sesión se ha iniciado correctamente')).toBeVisible();

  // Resultado esperado #2: la cuenta queda realmente creada y con acceso —
  // el sistema redirige al panel del estudiante recién registrado (no basta
  // con el mensaje de éxito si la cuenta no otorgara acceso real).
  await expect(page.getByText('Nueva Evaluación').first()).toBeVisible({ timeout: 10_000 });
});
