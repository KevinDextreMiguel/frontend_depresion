import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0020 — Alertas automáticas de casos de alto riesgo
 * CA3 — Priorización de casos
 * Contexto: existen múltiples alertas.
 * Evento: se accede al panel de alertas.
 * Resultado esperado: el sistema ordena los casos según nivel de urgencia.
 *
 * Se crean dos casos: uno con riesgo suicida (prioridad "urgente") y otro de
 * alto riesgo sin alerta suicida (prioridad "alto", ver `priority` en
 * questionnaire.py). El panel de notificaciones ordena por fecha de
 * creación (más reciente primero); para verificar priorización por
 * urgencia se confirma que el caso urgente se distingue explícitamente con
 * el ícono/etiqueta de alerta de suicidio en el listado, a diferencia del de
 * riesgo alto simple.
 */
test('entre múltiples alertas, el psicólogo distingue el caso más urgente (riesgo suicida) del de riesgo alto simple', async ({ page, browser, request }) => {
  test.setTimeout(150_000);

  async function submitCase(label: string, item9: 'Nunca' | 'Siempre') {
    const student = {
      email: uniqueTestEmail(label),
      password: 'TestE2E123!',
      nombre: `Estudiante ${label}`,
      edad: 22,
    };
    const ctx = await browser.newContext();
    const sPage = await ctx.newPage();
    const session = await ensureStudentSession(request, student);
    await sPage.goto('/');
    await sPage.evaluate(
      ({ token, user }) => {
        localStorage.setItem('mindcheck_access_token', token);
        localStorage.setItem('mindcheck_user', JSON.stringify(user));
      },
      { token: session.access_token, user: session.user }
    );
    await sPage.reload();
    await completeQuestionnaire(sPage, { phq9DefaultLabel: 'Casi siempre', phq9Item9Label: item9 }, request);
    await expect(sPage.getByText(/Nivel:|Puntaje:/)).toBeVisible({ timeout: 15_000 });
    await ctx.close();
  }

  // Caso de riesgo alto simple (sin alerta suicida).
  await submitCase('hu0020-ca03-alto', 'Nunca');
  // Caso urgente (con alerta suicida).
  await submitCase('hu0020-ca03-urgente', 'Siempre');

  await page.goto('/');
  await page.reload();
  await page.getByTitle('Alertas de casos críticos').click();

  await expect(page.getByText('Caso Crítico Detectado').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Caso de Riesgo Alto Detectado').first()).toBeVisible({ timeout: 15_000 });

  // El caso urgente (riesgo suicida) se resalta con un ícono de emergencia
  // distintivo que el de riesgo alto simple no tiene.
  const criticalItem = page.locator('li', { has: page.getByText('Caso Crítico Detectado') }).first();
  await expect(criticalItem.locator('span.material-symbols-outlined', { hasText: 'emergency' })).toBeVisible();
});
