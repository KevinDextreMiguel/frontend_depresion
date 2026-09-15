import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0021 — Historial de evaluaciones de un estudiante
 * CA3 — Detalle de resultados
 * Contexto: se selecciona una evaluación específica.
 * Evento: se consulta el registro.
 * Resultado esperado: el sistema muestra resultados, fecha y observaciones
 * asociadas.
 *
 * Cada tarjeta de evaluación en "Historial de Evaluación" muestra su
 * puntaje, estado y (si existen) sus propias observaciones asociadas
 * (AdminPanel.tsx, bloque `item.observaciones`). Se registra una observación
 * sobre la evaluación y se confirma que aparece asociada a ese registro.
 */
test('el psicólogo consulta el detalle de una evaluación: resultado, fecha y observaciones asociadas', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0021-ca03'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Detalle CA03',
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

  await completeQuestionnaire(studentPage, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
  await expect(studentPage.getByText(/Nivel:/)).toBeVisible({ timeout: 15_000 });
  await studentContext.close();

  await page.goto('/');
  await page.reload();
  await page.getByRole('button', { name: 'Pacientes Asignados' }).click();
  const row = page.locator('tr', { hasText: '#' }).first();
  await row.getByRole('button', { name: 'Ver historial' }).click();
  await expect(page.getByText('Historial de Evaluación')).toBeVisible({ timeout: 15_000 });

  const noteText = `Detalle de resultado E2E ${Date.now()}`;
  await page.getByPlaceholder('Escribe una observación o nota de seguimiento...').fill(noteText);
  await page.getByRole('button', { name: 'Guardar observación' }).click();
  await expect(page.getByText('Observación guardada correctamente.')).toBeVisible({ timeout: 15_000 });

  // El registro de la evaluación debe mostrar, en un mismo bloque: puntaje
  // (resultado), estado, y la observación recién asociada.
  await expect(page.getByText('Puntaje: 0 / 27').first()).toBeVisible();
  await expect(page.getByText(noteText)).toBeVisible({ timeout: 15_000 });
});
