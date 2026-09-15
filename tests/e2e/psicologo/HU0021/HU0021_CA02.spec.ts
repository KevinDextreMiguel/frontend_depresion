import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0021 — Historial de evaluaciones de un estudiante
 * CA2 — Visualización cronológica
 * Contexto: existen múltiples evaluaciones.
 * Evento: se revisa el historial.
 * Resultado esperado: el sistema ordena los registros por fecha.
 *
 * `GET /api/admin/student-history/{id}` ordena explícitamente por
 * `Evaluacion.fecha_evaluacion.desc()` (backend/app/routers/admin.py). Se
 * generan dos evaluaciones consecutivas del mismo estudiante con puntajes
 * distintos y se confirma que la más reciente aparece primero en el
 * historial.
 */
test('el psicólogo ve el historial de evaluaciones ordenado cronológicamente (más reciente primero)', async ({ page, browser, request }) => {
  test.setTimeout(150_000);

  const student = {
    email: uniqueTestEmail('hu0021-ca02'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Cronologia CA02',
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

  // Primera evaluación: puntaje bajo.
  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText('Puntaje: 0/27')).toBeVisible({ timeout: 15_000 });

  // Segunda evaluación (más reciente): puntaje distinto y más alto.
  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Algunas veces', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText('Puntaje: 8/27')).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();

  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  const row = page.locator('tr', { hasText: '#' }).first();
  await row.getByRole('button', { name: 'Ver historial' }).click();

  await expect(page.getByText('Historial de Evaluación')).toBeVisible({ timeout: 15_000 });
  const scores = page.getByText(/Puntaje: \d+ \/ 27/);
  await expect(scores.first()).toBeVisible();
  // El primer registro mostrado (más reciente) debe ser el de puntaje 8, no
  // el de puntaje 0 registrado antes.
  await expect(scores.first()).toHaveText('Puntaje: 8 / 27');
});
