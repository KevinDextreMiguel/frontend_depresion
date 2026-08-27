import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0009 — Detección de riesgo suicida (CRÍTICA)
 * CA3 — Notificación inmediata al profesional
 * Contexto: se detecta una respuesta de riesgo suicida.
 * Evento: se confirma la evaluación.
 * Resultado esperado: el sistema envía una alerta inmediata al psicólogo
 * asignado.
 *
 * Corre en el proyecto "psicologo" (storageState del psicólogo ya
 * autenticado). Se crea una cuenta de estudiante NUEVA y aislada (contexto
 * de navegador separado) para no interferir con otros specs que reutilizan
 * la cuenta de estudiante compartida.
 */
test('un caso con riesgo suicida genera una alerta visible para el psicólogo', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('ca03-riesgo'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Riesgo CA03',
    edad: 22,
  };
  // Contexto aparte para el estudiante (el "page" de este test ya tiene la
  // sesión del psicólogo vía storageState del proyecto).
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

  await completeQuestionnaire(studentPage, { phq9Item9Label: 'Siempre' }, request);
  await expect(studentPage.getByRole('alert')).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  // Vista del psicólogo: el panel de notificaciones hace polling cada 30s;
  // se recarga para no depender de esperar ese intervalo completo.
  await page.goto('/');
  await page.reload();
  await page.getByTitle('Alertas de casos críticos').click();

  await expect(page.getByText('Caso Crítico Detectado').first()).toBeVisible({ timeout: 15_000 });
});
