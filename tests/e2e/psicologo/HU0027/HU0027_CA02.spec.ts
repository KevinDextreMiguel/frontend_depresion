import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0027 — Registro de intervenciones realizadas
 * CA2 — Edición de intervención
 * Contexto: se requiere actualizar un registro.
 * Evento: se modifica la información.
 * Resultado esperado: el sistema guarda los cambios.
 *
 * `PUT /api/admin/interventions/{id}` (backend/app/routers/admin.py)
 * permite actualizar una intervención ya registrada.
 */
test('el psicólogo edita una intervención ya registrada y el sistema guarda los cambios', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0027-ca02'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Edicion Intervencion CA02',
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
  await row.getByRole('button', { name: 'Ver historial' }).click();
  await expect(page.getByText('Historial de Evaluación')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('heading', { name: 'Registrar Intervención' }).waitFor();
  await page.locator('select').filter({ hasText: '-- Seleccionar Tipo --' }).selectOption('Terapia Individual');
  await page.locator('input[type="datetime-local"]').fill('2026-10-01T10:00');
  const originalDescription = `Detalle original E2E ${Date.now()}`;
  await page.getByPlaceholder('Escribe el detalle clínico de la intervención realizada...').fill(originalDescription);
  await page.getByRole('button', { name: 'Registrar', exact: true }).click();
  await expect(page.getByText('Intervención registrada correctamente.')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(originalDescription)).toBeVisible();

  const editedDescription = `Detalle editado E2E ${Date.now()}`;
  const interventionCard = page.locator('div', { hasText: originalDescription }).filter({ has: page.getByRole('button', { name: 'Editar' }) }).last();
  await interventionCard.getByRole('button', { name: 'Editar' }).click();

  await expect(page.getByRole('heading', { name: 'Editar Intervención' })).toBeVisible({ timeout: 10_000 });
  const descriptionField = page.getByPlaceholder('Escribe el detalle clínico de la intervención realizada...');
  await expect(descriptionField).toHaveValue(originalDescription);
  await descriptionField.fill(editedDescription);
  await page.getByRole('button', { name: 'Actualizar' }).click();

  await expect(page.getByText(/actualizada correctamente/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(editedDescription)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(originalDescription)).toHaveCount(0);
});
