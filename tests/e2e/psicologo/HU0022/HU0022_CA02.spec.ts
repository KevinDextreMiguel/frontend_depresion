import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0022 — Observaciones y notas de seguimiento
 * CA2 — Edición de notas
 * Contexto: se requiere actualizar una observación.
 * Evento: se modifica el registro.
 * Resultado esperado: el sistema actualiza la información correctamente.
 *
 * `PUT /api/admin/observations/{id}` (backend/app/routers/admin.py) permite
 * editar el texto de una observación existente. En la UI, el botón
 * "Editar" de cada nota carga su texto en el formulario
 * (`handleEditObservation`) y "Actualizar observación" confirma el cambio.
 */
test('el psicólogo edita una observación existente y el sistema actualiza la información', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0022-ca02'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Edicion Obs CA02',
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

  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();
  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  const row = page.locator('tr', { hasText: '#' }).first();
  await row.getByRole('button', { name: 'Ver historial' }).click();
  await expect(page.getByText('Historial de Evaluación')).toBeVisible({ timeout: 15_000 });

  const originalText = `Nota original E2E ${Date.now()}`;
  await page.getByPlaceholder('Escribe una observación o nota de seguimiento...').fill(originalText);
  await page.getByRole('button', { name: 'Guardar observación' }).click();
  await expect(page.getByText('Observación guardada correctamente.')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(originalText)).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Editar' }).first().click();
  const textarea = page.getByPlaceholder('Escribe una observación o nota de seguimiento...');
  await expect(textarea).toHaveValue(originalText);

  const editedText = `Nota editada E2E ${Date.now()}`;
  await textarea.fill(editedText);
  await page.getByRole('button', { name: 'Actualizar observación' }).click();

  await expect(page.getByText('Observación actualizada correctamente.')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(editedText)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(originalText)).toHaveCount(0);
});
