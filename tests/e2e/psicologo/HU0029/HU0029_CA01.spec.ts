import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0029 — Notificaciones de nuevos casos críticos
 * CA1 — Notificación automática
 * Contexto: se detecta un nuevo caso crítico.
 * Evento: el sistema clasifica el riesgo como alto.
 * Resultado esperado: el psicólogo recibe una alerta inmediata.
 */
test('el psicólogo recibe una alerta inmediata cuando se clasifica un caso como riesgo alto', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0029-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Notificación CA01',
    edad: 23,
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
  await page.getByTitle('Alertas de casos críticos').click();

  await expect(page.getByText('Alertas de casos críticos').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('No hay alertas críticas activas.')).not.toBeVisible();
});
