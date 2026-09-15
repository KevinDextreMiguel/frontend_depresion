import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0020 — Alertas automáticas de casos de alto riesgo
 * CA2 — Notificación inmediata
 * Contexto: se genera una alerta crítica.
 * Evento: se detecta el caso.
 * Resultado esperado: el sistema envía una notificación en tiempo real.
 *
 * La notificación se crea de forma síncrona al procesar el envío del
 * cuestionario (backend/app/routers/questionnaire.py) y el panel del
 * psicólogo consulta `GET /api/admin/notifications` (con polling cada 30s,
 * ver `notificationsInterval` en AdminPanel.tsx). Se verifica que, sin
 * esperar el intervalo completo, una recarga inmediata ya refleja la nueva
 * alerta con su mensaje.
 */
test('el psicólogo recibe la notificación de un caso de alto riesgo de forma inmediata al recargar', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0020-ca02'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Notif Inmediata CA02',
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
  await expect(studentPage.getByText('Puntaje: 16/27')).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();
  await page.getByTitle('Alertas de casos críticos').click();

  await expect(page.getByText(/Caso de Riesgo Alto Detectado/).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Puntaje PHQ-9: 16\/27/).first()).toBeVisible();
});
