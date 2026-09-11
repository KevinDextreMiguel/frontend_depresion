import { test, expect } from '@playwright/test';
import { EXISTING_STUDENT } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';

/**
 * HU0001 — Registro de usuarios
 * CA2 — Correo ya registrado
 * Contexto: el correo ya existe en el sistema.
 * Evento: el estudiante intenta registrarse con ese correo.
 * Resultado esperado: el sistema muestra un mensaje indicando que el correo
 * ya está en uso.
 *
 * E2E + API: se siembra la cuenta "ya registrada" vía API en beforeAll
 * (dato de precondición, no el comportamiento bajo prueba) para que el
 * criterio sea reproducible sin depender de que otro test haya corrido antes.
 */
test.beforeAll(async ({ request }) => {
  await ensureStudentSession(request, EXISTING_STUDENT);
});

test('registrarse con un correo ya existente muestra el mensaje correspondiente', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Registrarse para Empezar/ }).click();
  await page.getByRole('button', { name: /No tienes cuenta/ }).click();
  await page.getByRole('button', { name: /Estudiante/ }).click();

  await page.getByTestId('register-nombre').fill(EXISTING_STUDENT.nombre);
  await page.getByTestId('register-email').fill(EXISTING_STUDENT.email);
  await page.getByTestId('register-edad').fill(String(EXISTING_STUDENT.edad));
  await page.getByTestId('register-password').fill(EXISTING_STUDENT.password);
  await page.getByTestId('register-confirm-password').fill(EXISTING_STUDENT.password);

  await page.getByTestId('register-submit').click();

  await expect(page.getByText(/correo ya está en uso/i)).toBeVisible({ timeout: 10_000 });

  // El sistema NO debe otorgar acceso — el formulario sigue en pantalla, no
  // hubo redirección a un panel.
  await expect(page.getByTestId('register-submit')).toBeVisible();
});
