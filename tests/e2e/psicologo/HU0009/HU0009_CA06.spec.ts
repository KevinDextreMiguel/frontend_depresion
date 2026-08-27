import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0009 — Detección de riesgo suicida (CRÍTICA)
 * CA6 — Priorización de casos críticos
 * Contexto: existen múltiples alertas activas.
 * Evento: el psicólogo accede al panel de seguimiento.
 * Resultado esperado: el sistema prioriza los casos con riesgo suicida
 * detectado.
 *
 * Se verifica que un caso recién creado con alerta de suicidio aparece en la
 * sección "Alertas Críticas Recientes" marcado explícitamente como
 * "Urgente" — la máxima prioridad del sistema (`nivel_prioridad === "urgente"`).
 */
test('un caso con riesgo suicida aparece marcado como Urgente en el panel del psicólogo', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('ca06-prioridad'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Prioridad CA06',
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

  await completeQuestionnaire(studentPage, { phq9Item9Label: 'Siempre' }, request);
  await expect(studentPage.getByRole('alert')).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();

  const alertsSection = page.locator('div', { has: page.getByRole('heading', { name: 'Alertas Críticas Recientes' }) }).first();
  await expect(alertsSection.getByText('Urgente').first()).toBeVisible({ timeout: 15_000 });
});
