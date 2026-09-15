import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0027 — Registro de intervenciones realizadas
 * CA3 — Campos obligatorios
 * Contexto: se omiten datos esenciales.
 * Evento: se intenta guardar.
 * Resultado esperado: el sistema solicita completar la información
 * requerida.
 */
test('intentar registrar una intervención sin datos obligatorios pide completarlos', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0027-ca03'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Intervención CA03',
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
  const row = page.locator('tr', { hasText: '#' }).first();
  await row.getByRole('button', { name: 'Ver historial' }).click();
  await expect(page.getByText('Historial de Evaluación')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('heading', { name: 'Registrar Intervención' }).waitFor();
  // No se completa ningún campo obligatorio antes de intentar guardar.
  await page.getByRole('button', { name: 'Registrar', exact: true }).click();

  await expect(page.getByText(/obligatori/i)).toBeVisible({ timeout: 15_000 });
});
