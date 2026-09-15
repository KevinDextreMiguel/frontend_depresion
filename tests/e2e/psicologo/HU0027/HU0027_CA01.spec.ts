import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0027 — Registro de intervenciones realizadas
 * CA1 — Registro exitoso
 * Contexto: se ingresa información completa.
 * Evento: se guarda la intervención.
 * Resultado esperado: el sistema almacena el registro correctamente.
 */
test('el psicólogo registra una intervención completa y el sistema la almacena correctamente', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0027-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Intervención CA01',
    edad: 19,
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

  await page.getByRole('heading', { name: 'Registrar Intervención' }).waitFor();
  await page.locator('select').filter({ hasText: '-- Seleccionar Tipo --' }).selectOption('Terapia Individual');
  await page.locator('input[type="datetime-local"]').fill('2026-10-01T10:00');
  const description = `Detalle clínico E2E ${Date.now()}`;
  await page.getByPlaceholder('Escribe el detalle clínico de la intervención realizada...').fill(description);
  await page.getByRole('button', { name: 'Registrar', exact: true }).click();

  await expect(page.getByText('Intervención registrada correctamente.')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(description)).toBeVisible();
});
