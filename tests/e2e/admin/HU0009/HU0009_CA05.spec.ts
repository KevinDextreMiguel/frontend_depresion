import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0009 — Detección de riesgo suicida (CRÍTICA)
 * CA5 — Registro del evento crítico
 * Contexto: se activa el protocolo suicida.
 * Evento: se completa el procesamiento de la evaluación.
 * Resultado esperado: el sistema registra el evento para seguimiento clínico
 * y auditoría.
 *
 * Cuando se activa el protocolo (backend/app/routers/questionnaire.py,
 * bloque "Auditoría de acceso") se escribe una fila en `auditoria_acceso`
 * con accion="activacion_protocolo_suicida" y el detalle (alerta, score,
 * probabilidad ML). Se verifica desde el módulo de Auditoría del Sistema,
 * exclusivo del rol admin (`nav-audit`).
 *
 * Corre en el proyecto "admin" (storageState del administrador).
 */
test('activar el protocolo de riesgo suicida queda registrado como evento auditado para seguimiento clínico', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0009-ca05'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Auditoria Riesgo CA05',
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

  await completeQuestionnaire(studentPage, { phq9Item9Label: 'Siempre' }, request);
  await expect(studentPage.getByRole('alert')).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();
  await page.locator('[data-testid="nav-audit"]').click();
  await expect(page.getByText('Auditoría del Sistema')).toBeVisible({ timeout: 10_000 });

  await page.locator('[data-testid="audit-filter-accion"]').fill('activacion_protocolo_suicida');
  await page.locator('[data-testid="audit-filter-apply-btn"]').click();

  const table = page.locator('[data-testid="audit-log-table"]');
  await expect(table).toBeVisible({ timeout: 15_000 });
  await expect(table.getByText('activacion_protocolo_suicida').first()).toBeVisible({ timeout: 15_000 });
});
