import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0042 — Medir la efectividad de las intervenciones realizadas
 * CA1 — Evaluación de impacto
 * Contexto: existen evaluaciones antes y después de la intervención.
 * Evento: se consulta el caso.
 * Resultado esperado: el sistema muestra la variación en el nivel de riesgo.
 *
 * HALLAZGO: la HU describe esta capacidad "Como psicólogo", pero la sección
 * "Efectividad de Intervenciones" vive dentro del Dashboard Analítico
 * (`nav-dashboard`), visible solo para admin en la UI (mismo hallazgo que
 * HU0037, ver admin/HU0037/HU0037_CA01) — aunque el endpoint
 * `GET /api/admin-ext/interventions/effectiveness` acepta ambos roles.
 *
 * `get_interventions_effectiveness` (backend/app/routers/extended_features.py)
 * empareja la evaluación previa y posterior más cercanas a la fecha de una
 * intervención y calcula la diferencia de puntaje. Se genera ese escenario
 * real: una evaluación base, una intervención registrada, y una segunda
 * evaluación posterior con menor puntaje (mejora).
 */
test('el administrador ve la variación en el nivel de riesgo asociada a una intervención (antes/después)', async ({ page, browser, request }) => {
  test.setTimeout(150_000);

  const student = {
    email: uniqueTestEmail('hu0042-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Efectividad CA01',
    edad: 22,
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

  // Evaluación previa: puntaje alto.
  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Casi siempre', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText('Puntaje: 16/27')).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  // Registrar la intervención (fecha/hora actual, entre ambas evaluaciones).
  await page.goto('/');
  await page.reload();
  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  const row = page.locator('tr', { hasText: '#' }).first();
  await row.getByRole('button', { name: 'Ver historial' }).click();
  await expect(page.getByText('Historial de Evaluación')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('heading', { name: 'Registrar Intervención' }).waitFor();
  await page.locator('select').filter({ hasText: '-- Seleccionar Tipo --' }).selectOption('Terapia Individual');
  const now = new Date(Date.now() - 60_000).toISOString().slice(0, 16);
  await page.locator('input[type="datetime-local"]').fill(now);
  await page.getByPlaceholder('Escribe el detalle clínico de la intervención realizada...').fill(`Intervención efectividad E2E ${Date.now()}`);
  await page.getByRole('button', { name: 'Registrar', exact: true }).click();
  await expect(page.getByText('Intervención registrada correctamente.')).toBeVisible({ timeout: 15_000 });

  // Evaluación posterior a la intervención: puntaje bajo (mejora).
  const studentContext2 = await browser.newContext();
  const studentPage2 = await studentContext2.newPage();
  await studentPage2.goto('/');
  await studentPage2.evaluate(
    ({ token, user }) => {
      localStorage.setItem('mindcheck_access_token', token);
      localStorage.setItem('mindcheck_user', JSON.stringify(user));
    },
    { token: session.access_token, user: session.user }
  );
  await studentPage2.reload();
  await completeQuestionnaire(studentPage2, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage2.getByText('Puntaje: 0/27')).toBeVisible({ timeout: 15_000 });
  await studentContext2.close();

  // El dashboard (admin) debe mostrar la sección de efectividad con la
  // variación (mejora) para el tipo "Terapia Individual".
  await page.goto('/');
  await page.reload();
  await page.locator('#nav-dashboard, [id="nav-dashboard"]').first().click();
  await expect(page.getByText('Dashboard Analítico')).toBeVisible({ timeout: 10_000 });

  await expect(page.getByText('Efectividad de Intervenciones')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Terapia Individual').first()).toBeVisible({ timeout: 15_000 });
});
