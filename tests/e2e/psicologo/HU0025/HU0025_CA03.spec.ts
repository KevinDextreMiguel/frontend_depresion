import { test, expect } from '@playwright/test';
import { ensureStaffSession } from '../../../helpers/auth';
import { ADMIN_SIGNUP_CODE, uniqueTestEmail } from '../../../fixtures/test-data';

/**
 * HU0025 — Filtrar estudiantes por nivel de riesgo
 * CA3 — Sin resultados
 * Contexto: no existen registros para el filtro.
 * Evento: se realiza la búsqueda.
 * Resultado esperado: el sistema muestra una notificación de ausencia de
 * resultados.
 *
 * Se usa un psicólogo NUEVO y aislado sin pacientes asignados: al aplicar
 * cualquier filtro de riesgo, la lista de pacientes es vacía y el mensaje
 * cambia explícitamente a "No se encontraron estudiantes que coincidan con
 * el filtro de riesgo seleccionado." (AdminPanel.tsx).
 */
test('al filtrar por un nivel de riesgo sin coincidencias, el sistema notifica la ausencia de resultados', async ({ page, request }) => {
  test.setTimeout(60_000);

  const psicologo = {
    email: uniqueTestEmail('hu0025-ca03-psi'),
    password: 'TestE2E123!',
    nombre: 'Psicólogo Sin Resultados CA03',
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

  await page.getByRole('button', { name: 'Severo' }).click();
  await expect(page.getByText('No se encontraron estudiantes que coincidan con el filtro de riesgo seleccionado.')).toBeVisible({ timeout: 15_000 });
});
