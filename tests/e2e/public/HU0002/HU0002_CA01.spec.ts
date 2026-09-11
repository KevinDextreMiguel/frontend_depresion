import { test, expect } from '@playwright/test';
import { TEST_STUDENT } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';

/**
 * HU0002 — Inicio de sesión seguro
 * CA1 — Login exitoso
 * Contexto: el usuario tiene credenciales válidas.
 * Evento: presiona "Iniciar sesión".
 * Resultado esperado: el sistema permite el acceso al dashboard.
 */
test.beforeAll(async ({ request }) => {
  await ensureStudentSession(request, TEST_STUDENT);
});

test('un estudiante con credenciales válidas inicia sesión y accede a su panel', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await page.getByTestId('login-email').fill(TEST_STUDENT.email);
  await page.getByTestId('login-password').fill(TEST_STUDENT.password);
  await page.getByTestId('login-submit').click();

  await expect(page.getByText('Nueva Evaluación').first()).toBeVisible({ timeout: 10_000 });
});
