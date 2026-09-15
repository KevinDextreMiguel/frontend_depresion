import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0025 — Filtrar estudiantes por nivel de riesgo
 * CA2 — Filtro múltiple
 * Contexto: se seleccionan varios niveles de riesgo.
 * Evento: se aplican los filtros.
 * Resultado esperado: el sistema muestra los resultados combinados.
 *
 * `assignedRiskFilters` es un arreglo (AdminPanel.tsx): cada botón de nivel
 * de riesgo alterna su inclusión, y el filtrado del backend combina todos
 * los niveles seleccionados. Se crean un caso "Severo" y otro "Mínimo" y se
 * confirma que, al activar ambos filtros a la vez, aparecen los dos.
 */
test('el psicólogo combina varios niveles de riesgo en el filtro y ve los resultados combinados', async ({ page, browser, request }) => {
  test.setTimeout(150_000);

  async function submitCase(label: string, phq9Label: 'Nunca' | 'Siempre') {
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
    await completeQuestionnaire(sPage, { phq9DefaultLabel: phq9Label, phq9Item9Label: 'Nunca' }, request);
    await expect(sPage.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });
    await ctx.close();
  }

  await submitCase('hu0025-ca02-minimo', 'Nunca');
  await submitCase('hu0025-ca02-severo', 'Siempre');

  await page.goto('/');
  await page.reload();
  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  await expect(page.locator('tr', { hasText: '#' }).first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Severo' }).click();
  await page.getByRole('button', { name: 'Mínimo' }).click();

  const rows = page.locator('tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  const bodyText = (await page.locator('tbody').innerText()).toLowerCase();
  expect(bodyText).toContain('severo');
  expect(bodyText).toContain('minimo');
});
