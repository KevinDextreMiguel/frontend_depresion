import { test, expect, Page } from '@playwright/test';
import { TEST_STUDENT, TEST_ADMIN, ADMIN_SIGNUP_CODE } from '../../../fixtures/test-data';
import { ensureStudentSession, ensureStaffSession } from '../../../helpers/auth';

/**
 * HU0004 — Gestión de cierre de sesión
 * CA1 — Cierre exitoso
 * Contexto: el usuario tiene sesión activa.
 * Evento: selecciona "Cerrar sesión".
 * Resultado esperado: el sistema finaliza la sesión y redirige al inicio.
 *
 * La HU dice "Como usuario" (genérico) — se prueba para estudiante Y admin,
 * no solo uno de los dos roles.
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

test('un estudiante con sesión activa puede cerrar sesión y vuelve al inicio', async ({ page, request }) => {
  const session = await ensureStudentSession(request, TEST_STUDENT);
  await seedSession(page, session.access_token, session.user);

  await expect(page.getByText('Nueva Evaluación').first()).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: /Cerrar Sesión/i }).click();

  await expect(page.getByRole('button', { name: /Registrarse para Empezar/ })).toBeVisible({ timeout: 10_000 });
});

test('un administrador con sesión activa puede cerrar sesión y vuelve al inicio', async ({ page, request }) => {
  const session = await ensureStaffSession(request, TEST_ADMIN, 'admin', ADMIN_SIGNUP_CODE);
  await seedSession(page, session.access_token, session.user);

  await expect(page.getByText('Panel Administrativo').or(page.getByText('Panel Clínico'))).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: /Cerrar Sesión/i }).click();

  await expect(page.getByRole('button', { name: /Registrarse para Empezar/ })).toBeVisible({ timeout: 10_000 });
});
