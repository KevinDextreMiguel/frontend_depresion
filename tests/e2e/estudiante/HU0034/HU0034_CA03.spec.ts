import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';

/**
 * HU0034 — Consentimiento informado específico para salud mental (Ley N.° 29733)
 * CA3 — Restricción por rechazo del consentimiento
 * Contexto: el estudiante no acepta el consentimiento informado.
 * Evento: intenta continuar con la evaluación (rechaza el consentimiento).
 * Resultado esperado: el sistema bloquea el acceso al cuestionario y muestra
 * un mensaje informativo.
 */
test('rechazar el consentimiento de salud mental bloquea el acceso al cuestionario', async ({ page, request }) => {
  const student = {
    email: uniqueTestEmail('hu0034-ca03'),
    password: 'TestE2E123!',
    nombre: 'Estudiante HU0034 CA03',
    edad: 20,
  };
  const session = await ensureStudentSession(request, student);
  await page.goto('/');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('mindcheck_access_token', token);
      localStorage.setItem('mindcheck_user', JSON.stringify(user));
    },
    { token: session.access_token, user: session.user }
  );
  await page.reload();

  await page.getByText('Nueva Evaluación').first().click();
  await page.getByRole('checkbox', { name: /He leído las instrucciones/i }).check();
  await page.getByRole('button', { name: 'Comenzar evaluación' }).click();

  await expect(page.getByText('Consentimiento de Datos de Salud')).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: 'Rechazar' }).click();

  // Mensaje informativo del rechazo.
  await expect(page.getByText('Has rechazado el consentimiento informado. No es posible iniciar la evaluación.')).toBeVisible();

  // El acceso al cuestionario queda bloqueado: el sistema regresa a la
  // pantalla principal en lugar de abrir el PHQ-9/MSPSS.
  await expect(page.getByRole('button', { name: 'Siguiente Paso' })).not.toBeVisible();
});
