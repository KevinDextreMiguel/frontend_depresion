import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0021 — Historial de evaluaciones de un estudiante
 * CA1 — Acceso al historial
 * Contexto: el psicólogo selecciona a un estudiante.
 * Evento: accede a su perfil.
 * Resultado esperado: el sistema muestra el historial completo de
 * evaluaciones.
 */
test('el psicólogo accede al historial completo de evaluaciones de un estudiante', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0021-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Historial CA01',
    edad: 23,
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
  const row = page.locator('tr', { hasText: '#' }).first();
  await row.getByRole('button', { name: 'Ver historial' }).click();

  await expect(page.getByText('Historial de Evaluación')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Puntaje: \d+ \/ 27/).first()).toBeVisible();
});
