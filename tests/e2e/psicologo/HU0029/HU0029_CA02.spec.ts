import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0029 — Notificaciones de nuevos casos críticos
 * CA2 — Visualización del detalle
 * Contexto: se recibe una alerta.
 * Evento: se abre la notificación.
 * Resultado esperado: el sistema muestra la información relevante del
 * estudiante.
 *
 * El mensaje de la notificación (backend/app/routers/questionnaire.py) ya
 * incluye el nivel de riesgo y el puntaje PHQ-9 del estudiante; se confirma
 * que ese detalle es visible al abrir el panel de alertas.
 */
test('al abrir una notificación, el psicólogo ve información relevante del caso (nivel de riesgo y puntaje)', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0029-ca02'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Detalle Notif CA02',
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

  // 8 items en "Casi siempre" (2 c/u = 16) + ítem 9 "Nunca" (0) = 16/27.
  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Casi siempre', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText('Puntaje: 16/27')).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();
  await page.getByTitle('Alertas de casos críticos').click();

  const notifItem = page.locator('li', { hasText: 'Puntaje PHQ-9: 16/27' }).first();
  await expect(notifItem).toBeVisible({ timeout: 15_000 });
  await expect(notifItem.getByText(/riesgo/i)).toBeVisible();
  await expect(notifItem.getByText(/Puntaje PHQ-9: 16\/27/)).toBeVisible();
});
