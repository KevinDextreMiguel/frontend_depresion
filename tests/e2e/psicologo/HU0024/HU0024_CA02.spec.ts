import { test, expect } from '@playwright/test';
import { ensureStaffSession } from '../../../helpers/auth';
import { ADMIN_SIGNUP_CODE, uniqueTestEmail } from '../../../fixtures/test-data';

/**
 * HU0024 — Panel con pacientes asignados
 * CA2 — Sin pacientes asignados
 * Contexto: no existen pacientes asignados.
 * Evento: se accede al panel.
 * Resultado esperado: el sistema muestra un mensaje informativo.
 *
 * Se crea un psicólogo NUEVO y aislado (sin ningún estudiante derivado
 * todavía) y se inicia sesión con él vía token inyectado, para garantizar
 * que su lista de pacientes asignados esté vacía (AdminPanel.tsx muestra
 * "No tienes estudiantes asignados en este momento." cuando
 * `assignedPatients.length === 0`).
 */
test('un psicólogo sin pacientes asignados ve un mensaje informativo en el panel', async ({ page, request }) => {
  test.setTimeout(60_000);

  const psicologo = {
    email: uniqueTestEmail('hu0024-ca02-psi'),
    password: 'TestE2E123!',
    nombre: 'Psicólogo Sin Pacientes CA02',
  };
  const session = await ensureStaffSession(request, psicologo, 'psicologo', ADMIN_SIGNUP_CODE);

  await page.goto('/');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('mindcheck_access_token', token);
      localStorage.setItem('mindcheck_user', JSON.stringify(user));
    },
    { token: session.access_token, user: session.user }
  );
  await page.reload();

  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  await expect(page.getByRole('heading', { name: 'Pacientes Asignados' })).toBeVisible();
  await expect(page.getByText('No tienes estudiantes asignados en este momento.')).toBeVisible({ timeout: 15_000 });
});
