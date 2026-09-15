import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';

/**
 * HU0034 — Consentimiento informado específico para salud mental (Ley N.° 29733)
 * CA1 — Presentación de consentimiento específico
 * Contexto: el estudiante ingresa por primera vez al módulo de evaluación
 * psicológica.
 * Evento: accede al cuestionario PHQ-9.
 * Resultado esperado: el sistema muestra un consentimiento informado
 * específico para datos de salud mental antes de continuar.
 *
 * Se crea una cuenta nueva y aislada para asegurar que el consentimiento aún
 * no fue aceptado por este estudiante.
 */
test('al iniciar el cuestionario PHQ-9 el estudiante ve un consentimiento informado específico de salud mental', async ({ page, request }) => {
  const student = {
    email: uniqueTestEmail('hu0034-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante HU0034 CA01',
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
  await expect(page.getByText('Ley de Protección de Datos Personales N.° 29733 (Perú)')).toBeVisible();
  await expect(page.getByText(/Autorizo expresamente/)).toBeVisible();
});
