import { test, expect } from '@playwright/test';
import { TEST_STUDENT } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';

/**
 * HU0002 — Inicio de sesión seguro
 * CA4 — Sesión activa
 * Contexto: el usuario ya está autenticado.
 * Evento: accede al sistema.
 * Resultado esperado: el sistema redirige automáticamente al dashboard.
 *
 * Se simula la sesión ya activa vía API (no repitiendo el login por UI, que
 * es justamente lo que prueba CA1) e inyectando el resultado en localStorage,
 * igual que hace tests/setup/auth.setup.ts.
 */
test('un usuario con sesión ya activa es redirigido automáticamente a su panel al acceder', async ({ page, request }) => {
  const session = await ensureStudentSession(request, TEST_STUDENT);

  await page.goto('/');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('mindcheck_access_token', token);
      localStorage.setItem('mindcheck_user', JSON.stringify(user));
    },
    { token: session.access_token, user: session.user }
  );

  // Recarga simulando que el usuario "accede al sistema" ya autenticado.
  await page.reload();

  await expect(page.getByText('Nueva Evaluación').first()).toBeVisible({ timeout: 10_000 });
  // No debió pasar por la pantalla de login.
  await expect(page.getByTestId('login-submit')).toHaveCount(0);
});
