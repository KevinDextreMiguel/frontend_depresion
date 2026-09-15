import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0026 — Programar sesiones de seguimiento
 * CA1 — Programación exitosa
 * Contexto: se ingresa fecha y hora válidas.
 * Evento: se agenda una sesión.
 * Resultado esperado: el sistema registra la cita y envía confirmación.
 */
test('el psicólogo programa una sesión de seguimiento con fecha y hora válidas', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0026-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Cita CA01',
    edad: 20,
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
  await row.getByRole('button', { name: 'Agendar sesión' }).click();

  await expect(page.getByRole('heading', { name: 'Agendar sesión' })).toBeVisible();

  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  futureDate.setMinutes(0, 0, 0);
  futureDate.setHours(10);
  const isoLocal = futureDate.toISOString().slice(0, 16);

  await page.locator('input[type="datetime-local"]').fill(isoLocal);
  await page.getByRole('button', { name: 'Programar sesión' }).click();

  await expect(page.getByText('Sesión programada correctamente.')).toBeVisible({ timeout: 15_000 });
});
