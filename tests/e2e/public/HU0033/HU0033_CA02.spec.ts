import { test, expect } from '@playwright/test';

/**
 * HU0033 — Aceptación de términos y condiciones
 * CA2 — Aceptación requerida
 * Contexto: el usuario desea continuar.
 * Evento: marca la casilla y confirma.
 * Resultado esperado: el sistema habilita el acceso a la plataforma.
 */
test('marcar la casilla y confirmar habilita el acceso a la plataforma', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Términos y Condiciones de Uso')).toBeVisible({ timeout: 10_000 });

  // Intentar continuar sin marcar la casilla no habilita el acceso: el
  // sistema advierte que debe marcarse (comportamiento defensivo del propio
  // criterio "aceptación requerida").
  await page.getByRole('button', { name: 'Aceptar y Continuar' }).click();
  await expect(page.getByText('Debes marcar la casilla para poder habilitar el acceso.')).toBeVisible();
  await expect(page.getByText('Términos y Condiciones de Uso')).toBeVisible();

  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Aceptar y Continuar' }).click();

  // Resultado esperado: el modal se cierra y la plataforma queda accesible.
  await expect(page.getByText('Términos y Condiciones de Uso')).not.toBeVisible({ timeout: 10_000 });
});
