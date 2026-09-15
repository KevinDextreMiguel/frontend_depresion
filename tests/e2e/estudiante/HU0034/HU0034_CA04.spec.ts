import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0034 — Consentimiento informado específico para salud mental (Ley N.° 29733)
 * CA4 — Registro de evidencia del consentimiento
 * Contexto: el estudiante otorga su consentimiento.
 * Evento: confirma la aceptación.
 * Resultado esperado: el sistema almacena fecha, hora, dirección IP y
 * versión del consentimiento aceptado.
 *
 * `POST /api/admin-ext/consent-accept` (backend/app/routers/extended_features.py)
 * inserta un registro en `consentimiento` con `fecha_aceptacion`,
 * `ip_origen` y `version_documento`. Se usa una cuenta nueva y aislada para
 * garantizar que la evidencia observada corresponde a la aceptación de este
 * mismo test, y se confirma en la sección de Privacidad y Consentimiento.
 */
test('al aceptar el consentimiento de salud mental, el sistema almacena fecha, hora, IP y versión como evidencia', async ({ page, request }) => {
  test.setTimeout(90_000);

  const student = {
    email: uniqueTestEmail('hu0034-ca04'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Evidencia CA04',
    edad: 21,
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

  await completeQuestionnaire(page, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
  await expect(page.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });

  await page.getByRole('link', { name: 'Privacidad', exact: true }).first().click();
  await expect(page.getByText('Privacidad y Consentimiento').first()).toBeVisible({ timeout: 10_000 });

  await expect(page.getByText(/Consentimiento Salud Mental/).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/F\. Aceptación:/).first()).toBeVisible();
  await expect(page.getByText(/IP Origen:/).first()).toBeVisible();
  await expect(page.getByText(/[Vv]ersión/).first()).toBeVisible();
});
