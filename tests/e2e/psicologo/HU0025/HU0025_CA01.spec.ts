import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0025 — Filtrar estudiantes por nivel de riesgo
 * CA1 — Filtro por riesgo alto
 * Contexto: existen estudiantes de riesgo alto.
 * Evento: el psicólogo selecciona el filtro correspondiente.
 * Resultado esperado: el sistema muestra únicamente esos casos.
 */
test('el psicólogo filtra el panel de pacientes asignados por nivel de riesgo severo', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0025-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Filtro CA01',
    edad: 21,
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

  // 8 items en "Siempre" (3 c/u = 24) + ítem 9 "Nunca" (0) = 24/27 -> Severa.
  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Siempre', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText('Puntaje: 24/27')).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();

  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  await expect(page.locator('tr', { hasText: '#' }).first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Severo' }).click();

  const rows = page.locator('tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    await expect(rows.nth(i)).toContainText(/severo/i);
  }
});
