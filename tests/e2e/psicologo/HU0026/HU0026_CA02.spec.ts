import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0026 — Programar sesiones de seguimiento
 * CA2 — Validación de disponibilidad
 * Contexto: el horario ya está ocupado.
 * Evento: el psicólogo intenta agendar.
 * Resultado esperado: el sistema solicita seleccionar otro horario.
 */
test('agendar una sesión en un horario ya ocupado pide seleccionar otro horario', async ({ page, browser, request }) => {
  test.setTimeout(150_000);

  async function makeStudentSession(label: string) {
    const student = {
      email: uniqueTestEmail(label),
      password: 'TestE2E123!',
      nombre: `Estudiante ${label}`,
      edad: 21,
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
    await completeQuestionnaire(sPage, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
    await expect(sPage.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });
    await ctx.close();
  }

  await makeStudentSession('hu0026-ca02-a');
  await makeStudentSession('hu0026-ca02-b');

  await page.goto('/');
  await page.reload();
  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();

  const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  futureDate.setMinutes(0, 0, 0);
  futureDate.setHours(11);
  const isoLocal = futureDate.toISOString().slice(0, 16);

  const rows = page.locator('tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });

  // Primera cita: ocupa el horario.
  await rows.nth(0).getByRole('button', { name: 'Agendar sesión' }).click();
  await page.locator('input[type="datetime-local"]').fill(isoLocal);
  await page.getByRole('button', { name: 'Programar sesión' }).click();
  await expect(page.getByText('Sesión programada correctamente.')).toBeVisible({ timeout: 15_000 });

  // Segunda cita: mismo psicólogo, mismo horario -> debe rechazarse.
  await rows.nth(1).getByRole('button', { name: 'Agendar sesión' }).click();
  await page.locator('input[type="datetime-local"]').fill(isoLocal);
  await page.getByRole('button', { name: 'Programar sesión' }).click();

  await expect(page.getByText(/ocupado.*selecciona otro horario/i)).toBeVisible({ timeout: 15_000 });
});
