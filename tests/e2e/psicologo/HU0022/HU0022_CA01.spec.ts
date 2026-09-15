import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0022 — Observaciones y notas de seguimiento
 * CA1 — Registro de observaciones
 * Contexto: el psicólogo evalúa a un estudiante.
 * Evento: ingresa una nota.
 * Resultado esperado: el sistema guarda la observación en el expediente del
 * estudiante.
 */
test('el psicólogo registra una observación y queda guardada en el expediente del estudiante', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0022-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Observaciones CA01',
    edad: 24,
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

  const noteText = `Nota de seguimiento E2E ${Date.now()}`;
  await page.getByPlaceholder('Escribe una observación o nota de seguimiento...').fill(noteText);
  await page.getByRole('button', { name: 'Guardar observación' }).click();

  await expect(page.getByText('Observación guardada correctamente.')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(noteText)).toBeVisible({ timeout: 15_000 });
});
