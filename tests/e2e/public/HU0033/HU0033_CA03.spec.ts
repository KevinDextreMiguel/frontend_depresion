import { test, expect } from '@playwright/test';

/**
 * HU0033 — Aceptación de términos y condiciones
 * CA3 — Rechazo de términos
 * Contexto: el usuario no acepta las condiciones.
 * Evento: intenta continuar sin aceptar (rechaza explícitamente).
 * Resultado esperado: el sistema bloquea el acceso y muestra un mensaje
 * informativo.
 */
test('rechazar los términos bloquea el acceso y muestra un mensaje informativo', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Términos y Condiciones de Uso')).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: 'Rechazar y Salir' }).click();

  // Mensaje informativo del rechazo.
  await expect(page.getByText('Has rechazado los términos y condiciones. No es posible continuar.')).toBeVisible();

  // El acceso queda bloqueado: no hay sesión ni acceso a áreas de la
  // plataforma que requieran haber aceptado los términos.
  await expect(page.getByText('Nueva Evaluación')).not.toBeVisible();
});
