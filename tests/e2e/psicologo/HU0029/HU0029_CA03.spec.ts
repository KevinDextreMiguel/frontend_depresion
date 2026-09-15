import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0029 — Notificaciones de nuevos casos críticos
 * CA3 — Confirmación de revisión
 * Contexto: se atiende la alerta.
 * Evento: se marca el caso como revisado.
 * Resultado esperado: el sistema actualiza el estado de la notificación.
 */
test('marcar una alerta como revisada actualiza su estado en el panel de notificaciones', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0029-ca03'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Notificación CA03',
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

  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Siempre', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText('Puntaje: 24/27')).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();
  await page.getByTitle('Alertas de casos críticos').click();

  const item = page.locator('li', { hasText: 'Marcar revisado' }).first();
  await expect(item).toBeVisible({ timeout: 15_000 });
  await item.getByRole('button', { name: 'Marcar revisado' }).click();

  await expect(page.getByText('Caso marcado como revisado.')).toBeVisible({ timeout: 15_000 });
  await expect(item.getByRole('button', { name: 'Marcar revisado' })).toHaveCount(0);
});
