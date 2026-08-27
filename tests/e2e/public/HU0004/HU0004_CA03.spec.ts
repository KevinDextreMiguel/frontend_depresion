import { test, expect, Page } from '@playwright/test';
import { TEST_STUDENT, TEST_ADMIN, ADMIN_SIGNUP_CODE } from '../../../fixtures/test-data';
import { ensureStudentSession, ensureStaffSession } from '../../../helpers/auth';

/**
 * HU0004 — Gestión de cierre de sesión
 * CA3 — Cierre por inactividad
 * Contexto: existe un periodo prolongado de inactividad.
 * Evento: se supera el tiempo límite.
 * Resultado esperado: el sistema cierra la sesión automáticamente.
 *
 * El rol de la HU es "Como usuario" (genérico) — se prueba para ambos roles,
 * no se asume cumplido el criterio completo solo porque funcione en admin.
 * Se usa page.clock para simular el paso del tiempo sin esperarlo realmente.
 */
async function seedSessionWithClock(page: Page, token: string, user: unknown) {
  await page.clock.install();
  await page.goto('/');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('mindcheck_access_token', token);
      localStorage.setItem('mindcheck_user', JSON.stringify(user));
    },
    { token, user }
  );
  await page.reload();
}

test('un administrador inactivo por más de 15 minutos es desconectado automáticamente', async ({ page, request }) => {
  const session = await ensureStaffSession(request, TEST_ADMIN, 'admin', ADMIN_SIGNUP_CODE);
  await seedSessionWithClock(page, session.access_token, session.user);
  await expect(page.getByText('Panel Administrativo').or(page.getByText('Panel Clínico'))).toBeVisible({ timeout: 10_000 });

  // Avanza el reloj del navegador 16 minutos sin ninguna interacción real.
  await page.clock.fastForward('16:00');

  await expect(page.getByRole('button', { name: /Registrarse para Empezar/ })).toBeVisible({ timeout: 10_000 });
});

test('un estudiante inactivo por más de 15 minutos también debería ser desconectado automáticamente', async ({ page, request }) => {
  const session = await ensureStudentSession(request, TEST_STUDENT);
  await seedSessionWithClock(page, session.access_token, session.user);
  await expect(page.getByText('Nueva Evaluación').first()).toBeVisible({ timeout: 10_000 });

  await page.clock.fastForward('16:00');

  // HU0004-CA3 no especifica "solo administradores" — dice "Como usuario".
  // Este assert representa el criterio tal como está escrito en la HU, no la
  // implementación actual (que solo aplica el timer si currentScreen ===
  // "admin-panel"). Si este test falla, es evidencia de una brecha real de
  // implementación (IMPLEMENTATION_ERROR), no un error del test.
  await expect(page.getByRole('button', { name: /Registrarse para Empezar/ })).toBeVisible({ timeout: 10_000 });
});
