import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0024 — Panel con pacientes asignados
 * CA1 — Visualización de pacientes asignados
 * Contexto: el psicólogo tiene pacientes asignados.
 * Evento: ingresa al panel.
 * Resultado esperado: el sistema muestra la lista completa de estudiantes
 * asignados.
 */
test('el psicólogo ve la lista completa de estudiantes asignados en el panel', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0024-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Asignado CA01',
    edad: 22,
  };

  const studentContext = await browser.newContext();
  const studentPage = await studentContext.newPage();
  const session = await ensureStudentSession(request, student);
  await studentPage.goto('/');
  await studentPage.evaluate(
    ({ token, user }) => {
      localStorage.setItem('mindcheck_access_token', token);
      localStorage.setItem('mindcheck_user', JSON.stringify(user));
    },
    { token: session.access_token, user: session.user }
  );
  await studentPage.reload();

  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();

  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  await expect(page.getByRole('heading', { name: 'Pacientes Asignados' })).toBeVisible();
  await expect(page.locator('tr', { hasText: '#' }).first()).toBeVisible({ timeout: 15_000 });
});
