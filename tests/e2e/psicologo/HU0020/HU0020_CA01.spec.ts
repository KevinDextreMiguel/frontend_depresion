import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0020 — Alertas automáticas de casos de alto riesgo
 * CA1 — Generación de alerta
 * Contexto: un estudiante es clasificado con riesgo alto.
 * Evento: se confirma la clasificación.
 * Resultado esperado: el sistema genera una alerta automática al psicólogo
 * asignado.
 *
 * Usa un puntaje alto (moderadamente severo, 16/27) SIN riesgo suicida, para
 * verificar que la alerta se genera por el nivel de riesgo en sí (HU0020),
 * y no por el protocolo específico de suicidio (HU0009).
 */
test('un caso de alto riesgo (no suicida) genera una alerta automática visible para el psicólogo', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0020-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Alto Riesgo CA01',
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

  // 8 items en "Casi siempre" (2 c/u = 16) + ítem 9 en "Nunca" (0) = 16/27,
  // nivel "Moderadamente Severa", sin activar el protocolo de riesgo suicida.
  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Casi siempre', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText('Puntaje: 16/27')).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();
  await page.getByTitle('Alertas de casos críticos').click();

  await expect(page.getByText('No hay alertas críticas activas.')).not.toBeVisible();
});
