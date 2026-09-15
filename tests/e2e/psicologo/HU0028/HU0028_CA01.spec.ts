import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0028 — Exportar reportes individuales en PDF
 * CA1 — Exportación en PDF
 * Contexto: el psicólogo selecciona un estudiante que tiene asignado.
 * Evento: solicita exportar el reporte.
 * Resultado esperado: el sistema genera un archivo PDF descargable.
 *
 * Se agregó el endpoint `GET /admin/student-history/{anon_student_id}/export/pdf`
 * (backend/app/routers/admin.py), disponible para admin y para el
 * psicólogo con acceso al caso (reutiliza `_assert_student_in_scope`), y un
 * botón "Exportar PDF" en el expediente del estudiante dentro de "Reportes
 * de Estudiantes" (AdminPanel.tsx). El otro test en admin/HU0028 cubre la
 * exportación consolidada (solo admin); este cubre la exportación
 * individual desde la perspectiva del psicólogo.
 */
test('el psicólogo exporta el reporte PDF individual de un estudiante asignado', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0028-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Reporte PDF CA01',
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

  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();

  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  const row = page.locator('tr', { hasText: '#' }).first();
  await row.getByRole('button', { name: 'Ver historial' }).click();

  await expect(page.getByText('Historial de Evaluación')).toBeVisible({ timeout: 15_000 });

  const exportButton = page.getByTestId('student-history-export-pdf-button');
  await expect(exportButton).toBeVisible();
  await expect(exportButton).toBeEnabled();

  await exportButton.click();
  await expect(page.getByText(/reporte del estudiante descargado correctamente/i)).toBeVisible({ timeout: 15_000 });
});
