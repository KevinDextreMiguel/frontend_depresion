import { test, expect } from '@playwright/test';

/**
 * HU0003 — Recuperación de contraseña
 * CA4 — Enlace expirado
 * Contexto: el enlace ha vencido.
 * Evento: el usuario intenta usarlo.
 * Resultado esperado: el sistema solicita generar un nuevo enlace.
 *
 * No hace falta un enlace REALMENTE expirado (eso requeriría esperar tiempo
 * real o infraestructura de Supabase): un token arbitrario/inválido ejercita
 * la misma rama de error del backend.
 *
 * HALLAZGO (no bloquea este CA, se documenta para el informe): el backend
 * responde con un mensaje específico ("El enlace ha expirado o es inválido.
 * Solicita uno nuevo."), pero `resetPassword()` en `lib/api.ts` no usa el
 * `parseError()` compartido por el resto de la app — lanza un mensaje
 * genérico hardcodeado en su lugar. El criterio igual se cumple (el mensaje
 * genérico también indica que hay que pedir un enlace nuevo), pero el usuario
 * nunca ve el detalle real que el backend sí calculó.
 */
test('usar un enlace de recuperación inválido/expirado solicita generar uno nuevo', async ({ page }) => {
  await page.goto('/#access_token=token-arbitrario-invalido-o-expirado');

  await expect(page.getByRole('heading', { name: 'Restablecer Contraseña' })).toBeVisible();

  await page.getByTestId('reset-password').fill('NuevaClaveSegura123!');
  await page.getByTestId('reset-confirm-password').fill('NuevaClaveSegura123!');
  await page.getByTestId('reset-submit').click();

  await expect(page.getByTestId('reset-error')).toContainText(/enlace puede haber expirado/i, { timeout: 10_000 });
});
