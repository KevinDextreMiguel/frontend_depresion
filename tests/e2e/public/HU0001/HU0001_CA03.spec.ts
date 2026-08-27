import { test, expect } from '@playwright/test';

/**
 * HU0001 — Registro de usuarios
 * CA3 — Campos obligatorios vacíos
 * Contexto: faltan datos requeridos.
 * Evento: el estudiante intenta completar el registro.
 * Resultado esperado: el sistema solicita completar los campos obligatorios.
 */
test('intentar registrarse sin completar campos obligatorios muestra los mensajes de validación', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Registrarse para Empezar/ }).click();
  await page.getByRole('button', { name: /Estudiante/ }).click();
  await page.getByRole('button', { name: /No tienes cuenta/ }).click();

  // No se llena ningún campo — se envía el formulario vacío.
  await page.getByTestId('register-submit').click();

  await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
  await expect(page.getByText('El correo es obligatorio')).toBeVisible();
  await expect(page.getByText('La contraseña es obligatoria')).toBeVisible();
  await expect(page.getByText('La edad es obligatoria')).toBeVisible();

  // No debe haberse enviado ninguna solicitud de registro real.
  await expect(page.getByTestId('register-submit')).toBeVisible();
});
