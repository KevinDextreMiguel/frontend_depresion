import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0017 — Interpretabilidad de la predicción
 * CA1 — Visualización de factores
 * Contexto: existe una predicción generada.
 * Evento: el psicólogo consulta el detalle del análisis.
 * Resultado esperado: el sistema muestra las variables con mayor influencia.
 *
 * Se crea una evaluación nueva y se verifica que, desde el panel del
 * psicólogo (historial de un estudiante), aparezca la sección de factores
 * que influyeron en la predicción del modelo (variables de entrada del ML).
 */
test('el psicólogo ve las variables que influyeron en la predicción del estudiante', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0017-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Interpretabilidad CA01',
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

  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Casi siempre', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();

  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  const row = page.locator('tr', { hasText: '#' }).first();
  await row.getByRole('button', { name: 'Ver historial' }).click();

  await expect(
    page.getByText('Factores que influyeron en la predicción (HU0017)').first()
  ).toBeVisible({ timeout: 15_000 });
});
