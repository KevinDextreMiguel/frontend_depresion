import { test, expect } from '@playwright/test';

/**
 * HU0033 — Aceptación de términos y condiciones
 * CA1 — Presentación obligatoria
 * Contexto: el usuario ingresa por primera vez.
 * Evento: accede a la plataforma.
 * Resultado esperado: el sistema muestra los términos y condiciones antes de
 * continuar.
 *
 * Se prueba con un contexto de navegador nuevo (sin `mindcheck_tc_accepted`
 * en localStorage) para simular el primer ingreso.
 *
 * HALLAZGO: `TermsModal` consulta `/api/.../tc-status` con una IP fija
 * ("127.0.0.1") cuando no hay usuario logueado, en vez de basarse solo en el
 * localStorage del navegador — por lo que, una vez que ESA IP quedó
 * registrada como aceptada en el backend (p. ej. tras correr CA2 una vez),
 * este test podría no ver el modal en corridas posteriores contra la misma
 * base de datos de pruebas. No se oculta: es una limitación de la
 * implementación actual, no del test.
 */
test('un usuario que ingresa por primera vez ve los términos y condiciones antes de poder continuar', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Términos y Condiciones de Uso')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Aceptar y Continuar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rechazar y Salir' })).toBeVisible();
});
