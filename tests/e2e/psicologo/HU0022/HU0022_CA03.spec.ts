import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0022 — Observaciones y notas de seguimiento
 * CA3 — Historial de seguimiento
 * Contexto: existen múltiples notas.
 * Evento: se revisa el expediente.
 * Resultado esperado: el sistema muestra el historial completo de
 * observaciones.
 *
 * Se registran dos observaciones distintas sobre el mismo estudiante y se
 * confirma que ambas quedan visibles simultáneamente en el expediente
 * (lista `item.observaciones`, AdminPanel.tsx).
 */
test('el psicólogo revisa el expediente y ve el historial completo de todas las observaciones registradas', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0022-ca03'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Historial Obs CA03',
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

  const noteA = `Primera nota de seguimiento E2E ${Date.now()}`;
  await page.getByPlaceholder('Escribe una observación o nota de seguimiento...').fill(noteA);
  await page.getByRole('button', { name: 'Guardar observación' }).click();
  await expect(page.getByText('Observación guardada correctamente.')).toBeVisible({ timeout: 15_000 });

  const noteB = `Segunda nota de seguimiento E2E ${Date.now()}`;
  await page.getByPlaceholder('Escribe una observación o nota de seguimiento...').fill(noteB);
  await page.getByRole('button', { name: 'Guardar observación' }).click();
  await expect(page.getByText('Observación guardada correctamente.')).toBeVisible({ timeout: 15_000 });

  await expect(page.getByText('Observaciones').first()).toBeVisible();
  await expect(page.getByText(noteA)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(noteB)).toBeVisible({ timeout: 15_000 });
});
