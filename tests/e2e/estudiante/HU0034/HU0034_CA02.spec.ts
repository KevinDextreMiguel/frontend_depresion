import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';

/**
 * HU0034 — Consentimiento informado específico para salud mental (Ley N.° 29733)
 * CA2 — Aceptación obligatoria del consentimiento
 * Contexto: el estudiante desea realizar la evaluación.
 * Evento: selecciona "Acepto" y confirma el consentimiento.
 * Resultado esperado: el sistema habilita el acceso al cuestionario
 * psicológico.
 */
test('aceptar el consentimiento de salud mental habilita el acceso al cuestionario', async ({ page, request }) => {
  const student = {
    email: uniqueTestEmail('hu0034-ca02'),
    password: 'TestE2E123!',
    nombre: 'Estudiante HU0034 CA02',
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

  // Sin marcar la casilla de autorización expresa, el sistema no habilita el
  // acceso (validación defensiva del propio criterio "aceptación
  // obligatoria").
  await page.getByRole('button', { name: 'Acepto y Continuar' }).click();
  await expect(page.getByText('Debes dar tu consentimiento expreso para realizar la evaluación.')).toBeVisible();

  await page.getByRole('checkbox', { name: /Autorizo expresamente/i }).check();
  await page.getByRole('button', { name: 'Acepto y Continuar' }).click();

  // Resultado esperado: se habilita el acceso al cuestionario PHQ-9/MSPSS.
  await expect(page.getByText('Consentimiento de Datos de Salud')).not.toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Siguiente Paso' })).toBeVisible({ timeout: 10_000 });
});
