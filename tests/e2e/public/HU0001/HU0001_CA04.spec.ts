import { test, expect } from '@playwright/test';

/**
 * HU0001 — Registro de usuarios
 * CA4 — Formato inválido
 * Contexto: el correo o la contraseña no cumplen el formato requerido.
 * Evento: el estudiante envía el formulario.
 * Resultado esperado: el sistema muestra las validaciones correspondientes.
 */
test('registrarse con correo y contraseña de formato inválido muestra las validaciones', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Registrarse para Empezar/ }).click();
  await page.getByRole('button', { name: /Estudiante/ }).click();
  await page.getByRole('button', { name: /No tienes cuenta/ }).click();

  // Nota: se usa un correo CON "@" pero sin dominio con punto ("correo@invalido")
  // en vez de un correo sin "@". Un correo sin "@" dispara la validación NATIVA
  // del navegador (type="email") antes de que el JS de la app corra, mostrando
  // el tooltip nativo del navegador en inglés en vez del mensaje propio de la
  // app — eso oculta si la app realmente valida algo. "correo@invalido" pasa
  // la validación nativa (el navegador no exige un TLD) pero sí falla la regex
  // propia de la app (/^\S+@\S+\.\S+$/, que exige un punto), permitiendo
  // probar específicamente la validación de la aplicación.
  await page.getByTestId('register-nombre').fill('Estudiante Formato Inválido');
  await page.getByTestId('register-email').fill('correo@invalido');
  await page.getByTestId('register-edad').fill('20');
  await page.getByTestId('register-password').fill('123');
  await page.getByTestId('register-confirm-password').fill('123');

  await page.getByTestId('register-submit').click();

  await expect(page.getByText('Correo inválido')).toBeVisible();
  await expect(page.getByText('Mínimo 6 caracteres')).toBeVisible();
});
