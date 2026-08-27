import { test as setup } from '@playwright/test';
import { ensureStudentSession, ensureStaffSession } from '../helpers/auth';
import {
  TEST_STUDENT,
  TEST_PSICOLOGO,
  TEST_ADMIN,
  ADMIN_SIGNUP_CODE,
  AUTH_STATES,
} from '../fixtures/test-data';

/**
 * Proyecto "setup" de Playwright (ver playwright.config.ts): corre una vez
 * antes de los proyectos autenticados y deja un storageState por rol en
 * playwright/.auth/*.json (gitignored). Los specs de HU0002/HU0001 que
 * prueban el LOGIN por UI no deben depender de esto — este atajo es solo
 * para llegar autenticado a features que no son las de auth en sí mismas.
 *
 * Autenticamos vía API (no clickeando el formulario) porque es más rápido y
 * no acopla cada test de negocio a que el formulario de login no cambie.
 */

async function seedLocalStorage(
  page: import('@playwright/test').Page,
  token: string,
  user: unknown
) {
  await page.goto('/');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('mindcheck_access_token', token);
      localStorage.setItem('mindcheck_user', JSON.stringify(user));
    },
    { token, user }
  );
}

setup('autenticar como estudiante', async ({ page, request }) => {
  const session = await ensureStudentSession(request, TEST_STUDENT);
  await seedLocalStorage(page, session.access_token, session.user);
  await page.context().storageState({ path: AUTH_STATES.estudiante });
});

setup('autenticar como psicólogo', async ({ page, request }) => {
  const session = await ensureStaffSession(request, TEST_PSICOLOGO, 'psicologo', ADMIN_SIGNUP_CODE);
  await seedLocalStorage(page, session.access_token, session.user);
  await page.context().storageState({ path: AUTH_STATES.psicologo });
});

setup('autenticar como admin', async ({ page, request }) => {
  const session = await ensureStaffSession(request, TEST_ADMIN, 'admin', ADMIN_SIGNUP_CODE);
  await seedLocalStorage(page, session.access_token, session.user);
  await page.context().storageState({ path: AUTH_STATES.admin });
});
