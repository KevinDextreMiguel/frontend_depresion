import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0044 — Auditorías del modelo predictivo de Machine Learning
 * CA2 — Registro de predicciones
 * Contexto: el modelo procesa evaluaciones.
 * Evento: genera una clasificación de riesgo.
 * Resultado esperado: el sistema almacena el identificador de predicción,
 * versión del modelo y resultado obtenido.
 *
 * Cada envío del cuestionario PHQ-9 inserta una fila en `auditoria_model_ml`
 * con tipo_evento="prediccion", `id_prediccion` (el id del resultado),
 * `model_version` y `resultado_prediccion` (backend/app/routers/questionnaire.py,
 * bloque "Auditoría de Inferencia ML"). Se completa una evaluación en un
 * contexto de estudiante aparte (para no perder la sesión admin de este
 * proyecto) y se confirma, desde el panel "Auditoría ML & Métricas" del
 * administrador, que aparece un nuevo registro de tipo "Predicción".
 */
test('al procesar una evaluación, el sistema registra la predicción como evento auditado del modelo', async ({ page, browser, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0044-ca02'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Auditoria Prediccion CA02',
    edad: 21,
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
  await page.locator('#nav-mlaudit, [id="nav-mlaudit"]').first().click();
  await expect(page.getByText('Auditoría ML & Métricas')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Registro de Auditoría (Reentrenamientos)')).toBeVisible({ timeout: 15_000 });

  await expect(page.getByText('Predicción').first()).toBeVisible({ timeout: 15_000 });
});
