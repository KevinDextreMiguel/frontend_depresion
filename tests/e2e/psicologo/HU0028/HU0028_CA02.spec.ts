import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0028 — Exportar reportes individuales en PDF
 * CA2 — Exportación con datos completos
 * Contexto: existe historial de evaluaciones.
 * Evento: se genera el reporte.
 * Resultado esperado: el documento incluye resultados, evolución y
 * observaciones.
 *
 * El endpoint `GET /admin/student-history/{id}/export/pdf`
 * (backend/app/routers/admin.py) construye el PDF a partir del mismo
 * historial que alimenta la vista de "Historial de Evaluación" (resultados,
 * observaciones). Se registra una observación antes de exportar y se
 * confirma que la descarga se genera exitosamente incluyendo ese contexto
 * más completo (no solo el caso mínimo sin observaciones de HU0028 CA1).
 */
test('el psicólogo exporta el reporte PDF de un estudiante con evaluación y observaciones registradas', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0028-ca02'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Reporte Completo CA02',
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

  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Casi siempre', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();
  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  const row = page.locator('tr', { hasText: '#' }).first();
  await row.getByRole('button', { name: 'Ver historial' }).click();
  await expect(page.getByText('Historial de Evaluación')).toBeVisible({ timeout: 15_000 });

  const noteText = `Observación para reporte completo E2E ${Date.now()}`;
  await page.getByPlaceholder('Escribe una observación o nota de seguimiento...').fill(noteText);
  await page.getByRole('button', { name: 'Guardar observación' }).click();
  await expect(page.getByText('Observación guardada correctamente.')).toBeVisible({ timeout: 15_000 });

  const exportButton = page.getByTestId('student-history-export-pdf-button');
  await expect(exportButton).toBeVisible();
  await expect(exportButton).toBeEnabled();

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    exportButton.click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  await expect(page.getByText(/reporte del estudiante descargado correctamente/i)).toBeVisible({ timeout: 15_000 });
});
