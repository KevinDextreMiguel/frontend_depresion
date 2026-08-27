import { test, expect, Page } from '@playwright/test';
import { TEST_STUDENT, TEST_ADMIN, ADMIN_SIGNUP_CODE } from '../../../fixtures/test-data';
import { ensureStudentSession, ensureStaffSession } from '../../../helpers/auth';

/**
 * HU0004 — Gestión de cierre de sesión
 * CA2 — Invalidación de sesión
 * Contexto: la sesión ha sido cerrada.
 * Evento: intenta acceder a una página protegida.
 * Resultado esperado: el sistema solicita iniciar sesión nuevamente.
 *
 * La app no tiene URLs reales por página (no hay router) — "intentar acceder
 * a una página protegida" se traduce aquí en recargar la aplicación después
 * del logout: si la sesión estuviera invalidada correctamente, la recarga NO
 * debe restaurar el panel protegido.
 */
async function seedSession(page: Page, token: string, user: unknown) {
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

test('tras cerrar sesión, un estudiante que recarga no recupera el panel protegido', async ({ page, request }) => {
  const session = await ensureStudentSession(request, TEST_STUDENT);
  await seedSession(page, session.access_token, session.user);
  await expect(page.getByText('Nueva Evaluación').first()).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: /Cerrar Sesión/i }).click();
  await page.reload();

  await expect(page.getByText('Nueva Evaluación')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Registrarse para Empezar/ })).toBeVisible();
});

test('tras cerrar sesión, un administrador que recarga no recupera el panel protegido', async ({ page, request }) => {
  const session = await ensureStaffSession(request, TEST_ADMIN, 'admin', ADMIN_SIGNUP_CODE);
  await seedSession(page, session.access_token, session.user);
  await expect(page.getByText('Panel Administrativo').or(page.getByText('Panel Clínico'))).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: /Cerrar Sesión/i }).click();
  await page.reload();

  await expect(page.getByText('Panel Administrativo')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Registrarse para Empezar/ })).toBeVisible();
});
