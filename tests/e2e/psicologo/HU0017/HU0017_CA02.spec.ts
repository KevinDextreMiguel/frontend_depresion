import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0017 — Interpretabilidad de la predicción
 * CA2 — Interpretabilidad del modelo
 * Contexto: se revisa un resultado específico.
 * Evento: se accede al informe predictivo.
 * Resultado esperado: el sistema presenta una explicación clara y
 * comprensible.
 *
 * Además de listar las variables (HU0017 CA1), la sección de
 * interpretabilidad incluye una nota aclaratoria en lenguaje sencillo sobre
 * cómo se construyó la explicación (AdminPanel.tsx, bloque
 * `item.interpretabilidad`).
 */
test('el psicólogo ve una explicación clara y comprensible del resultado de la predicción', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0017-ca02'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Interpretabilidad CA02',
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

  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Casi siempre', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();

  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  const row = page.locator('tr', { hasText: '#' }).first();
  await row.getByRole('button', { name: 'Ver historial' }).click();

  await expect(page.getByText('Factores que influyeron en la predicción (HU0017)').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Predicción del modelo:/).first()).toBeVisible();
  await expect(page.getByText(/explicación basada en las variables de entrada del modelo/i).first()).toBeVisible();
});
